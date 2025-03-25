import numpy as np
from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from utils.db_connector import store_evaluation_scores
import logging
import re

def compute_similarity(text1: str, text2: str) -> float:
    """
    Compute cosine similarity between two texts using TF-IDF vectorization.
    
    Args:
        text1: First text to compare
        text2: Second text to compare
        
    Returns:
        Similarity score (0-100)
    """
    if not text1 or not text2:
        return 0.0
        
    # Create vectorizer
    vectorizer = TfidfVectorizer()
    
    try:
        # Fit and transform the texts
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        
        # Compute cosine similarity
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        # Scale to 0-100
        return round(float(similarity * 100), 2)
    except Exception as e:
        print(f"Error computing similarity: {str(e)}")
        return 0.0

def parameter_based_evaluation(
    student_submission: str,
    parameter_definitions: Dict[str, str]
) -> Dict[str, float]:
    """
    Evaluate student submission against multiple parameters.
    
    Args:
        student_submission: Text of student submission
        parameter_definitions: Dictionary mapping parameter names to descriptions
        
    Returns:
        Dictionary with scores for each parameter
    """
    results = {}
    
    for param_name, param_description in parameter_definitions.items():
        # Calculate similarity between submission and parameter description
        similarity = compute_similarity(student_submission, param_description)
        results[param_name] = similarity
        
    return results

def generate_summary_and_feedback(text_content, parameter_scores, overall_score):
    """
    Generate a summary and feedback for the submission based on its content and scores.
    
    Args:
        text_content: The text content of the submission
        parameter_scores: Dictionary of parameter scores
        overall_score: Overall score for the submission
        
    Returns:
        Dictionary containing summary and feedback
    """
    # Generate a brief summary of the text content
    words = text_content.split()
    truncated_text = ' '.join(words[:50]) + "..." if len(words) > 50 else text_content
    
    # Categorize the overall score
    if overall_score >= 80:
        performance = "excellent"
    elif overall_score >= 70:
        performance = "good"
    elif overall_score >= 60:
        performance = "above average"
    elif overall_score >= 50:
        performance = "average"
    elif overall_score >= 40:
        performance = "below average"
    else:
        performance = "needs improvement"
    
    # Generate feedback based on parameter scores
    feedback = f"The submission demonstrates {performance} performance overall. "
    
    # Add specific feedback for each parameter
    strength_params = []
    improvement_params = []
    
    for param_name, param_data in parameter_scores.items():
        score = param_data["score"]
        if score >= 70:
            strength_params.append(param_name)
        elif score < 50:
            improvement_params.append(param_name)
    
    if strength_params:
        feedback += f"Strengths are shown in {', '.join(strength_params)}. "
    
    if improvement_params:
        feedback += f"Areas for improvement include {', '.join(improvement_params)}. "
    
    return {
        "summary": truncated_text,
        "feedback": feedback,
        "performance_category": performance
    }

async def evaluate_submission_content(
    content_text: str,
    parameters: List[Any],
    submission_id: str,
    hackathon_id: str
) -> Dict[str, Any]:
    """
    Evaluate the content of a submission against multiple parameters.
    
    Args:
        content_text: The text content to evaluate
        parameters: The parameters to evaluate against (list of dicts or Pydantic models)
        submission_id: The ID of the submission
        hackathon_id: The ID of the hackathon
        
    Returns:
        Dictionary containing evaluation results
    """
    try:
        # Initialize the TF-IDF vectorizer and compute the similarity scores
        parameter_scores = {}
        overall_score = 0
        
        for param in parameters:
            param_id = param.get('id') if isinstance(param, dict) else param.id
            param_name = param.get('name') if isinstance(param, dict) else param.name
            param_desc = param.get('description') if isinstance(param, dict) else param.description
            
            # Check for valid parameter data
            if not param_id or not param_name or not param_desc:
                logging.warning(f"Skipping parameter with missing data: {param}")
                continue
            
            try:
                # Compute similarity between submission text and parameter description
                vectorizer = TfidfVectorizer()
                tfidf_matrix = vectorizer.fit_transform([content_text, param_desc])
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                
                # Convert similarity to score (0-100 scale)
                score = similarity * 100
                
                # Ensure score is within 0-100 range
                score = max(0, min(100, score))
                
                # Store the parameter score
                parameter_scores[param_name] = {
                    "id": param_id,
                    "score": round(score, 2),
                    "description": param_desc
                }
                
                # Add to overall score calculation
                overall_score += score
            except Exception as e:
                logging.error(f"Error computing similarity for parameter {param_name}: {str(e)}")
        
        # Calculate overall score (average of all parameter scores)
        if parameter_scores:
            overall_score = overall_score / len(parameter_scores)
            overall_score = max(0, min(100, overall_score))  # Ensure it's within 0-100 range
        else:
            overall_score = 0
            
        # Generate summary and feedback
        summary_feedback = generate_summary_and_feedback(content_text, parameter_scores, overall_score)
        
        # Store results in MongoDB
        try:
            db_result = await store_evaluation_scores(
                submission_id=submission_id,
                hackathon_id=hackathon_id,
                text_content=content_text,
                parameter_scores=parameter_scores,
                overall_score=round(overall_score, 2),
                summary_feedback=summary_feedback
            )
            logging.info(f"Stored evaluation results: {db_result}")
        except Exception as e:
            logging.error(f"Error storing evaluation in MongoDB: {str(e)}")
            db_result = {"success": False, "error": str(e)}
        
        return {
            "parameter_scores": parameter_scores,
            "overall_score": round(overall_score, 2),
            "extracted_text": content_text,
            "summary_feedback": summary_feedback,
            "db_result": db_result
        }
    
    except Exception as e:
        logging.error(f"Error in evaluation process: {str(e)}")
        return {
            "parameter_scores": {},
            "overall_score": 0,
            "extracted_text": content_text,
            "error": str(e)
        }

def format_evaluation_results(
    submission_id: str,
    hackathon_id: str,
    parameter_scores: Dict[str, Dict[str, float]],
    overall_score: float
) -> Dict[str, Any]:
    """
    Format evaluation results for API response.
    
    Args:
        submission_id: ID of the submission
        hackathon_id: ID of the hackathon
        parameter_scores: Dictionary of parameter scores
        overall_score: Overall score for the submission
        
    Returns:
        Formatted results for API response
    """
    # Format parameter scores
    formatted_params = {}
    for param_name, scores in parameter_scores.items():
        formatted_params[param_name] = {
            "score": scores.get("score", scores.get("final_score", 0)),  # Try both keys for compatibility
            "description": scores.get("description", "")
        }
    
    # Create result object
    return {
        "submission_id": submission_id,
        "hackathon_id": hackathon_id,
        "overall_score": overall_score,
        "parameters": formatted_params,
        "status": "completed"
    } 