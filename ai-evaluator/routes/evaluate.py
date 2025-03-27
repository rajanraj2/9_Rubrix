from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from services.evaluate_similarity import compute_similarity, generate_embedding
from services.evaluate_parameters import evaluate_parameters
from services.langchain_evaluation import evaluate_solution

router = APIRouter()

# Global dictionary to store ideal embeddings (temporary; use DB for production)
# will get as input fromt the node js backend
# ideal_solution_store = {}

# Request schema for general evaluation using LangChain
class GeneralEvaluationRequest(BaseModel):  
    problem_statement: str
    criteria: str
    submission: str

langchain_desc = "Evaluate a student submission based on a set of criteria using LangChain and any LLM. The submission can be evaluated on any specified criteria, and it will be scored on a scale of 1 to 5, depending on how well it meets the given requirements."

@router.post("/evaluate", summary="Evaluate using LangChain and transformer model (e.g., FLAN-T5, LLMs)", description=langchain_desc)
def evaluate_general(request: GeneralEvaluationRequest):
    try:
        result = evaluate_solution(
            problem_statement=request.problem_statement,
            criteria=request.criteria,
            submission=request.submission
        )
        return {"evaluation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Define a Pydantic model for structured request handling
class SimilarityRequest(BaseModel):
    ideal_solution: str
    student_submission: str

similarity_desc = "Compute cosine similarity between the ideal solution and the student submission. The system generates a similarity score out of 100, indicating how closely the student's solution matches the ideal response."

@router.post("/evaluate/similarity/", summary="Evalulate similarity", description=similarity_desc)
def evaluate_submission(request: SimilarityRequest):
    """
    Computes cosine similarity between the ideal solution and student submission.
    """
    try:
        similarity_data = compute_similarity(request.ideal_solution, request.student_submission)
        return {
            "cosine_similarity": similarity_data["similarity_score"],
            "student_embedding": similarity_data["student_embedding"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Define request schema
class EvaluationRequest(BaseModel):
    problem_statement: str
    parameter_definitions: Dict[str, str]  # Dictionary for parameter descriptions
    student_submission: str
    sbert_weight: float = 0.7
    tfidf_weight: float = 0.3

parameters_desc = "Evaluate a student submission based on multiple parameters using both SBERT and TF-IDF. The system generates a score out of 100 for each parameter, and the weights for SBERT similarity and TF-IDF can be customized to adjust their influence on the final score."

@router.post("/evaluate/parameters/", summary="Evaluate parameters", description=parameters_desc)
def evaluate_submission(request: EvaluationRequest):
    """
    Evaluates a student submission based on multiple parameters using both SBERT and TF-IDF.
    """
    print(f"Received parameter definitions: {request.parameter_definitions}")  # Debugging

    try:
        # Extract parameter names from the dictionary
        parameters = list(request.parameter_definitions.keys())

        parameter_scores = evaluate_parameters(
            problem_statement=request.problem_statement,
            student_submission=request.student_submission,
            parameter_definitions=request.parameter_definitions,  # Pass the full dictionary
            sbert_weight=request.sbert_weight,
            tfidf_weight=1 - request.sbert_weight
        )
        
        return {
            "status": "success",
            "parameter_scores": parameter_scores
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# @router.post("/store_ideal_solution/")
# def store_ideal_solution(ideal_text: str):
#     """
#     Stores the ideal solution embeddings when a hackathon is created.
#     """
#     embedding = generate_embedding(ideal_text)
#     ideal_solution_store["embedding"] = embedding.tolist()  # Convert NumPy array to list (JSON serializable)
#     return {"message": "Ideal solution stored successfully", "embedding": embedding.tolist()}

# @router.post("/submission/")
# def evaluate_submission(student_text: str):
#     """
#     Evaluates a student's submission using pre-stored ideal solution embeddings.
#     """
#     if "embedding" not in ideal_solution_store:
#         return {"error": "Ideal solution embeddings not stored. Please upload first."}

#     ideal_embedding = ideal_solution_store["embedding"]  # Retrieve stored ideal embeddings
#     similarity_data = compute_similarity(student_text, ideal_embedding)
#     # parameter_scores = parameter_based_evaluation(student_text)

#     return {
#         "cosine_similarity": similarity_data["similarity_score"],
#         # "parameter_scores": parameter_scores,
#         "student_embedding": similarity_data["student_embedding"]
#     }
