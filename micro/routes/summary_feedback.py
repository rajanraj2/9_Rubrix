from fastapi import APIRouter
from pydantic import BaseModel
from services.smry_fdbk import generate_summary_feedback_llama

router = APIRouter()

class FeedbackRequest(BaseModel):
    problem_statement: str
    student_submission: str
    parameter_definitions: dict  # Dictionary containing parameter names & descriptions

@router.post("/generate_summary_feedback/")
def generate_summary_feedback(request: FeedbackRequest):
    """
    API endpoint to generate both a **summary** and **constructive feedback**
    for a student's submission using LLaMA 3.
    """
    try:
        summary, feedback = generate_summary_feedback_llama(
            request.problem_statement, 
            request.student_submission, 
            request.parameter_definitions
        )

        return {
            "status": "success",
            "summary": summary,
            "feedback": feedback
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
