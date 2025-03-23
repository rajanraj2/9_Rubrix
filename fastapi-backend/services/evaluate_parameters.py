import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models.sbert_model import sbert_model

def generate_embedding(text: str):
    """Generate SBERT embedding for a given text."""
    return sbert_model.encode(text, convert_to_numpy=True)

def compute_tfidf_similarity(problem_statement: str, parameter: str, parameter_description: str, student_submission: str):
    """
    Computes TF-IDF similarity between the student submission and the problem statement + parameter description.
    """
    vectorizer = TfidfVectorizer()
    
    # Use dynamically passed description
    documents = [
        problem_statement + " " + parameter_description,  # Use provided description
        student_submission
    ]
    
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Compute cosine similarity between problem + parameter and student submission
    similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
    
    # Scale similarity (0-1) to (0-100)
    return round(float(similarity * 100), 2)


def evaluate_parameters(problem_statement: str, student_submission: str, parameter_definitions: dict, sbert_weight: float, tfidf_weight: float):
    """
    Evaluates a student submission on multiple parameters individually.
    
    Args:
        problem_statement (str): The problem statement to evaluate against.
        student_submission (str): The student's submission text.
        parameter_definitions (dict): Dictionary mapping parameters to their descriptions.
        sbert_weight (float): Weight for SBERT similarity score.
        tfidf_weight (float): Weight for TF-IDF similarity score.

    Returns:
        dict: Dictionary containing scores for each parameter.
    """
    if not problem_statement or not student_submission:
        raise ValueError("Problem statement and student submission cannot be empty")
    
    if not parameter_definitions:
        raise ValueError("At least one parameter must be provided")
    
    if not (0 <= sbert_weight <= 1 and 0 <= tfidf_weight <= 1):
        raise ValueError("Weights must be between 0 and 1")
    
    if abs(sbert_weight + tfidf_weight - 1.0) > 0.0001:  # Allow for floating point differences
        raise ValueError("Sum of weights must equal 1.0")

    parameter_scores = {}

    # Generate SBERT embedding for student submission (compute only once)
    student_embedding = generate_embedding(student_submission)

    for parameter, description in parameter_definitions.items():  # Loop over dictionary
        # Compute TF-IDF similarity
        tfidf_score = compute_tfidf_similarity(
            problem_statement=problem_statement,
            parameter=parameter,
            parameter_description=description,  # Pass dynamic description
            student_submission=student_submission
        )

        # Compute SBERT similarity
        parameter_text = f"{problem_statement} - Focus on {description}"
        parameter_embedding = generate_embedding(parameter_text)
        similarity = cosine_similarity([student_embedding], [parameter_embedding])[0][0]
        similarity_score = round(float(similarity * 100), 2)

        # Compute final score using dynamic weightage
        final_score = round((sbert_weight * similarity_score) + (tfidf_weight * tfidf_score), 2)

        parameter_scores[parameter] = {
            "sbert_similarity": similarity_score,
            "tfidf_similarity": tfidf_score,
            "final_score": final_score
        }

    return parameter_scores
