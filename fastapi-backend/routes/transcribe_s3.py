from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from services.s3_service import process_file_from_s3

router = APIRouter()

# Define request schema
class Parameter(BaseModel):
    id: str
    name: str
    description: str

class S3ProcessRequest(BaseModel):
    s3_url: str
    submission_id: str
    hackathon_id: str
    parameters: List[Parameter]  # List of evaluation parameters

@router.post("/transcribe_s3/")
async def transcribe_s3_file(request: S3ProcessRequest):
    """
    API to transcribe text from an S3 file, linking it to a submission.
    """
    try:
        extracted_text = process_file_from_s3(
            request.s3_url,
            request.submission_id,
            request.hackathon_id,
            request.parameters
        )

        return {
            "status": "success",
            "submission_id": request.submission_id,
            "hackathon_id": request.hackathon_id,
            "extracted_text": extracted_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
