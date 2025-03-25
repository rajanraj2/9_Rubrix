from sentence_transformers import SentenceTransformer
from config import MODEL_NAME

# Load SBERT model once to avoid reloading in each request
sbert_model = SentenceTransformer(MODEL_NAME)
