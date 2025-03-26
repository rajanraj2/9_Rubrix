from transformers import BartForConditionalGeneration, BartTokenizer
from config import BART_MODEL_NAME

# Load BART model & tokenizer once to avoid reloading
tokenizer = BartTokenizer.from_pretrained(BART_MODEL_NAME)
bart_model = BartForConditionalGeneration.from_pretrained(BART_MODEL_NAME)
