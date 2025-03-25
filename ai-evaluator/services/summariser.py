from models.bart_model import bart_model, tokenizer

def generate_summary(text: str):
    """
    Generates a summary using the preloaded BART model.
    """
    inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = bart_model.generate(
        inputs.input_ids, 
        # max_length=150, 
        # min_length=40, 
        length_penalty=2.0, 
        num_beams=4, 
        early_stopping=True
    )
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)
