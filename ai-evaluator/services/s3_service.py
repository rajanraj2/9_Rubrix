import os
import boto3
import tempfile
from services.transcription import extract_text
from dotenv import load_dotenv
from typing import List, Dict

# Load environment variables from .env file
load_dotenv()

# Retrieve AWS credentials from environment variables
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

def download_from_s3(s3_url: str) -> str:
    """
    Downloads a file from S3 and saves it to a temporary directory.
    Returns the local file path.
    """
    bucket_name = s3_url.split('/')[2]  # Extract bucket name
    file_key = "/".join(s3_url.split('/')[3:])  # Extract file key

    temp_dir = tempfile.mkdtemp()
    local_file_path = os.path.join(temp_dir, file_key.split("/")[-1])  # Extract filename

    # Download file from S3
    s3_client.download_file(bucket_name, file_key, local_file_path)
    return local_file_path

def process_file_from_s3(s3_url: str, submission_id: str, hackathon_id: str, parameters: List[Dict[str, str]]) -> str:
    """
    Handles text extraction from an S3 file, linking it to a submission and evaluation parameters.
    """
    local_file_path = download_from_s3(s3_url)
    file_ext = local_file_path.split('.')[-1].lower()

    extracted_text = extract_text(local_file_path, file_ext)

    # Cleanup: Delete temp file after processing
    if os.path.exists(local_file_path):
        os.remove(local_file_path)

    # Add metadata for better tracking (optional)
    metadata = {
        "submission_id": submission_id,
        "hackathon_id": hackathon_id,
        "parameters": parameters,
        "extracted_text": extracted_text
    }

    return extracted_text  # Return extracted text only
