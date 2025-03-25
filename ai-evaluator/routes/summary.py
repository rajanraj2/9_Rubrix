from fastapi import APIRouter
from pydantic import BaseModel
from services.summariser import generate_summary

router = APIRouter()

class SummaryRequest(BaseModel):
    problem_statement: str
    student_submission: str

@router.post("/", summary="Generate summary", description="Generate a summary of a student submission using a local BART model")
def get_summary(request: SummaryRequest):
    """
    Generates a summary of the student submission using a local BART model.
    """
    summary = generate_summary(request.student_submission)
    return {"status": "success", "summary": summary}
