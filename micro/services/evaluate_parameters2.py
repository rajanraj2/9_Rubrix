import numpy as np
import math
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models.sbert_model import sbert_model

def generate_embedding(text: str):
    """Generate SBERT embedding for a given text."""
    return sbert_model.encode(text, convert_to_numpy=True)

def compute_tfidf_similarity(problem_statement: str, parameter_description: str, student_submission: str):
    """
    Computes TF-IDF similarity between the student submission and the problem statement + parameter description.
    """
    vectorizer = TfidfVectorizer()
    
    # Use dynamically passed description
    documents = [
        problem_statement + " " + parameter_description,  # Problem + Description
        student_submission
    ]
    
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Compute cosine similarity between problem + parameter and student submission
    similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
    
    # Scale similarity (0-1) to (0-100)
    return round(float(similarity * 100), 2)

def get_best_matching_sentence(student_submission: str, parameter_text: str):
    """
    Find the most relevant sentence in the student's submission for a given parameter.
    """
    student_sentences = student_submission.split(". ")  # Split submission into sentences
    student_embeddings = sbert_model.encode(student_sentences, convert_to_numpy=True)
    parameter_embedding = generate_embedding(parameter_text)

    # Compute similarity scores
    scores = cosine_similarity([parameter_embedding], student_embeddings)[0]
    best_sentence_index = scores.argmax()
    
    return student_sentences[best_sentence_index], scores[best_sentence_index]

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
    
    if not math.isclose(sbert_weight + tfidf_weight, 1.0, abs_tol=1e-5):  
        raise ValueError("Sum of weights must equal 1.0")

    parameter_scores = {}

    # Generate SBERT embedding for student submission (compute only once)
    student_embedding = generate_embedding(student_submission)

    for parameter, description in parameter_definitions.items():  # Loop over dictionary
        # Create parameter-specific embedding with more context
        parameter_text = f"Evaluate the solution based on {parameter}: {description}. Problem statement: {problem_statement}"
        parameter_embedding = generate_embedding(parameter_text)

        # Find the most relevant sentence in the student's submission
        best_sentence, best_score = get_best_matching_sentence(student_submission, parameter_text)

        # Compute TF-IDF similarity using the best-matching sentence
        tfidf_score = compute_tfidf_similarity(
            problem_statement=problem_statement,
            parameter_description=description,  # Use provided description
            student_submission=best_sentence  # Only compare with the best sentence
        )

        # Compute SBERT similarity
        similarity = cosine_similarity([student_embedding], [parameter_embedding])[0][0]
        similarity_score = round(float(similarity * 100), 2)

        # Compute final score using dynamic weightage
        final_score = round((sbert_weight * similarity_score) + (tfidf_weight * tfidf_score), 2)

        # Apply a penalty if the parameter is missing from the submission
        if parameter.lower() not in student_submission.lower():
            final_score -= 10  # Reduce score if the keyword is missing
            final_score = max(final_score, 0)  # Ensure non-negative scores

        parameter_scores[parameter] = {
            "sbert_similarity": similarity_score,
            "tfidf_similarity": tfidf_score,
            "final_score": final_score,
            "best_sentence": best_sentence  # Debugging: Show best-matching sentence
        }

    return parameter_scores
