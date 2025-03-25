import os
import motor.motor_asyncio
from dotenv import load_dotenv
from typing import Dict, List, Any
import datetime

# Load environment variables
load_dotenv()

# MongoDB connection settings
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "hackathon_platform")

# Create client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]

async def store_evaluation_scores(
    submission_id: str, 
    hackathon_id: str, 
    text_content: str,
    parameter_scores: Dict[str, Dict[str, float]],
    overall_score: float,
    summary_feedback: Dict[str, str] = None
) -> Dict[str, Any]:
    """
    Store evaluation scores in MongoDB. If an evaluation already exists
    for the submission, it will be updated with the new scores.
    
    Args:
        submission_id: ID of the submission
        hackathon_id: ID of the hackathon
        text_content: Extracted text content
        parameter_scores: Dictionary of parameter scores
        overall_score: Overall score for the submission
        summary_feedback: Dictionary containing summary and feedback
        
    Returns:
        Dictionary containing operation result
    """
    try:
        # Check if an evaluation already exists for this submission
        existing_eval = await db.evaluations.find_one({"submission_id": submission_id})
        
        # Create evaluation document
        evaluation_doc = {
            "submission_id": submission_id,
            "hackathon_id": hackathon_id,
            "text_content": text_content,
            "parameter_scores": parameter_scores,
            "overall_score": overall_score,
            "updated_at": datetime.datetime.now()
        }
        
        # Add summary and feedback if provided
        if summary_feedback:
            evaluation_doc["summary_feedback"] = summary_feedback
        
        if existing_eval:
            # Update existing evaluation
            # Keep the original created_at timestamp
            if "created_at" in existing_eval:
                evaluation_doc["created_at"] = existing_eval["created_at"]
            else:
                evaluation_doc["created_at"] = evaluation_doc["updated_at"]
                
            result = await db.evaluations.update_one(
                {"submission_id": submission_id},
                {"$set": evaluation_doc}
            )
            
            return {
                "success": True,
                "evaluation_id": str(existing_eval["_id"]),
                "submission_id": submission_id,
                "updated": True
            }
        else:
            # Store new evaluation
            evaluation_doc["created_at"] = evaluation_doc["updated_at"]
            result = await db.evaluations.insert_one(evaluation_doc)
            
            return {
                "success": True,
                "evaluation_id": str(result.inserted_id),
                "submission_id": submission_id,
                "updated": False
            }
    except Exception as e:
        print(f"Error storing evaluation in MongoDB: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "submission_id": submission_id
        }

async def get_evaluation_by_submission_id(submission_id: str) -> Dict[str, Any]:
    """
    Retrieve evaluation results for a specific submission
    
    Args:
        submission_id: ID of the submission
        
    Returns:
        Dictionary containing evaluation results or None if not found
    """
    evaluation = await db.evaluations.find_one({"submission_id": submission_id})
    
    if evaluation:
        # Convert ObjectId to string for JSON serialization
        evaluation["_id"] = str(evaluation["_id"])
        return evaluation
    
    return None
    
async def get_evaluations_by_hackathon_id(hackathon_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all evaluation results for a specific hackathon
    
    Args:
        hackathon_id: ID of the hackathon
        
    Returns:
        List of evaluation documents
    """
    cursor = db.evaluations.find({"hackathon_id": hackathon_id})
    evaluations = []
    
    async for doc in cursor:
        # Convert ObjectId to string for JSON serialization
        doc["_id"] = str(doc["_id"])
        evaluations.append(doc)
    
    return evaluations 