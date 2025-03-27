import json
import torch
from transformers import pipeline
from langchain.prompts import PromptTemplate
from langchain_huggingface import HuggingFacePipeline  
from .prompt_templates import EVALUATION_PROMPT_TEMPLATE

# Determine the device: 0 for GPU if available, else -1 for CPU
device_id = 0 if torch.cuda.is_available() else -1

# Global variables to store model and evaluation chain
llm_local = None
evaluation_chain = None

def load_model():
    """
    Loads the model and initializes the pipeline only once.
    """
    global llm_local, evaluation_chain

    if llm_local is None:  # Check if the model is already loaded
        print("Loading FLAN-T5 model for the first time...")
        model_name = "google/flan-t5-large"
        local_pipeline = pipeline(
            "text2text-generation",
            model=model_name,
            device=device_id,  
            do_sample=True,
            max_new_tokens=150,
            num_beams=4,
            temperature=0.2
        )
        llm_local = HuggingFacePipeline(pipeline=local_pipeline)
        
        # Create a PromptTemplate
        prompt_template = PromptTemplate(
            input_variables=["problem_statement", "criteria", "submission"],
            template=EVALUATION_PROMPT_TEMPLATE
        )
        
        # Create evaluation chain
        evaluation_chain = prompt_template | llm_local
        print("Model and evaluation chain loaded successfully.")

def evaluate_solution(problem_statement, criteria, submission):
    """
    Uses LangChain with a locally loaded FLAN-T5 model to evaluate a hackathon submission.
    Returns a structured JSON object with scores, summary, and feedback.
    """
    if evaluation_chain is None:
        load_model()  # Ensure model is loaded before running

    # Use the 'invoke' method to get the response
    response = evaluation_chain.invoke({
        "problem_statement": problem_statement,
        "criteria": criteria,
        "submission": submission
    })

    return response  # Returning structured JSON response
