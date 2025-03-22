import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from models.sbert_model import sbert_model

# Example ideal solution embedding (store this after first request)
ideal_solution_embedding = None

def generate_embedding(text: str):
    """Generate SBERT embedding for a given text."""
    return sbert_model.encode(text, convert_to_numpy=True)

def compute_similarity(student_text: str, ideal_text: str):
    """Compute cosine similarity between student and ideal solution."""
    global ideal_solution_embedding
    if ideal_solution_embedding is None:
        ideal_solution_embedding = generate_embedding(ideal_text)

    student_embedding = generate_embedding(student_text)
    similarity = cosine_similarity([student_embedding], [ideal_solution_embedding])[0][0]
    return round(similarity * 100, 2)  # Convert to percentage

def parameter_based_evaluation(text: str):
    """Basic rule-based evaluation (extend later)."""
    scores = {
        "relevance": np.random.randint(50, 100),  # Placeholder logic
        "clarity": np.random.randint(50, 100),
        "impact": np.random.randint(50, 100),
        "completeness": np.random.randint(50, 100),
    }
    return scores
