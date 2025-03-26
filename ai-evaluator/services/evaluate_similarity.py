import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from models.sbert_model import sbert_model

def generate_embedding(text: str):
    """Generate SBERT embedding for a given text."""
    return sbert_model.encode(text, convert_to_numpy=True)

def compute_similarity(problem_statement: str, student_text: str):
    """
    Compute cosine similarity between problem statement and student submission embeddings.
    """
    problem_embedding = generate_embedding(problem_statement)
    student_embedding = generate_embedding(student_text)

    similarity = cosine_similarity([student_embedding], [problem_embedding])[0][0]

    return {
        "similarity_score": round(float(similarity * 100), 2),  # Scale to 0-100
        "problem_embedding": problem_embedding.tolist(),  # Convert for JSON response
        "student_embedding": student_embedding.tolist()
    }

