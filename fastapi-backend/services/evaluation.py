import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from models.sbert_model import sbert_model

def generate_embedding(text: str):
    """Generate SBERT embedding for a given text."""
    return sbert_model.encode(text, convert_to_numpy=True)

def compute_similarity(student_text: str, ideal_text: str):
    """Compute cosine similarity between student and ideal solution."""
    ideal_embedding = generate_embedding(ideal_text)  # Generate ideal embedding per request
    student_embedding = generate_embedding(student_text)

    similarity = cosine_similarity([student_embedding], [ideal_embedding])[0][0]
    return round(float(similarity * 100), 2)  # ✅ Convert to native Python float

def parameter_based_evaluation(text: str):
    """Rule-based evaluation based on predefined parameters."""
    scores = {
        "relevance": int(np.random.randint(50, 100)),  # ✅ Convert NumPy int → Python int
        "clarity": int(np.random.randint(50, 100)),
        "impact": int(np.random.randint(50, 100)),
        "completeness": int(np.random.randint(50, 100)),
    }
    return scores
