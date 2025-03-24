import os
import boto3
import tempfile
import logging
from typing import List, Dict, Any, Optional, Tuple
from services.transcription import extract_text
from services.evaluation_service import evaluate_submission_content
from dotenv import load_dotenv
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Retrieve AWS credentials from environment variables
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp")

# Ensure temp directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

def parse_s3_url(s3_url: str) -> Tuple[str, str]:
    """
    Parse an S3 URL to extract bucket name and file key.
    Handles various S3 URL formats and presigned URLs.
    
    Args:
        s3_url: S3 URL to parse
        
    Returns:
        Tuple containing (bucket_name, file_key)
    """
    try:
        # Handle presigned URLs by removing query parameters
        if "?" in s3_url:
            s3_url = s3_url.split("?")[0]
            
        # Handle s3:// protocol
        if s3_url.startswith('s3://'):
            parts = s3_url[5:].split('/', 1)
            bucket = parts[0]
            key = parts[1] if len(parts) > 1 else ''
            return bucket, key
        
        # Handle https:// protocol
        parsed_url = urlparse(s3_url)
        
        # Handle paths like s3://bucket-name/key
        if parsed_url.scheme == "s3":
            bucket_name = parsed_url.netloc
            file_key = parsed_url.path.lstrip('/')
            return bucket_name, file_key
            
        # Handle paths like https://bucket-name.s3.amazonaws.com/key
        elif ".s3." in parsed_url.netloc:
            bucket_name = parsed_url.netloc.split(".s3.")[0]
            file_key = parsed_url.path.lstrip('/')
            return bucket_name, file_key
            
        # Handle paths like https://s3.amazonaws.com/bucket-name/key
        elif parsed_url.netloc == "s3.amazonaws.com":
            path_parts = parsed_url.path.lstrip('/').split('/', 1)
            bucket_name = path_parts[0]
            file_key = path_parts[1] if len(path_parts) > 1 else ""
            return bucket_name, file_key
            
        # Handle other formats (virtual-hosted style)
        elif parsed_url.netloc.endswith('amazonaws.com'):
            bucket_name = parsed_url.netloc.split('.')[0]
            file_key = parsed_url.path.lstrip('/')
            return bucket_name, file_key
            
        else:
            raise ValueError(f"Invalid S3 URL format: {s3_url}")
            
    except Exception as e:
        logger.error(f"Error parsing S3 URL {s3_url}: {e}")
        raise ValueError(f"Invalid S3 URL: {s3_url}") from e

def download_from_s3(s3_url: str, local_path: Optional[str] = None) -> Tuple[str, str]:
    """
    Downloads a file from S3 and saves it to a temporary directory.
    
    Args:
        s3_url: S3 URL of the file
        local_path: Optional local path to save the file
        
    Returns:
        Tuple containing (local_file_path, file_extension)
    """
    try:
        # Parse the S3 URL
        bucket_name, file_key = parse_s3_url(s3_url)
        
        # Try to get object metadata
        try:
            response = s3_client.head_object(Bucket=bucket_name, Key=file_key)
            content_type = response.get('ContentType', 'application/octet-stream')
        except Exception as e:
            logger.warning(f"Could not get metadata for {file_key}: {e}")
            content_type = 'application/octet-stream'
            
        # Get filename from key
        filename = os.path.basename(file_key)
        if not filename:
            # Generate a random filename if none is provided
            import uuid
            filename = f"download_{uuid.uuid4()}"
        
        # Determine file extension
        ext = os.path.splitext(filename)[1]
        if not ext and '.' in filename:
            ext = f".{filename.split('.')[-1]}"
        
        # Generate local path if not provided
        if not local_path:
            local_path = os.path.join(TEMP_DIR, filename)
            
        # Ensure the directory exists
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # Download file from S3
        logger.info(f"Downloading {file_key} from bucket {bucket_name} to {local_path}")
        s3_client.download_file(bucket_name, file_key, local_path)
        
        # Get file extension without the dot
        file_ext = ext.lstrip('.').lower() if ext else ''
        
        return local_path, file_ext
        
    except Exception as e:
        logger.error(f"Error downloading from S3: {str(e)}")
        raise Exception(f"Failed to download file from S3: {str(e)}")

async def process_file_from_s3(
    s3_url: Optional[str], 
    submission_id: str, 
    hackathon_id: str, 
    parameters: List[Any],
    submission_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process a file from an S3 URL and return extracted text and evaluation results.
    
    Args:
        s3_url: URL of the file in S3
        submission_id: ID of the submission
        hackathon_id: ID of the hackathon
        parameters: Parameters to evaluate against
        submission_text: Optional text content for evaluation
        
    Returns:
        Dictionary containing extracted text and evaluation results
    """
    try:
        # Initialize variables for evaluation content
        extracted_text = ""
        text_for_evaluation = ""
        
        # Extract text from file if s3_url is provided
        if s3_url:
            # Download file from S3
            local_file_path = await download_file_from_s3(s3_url)
            
            if not local_file_path or not os.path.exists(local_file_path):
                return {
                    "success": False,
                    "extracted_text": f"Error: Failed to download file from {s3_url}",
                    "parameter_scores": {},
                    "overall_score": 0
                }
            
            # Extract text from file
            extracted_text = extract_text(local_file_path)
            
            # Clean up the temporary file
            try:
                os.remove(local_file_path)
            except Exception as e:
                logging.error(f"Error removing temporary file {local_file_path}: {str(e)}")
        
        # Determine what text to use for evaluation
        if extracted_text and submission_text:
            # If both are available, use a combination
            text_for_evaluation = f"{extracted_text}\n\n{submission_text}"
        elif extracted_text:
            # If only file text is available
            text_for_evaluation = extracted_text
        elif submission_text:
            # If only submission text is available
            text_for_evaluation = submission_text
        else:
            # No text available for evaluation
            return {
                "success": False,
                "extracted_text": "Error: No text content available for evaluation",
                "parameter_scores": {},
                "overall_score": 0
            }
        
        # Evaluate the text content
        eval_result = await evaluate_submission_content(
            text_for_evaluation, 
            parameters, 
            submission_id, 
            hackathon_id
        )
        
        # Return the evaluation results with the appropriate text content
        return {
            "success": True,
            "extracted_text": text_for_evaluation,
            "parameter_scores": eval_result.get("parameter_scores", {}),
            "overall_score": eval_result.get("overall_score", 0),
            "summary_feedback": eval_result.get("summary_feedback", {})
        }
        
    except Exception as e:
        error_msg = f"Error processing file from S3: {str(e)}"
        logging.error(error_msg)
        return {
            "success": False,
            "extracted_text": f"Error: {error_msg}",
            "parameter_scores": {},
            "overall_score": 0
        }
