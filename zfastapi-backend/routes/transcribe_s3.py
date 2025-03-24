from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, validator
from typing import List, Dict, Any, Optional
import logging
import os
from services.s3_service import process_file_from_s3, download_from_s3
from services.evaluation_service import format_evaluation_results
from services.transcription import extract_text
from utils.db_connector import get_evaluation_by_submission_id

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Define request schemas
class Parameter(BaseModel):
    id: str
    name: str
    description: str

class S3ProcessRequest(BaseModel):
    s3_url: Optional[str] = None
    submission_id: str
    hackathon_id: str
    parameters: List[Parameter]  # List of evaluation parameters
    submission_text: Optional[str] = None
    
    @validator('s3_url')
    def validate_s3_url(cls, v, values):
        # Skip validation if s3_url is None (text-only submission)
        if v is None:
            # Ensure submission_text is provided if s3_url is None
            if 'submission_text' not in values or not values['submission_text']:
                raise ValueError('Either s3_url or submission_text must be provided')
            return v
            
        # Basic validation for S3 URLs
        if not (v.startswith('http') or v.startswith('s3://')):
            raise ValueError('Invalid S3 URL format')
        return v
        
    @validator('submission_text', always=True)
    def validate_content(cls, v, values):
        # Ensure either s3_url or submission_text is provided
        if not v and ('s3_url' not in values or not values['s3_url']):
            raise ValueError('Either s3_url or submission_text must be provided')
        return v

class S3TranscribeRequest(BaseModel):
    s3_url: str
    
    @validator('s3_url')
    def validate_s3_url(cls, v):
        # Basic validation for S3 URLs
        if not (v.startswith('http') or v.startswith('s3://')):
            raise ValueError('Invalid S3 URL format')
        return v

@router.post("/transcribe_and_evaluate/")
async def transcribe_evaluate_s3_file(request: S3ProcessRequest, background_tasks: BackgroundTasks = None):
    """
    Transcribe and evaluate a submission from S3 or direct text content.
    Both file-based submissions and text-only submissions are supported.
    The evaluation results are stored in MongoDB for future reference.
    
    Args:
        request: The request object containing S3 URL, submission details, and parameters
        background_tasks: Optional background tasks
        
    Returns:
        Dictionary containing evaluation results, extracted text, and summary/feedback
    """
    try:
        # Check if evaluation already exists for this submission
        existing_eval = await get_evaluation_by_submission_id(request.submission_id)
        
        if existing_eval:
            # Format the existing evaluation for API response
            return {
                "status": "success",
                "message": "Evaluation already exists for this submission",
                "submission_id": request.submission_id,
                "hackathon_id": request.hackathon_id,
                "overall_score": existing_eval.get("overall_score", 0),
                "parameter_scores": existing_eval.get("parameter_scores", {}),
                "summary_feedback": existing_eval.get("summary_feedback", {})
            }
        
        # Process submission (file or text)
        result = await process_file_from_s3(
            s3_url=request.s3_url,
            submission_id=request.submission_id,
            hackathon_id=request.hackathon_id,
            parameters=request.parameters,
            submission_text=request.submission_text
        )
        
        # Check if extraction/processing was successful
        if not result.get("success", False):
            return {
                "status": "error",
                "message": "Failed to process submission",
                "submission_id": request.submission_id,
                "hackathon_id": request.hackathon_id,
                "error": result.get("extracted_text", "Unknown error")
            }
        
        # Format the evaluation results for API response
        formatted_result = format_evaluation_results(
            submission_id=request.submission_id,
            hackathon_id=request.hackathon_id,
            parameter_scores=result.get("parameter_scores", {}),
            overall_score=result.get("overall_score", 0)
        )
        
        # Include the summary and feedback in the response
        return {
            "status": "success",
            **formatted_result,
            "extracted_text": result.get("extracted_text", ""),
            "summary_feedback": result.get("summary_feedback", {})
        }

    except Exception as e:
        logging.error(f"Error processing submission: {str(e)}")
        return {
            "status": "error",
            "message": f"Error processing submission: {str(e)}",
            "submission_id": request.submission_id,
            "hackathon_id": request.hackathon_id
        }

@router.get("/evaluation/{submission_id}")
async def get_evaluation(submission_id: str):
    """
    Get the evaluation results for a specific submission
    """
    try:
        evaluation = await get_evaluation_by_submission_id(submission_id)
        
        if not evaluation:
            logger.warning(f"No evaluation found for submission ID: {submission_id}")
            raise HTTPException(status_code=404, detail=f"No evaluation found for submission ID: {submission_id}")
        
        # Format the evaluation results for API response
        formatted_result = format_evaluation_results(
            submission_id=evaluation["submission_id"],
            hackathon_id=evaluation["hackathon_id"],
            parameter_scores=evaluation["parameter_scores"],
            overall_score=evaluation["overall_score"]
        )
        
        return {
            "status": "success",
            **formatted_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving evaluation: {str(e)}")

@router.post("/transcribe_s3/")
async def transcribe_s3_file(request: S3TranscribeRequest):
    """
    API to transcribe text from an S3 file without evaluation.
    Supports all file types including videos.
    """
    local_file_path = None
    
    try:
        # Download file from S3 using the improved download function
        logger.info(f"Downloading file from S3: {request.s3_url}")
        local_file_path, file_ext = download_from_s3(request.s3_url)
        
        # Extract text from file using existing transcription logic
        logger.info(f"Extracting text from file type: {file_ext}")
        extracted_text = extract_text(local_file_path, file_ext)
        
        if extracted_text.startswith("Error"):
            logger.error(f"Text extraction failed: {extracted_text}")
            return {
                "status": "error",
                "message": "Failed to extract text from file",
                "error": extracted_text
            }
        
        # Get filename from the S3 URL
        filename = os.path.basename(request.s3_url.split("?")[0])
        
        logger.info(f"Successfully transcribed file: {filename}")
        return {
            "status": "success",
            "filename": filename,
            "file_type": file_ext,
            "extracted_text": extracted_text
        }

    except Exception as e:
        logger.error(f"Error transcribing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error transcribing file: {str(e)}")
    finally:
        # Clean up temporary files
        if local_file_path and os.path.exists(local_file_path):
            try:
                os.remove(local_file_path)
                # Also remove any potential temp audio file from video processing
                audio_temp_path = f"{local_file_path}_temp_audio.wav"
                if os.path.exists(audio_temp_path):
                    os.remove(audio_temp_path)
            except Exception as e:
                logger.error(f"Error cleaning up temporary files: {str(e)}")
