from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from utils.db_connector import get_evaluations_by_hackathon_id
from services.evaluation_service import format_evaluation_results

router = APIRouter()

class HackathonStatsResponse(BaseModel):
    hackathon_id: str
    submission_count: int
    average_score: float
    parameter_averages: Dict[str, float]
    submissions: List[Dict[str, Any]]

@router.get("/hackathon/{hackathon_id}/evaluations")
async def get_hackathon_evaluations(hackathon_id: str):
    """
    Get all evaluation results for a specific hackathon
    """
    try:
        # Get all evaluations for the hackathon
        evaluations = await get_evaluations_by_hackathon_id(hackathon_id)
        
        if not evaluations:
            return {
                "status": "success",
                "hackathon_id": hackathon_id,
                "submission_count": 0,
                "message": "No evaluations found for this hackathon"
            }
        
        # Format evaluations
        formatted_evaluations = []
        for eval_doc in evaluations:
            formatted_eval = format_evaluation_results(
                submission_id=eval_doc["submission_id"],
                hackathon_id=eval_doc["hackathon_id"],
                parameter_scores=eval_doc["parameter_scores"],
                overall_score=eval_doc["overall_score"]
            )
            formatted_evaluations.append(formatted_eval)
        
        # Calculate hackathon statistics
        submission_count = len(evaluations)
        overall_scores = [eval_doc["overall_score"] for eval_doc in evaluations]
        average_score = round(sum(overall_scores) / submission_count, 2) if submission_count > 0 else 0
        
        # Calculate average scores for each parameter
        parameter_scores = {}
        for eval_doc in evaluations:
            for param_name, param_data in eval_doc["parameter_scores"].items():
                if param_name not in parameter_scores:
                    parameter_scores[param_name] = []
                parameter_scores[param_name].append(param_data["final_score"])
        
        parameter_averages = {
            param: round(sum(scores) / len(scores), 2) 
            for param, scores in parameter_scores.items()
        }
        
        return {
            "status": "success",
            "hackathon_id": hackathon_id,
            "submission_count": submission_count,
            "average_score": average_score,
            "parameter_averages": parameter_averages,
            "submissions": formatted_evaluations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving hackathon evaluations: {str(e)}")

@router.get("/hackathon/{hackathon_id}/statistics")
async def get_hackathon_statistics(hackathon_id: str):
    """
    Get aggregated statistics for a hackathon's evaluations
    """
    try:
        # Get all evaluations for the hackathon
        evaluations = await get_evaluations_by_hackathon_id(hackathon_id)
        
        if not evaluations:
            return {
                "status": "success",
                "hackathon_id": hackathon_id,
                "submission_count": 0,
                "message": "No evaluations found for this hackathon"
            }
        
        # Calculate hackathon statistics
        submission_count = len(evaluations)
        overall_scores = [eval_doc["overall_score"] for eval_doc in evaluations]
        average_score = round(sum(overall_scores) / submission_count, 2) if submission_count > 0 else 0
        
        # Calculate average scores for each parameter
        parameter_scores = {}
        for eval_doc in evaluations:
            for param_name, param_data in eval_doc["parameter_scores"].items():
                if param_name not in parameter_scores:
                    parameter_scores[param_name] = []
                parameter_scores[param_name].append(param_data["final_score"])
        
        parameter_averages = {
            param: round(sum(scores) / len(scores), 2) 
            for param, scores in parameter_scores.items()
        }
        
        # Generate score distribution
        score_ranges = {
            "excellent": [90, 100],
            "good": [75, 89.99],
            "average": [60, 74.99],
            "below_average": [40, 59.99],
            "poor": [0, 39.99]
        }
        
        distribution = {category: 0 for category in score_ranges.keys()}
        
        for score in overall_scores:
            for category, [min_val, max_val] in score_ranges.items():
                if min_val <= score <= max_val:
                    distribution[category] += 1
                    break
        
        # Convert counts to percentages
        distribution_percentages = {
            category: round((count / submission_count) * 100, 2) 
            for category, count in distribution.items()
        }
        
        return {
            "status": "success",
            "hackathon_id": hackathon_id,
            "submission_count": submission_count,
            "average_score": average_score,
            "parameter_averages": parameter_averages,
            "score_distribution": distribution,
            "score_distribution_percentages": distribution_percentages
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving hackathon statistics: {str(e)}") 