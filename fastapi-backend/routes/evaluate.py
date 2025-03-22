from fastapi import APIRouter
from services.evaluation import compute_similarity, parameter_based_evaluation

router = APIRouter()

@router.post("/submission/")
def evaluate_submission(student_text: str, ideal_text: str):
    """
    Evaluates a student’s submission based on cosine similarity and rule-based scoring.
    """
    similarity_score = compute_similarity(student_text, ideal_text)
    parameter_scores = parameter_based_evaluation(student_text)

    return {
        "cosine_similarity": similarity_score,
        "parameter_scores": parameter_scores
    }
