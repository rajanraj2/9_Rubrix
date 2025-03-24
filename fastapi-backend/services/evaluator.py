import json
import re
import torch
from transformers import pipeline
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_huggingface import HuggingFacePipeline  
from .prompt_templates import EVALUATION_PROMPT_TEMPLATE

# Determine the device: 0 for GPU if available, else -1 for CPU
device_id = 0 if torch.cuda.is_available() else -1

# Load the model locally using Transformers.
model_name = "google/flan-t5-large"
local_pipeline = pipeline(
    "text2text-generation",
    model=model_name,
    device=device_id,  # Set to 0 for GPU, or -1 for CPU
    max_length=512,
    temperature=0.2
)

# Wrap the local pipeline in LangChain's HuggingFacePipeline wrapper.
llm_local = HuggingFacePipeline(pipeline=local_pipeline)

# Create a PromptTemplate from your evaluation prompt template.
prompt_template = PromptTemplate(
    input_variables=["problem_statement", "criteria", "submission"],
    template=EVALUATION_PROMPT_TEMPLATE
)

# Create the LLMChain that combines the local LLM and the prompt template.
evaluation_chain = LLMChain(llm=llm_local, prompt=prompt_template)

def evaluate_solution(problem_statement, criteria, submission):
    """
    Uses LangChain with a locally loaded FLAN-T5 model to evaluate a hackathon submission.
    Returns a structured JSON object with scores, summary, and feedback.
    """
    # Use the 'invoke' method (run is deprecated)
    response = evaluation_chain.invoke({
        "problem_statement": problem_statement,
        "criteria": criteria,
        "submission": submission
    })
    
    # Debug: Print raw response
    print("Raw response:", response)
    
    # If the response is a string, try to extract JSON via regex; if it's already a dict, use it directly.
    if isinstance(response, str):
        json_match = re.search(r"\{.*\}", response, re.DOTALL)
        json_str = json_match.group(0) if json_match else response
        try:
            result_json = json.loads(json_str)
        except json.JSONDecodeError:
            result_json = {"error": "Failed to parse response as JSON", "raw_output1": response}
    elif isinstance(response, dict):
        result_json = response
    else:
        result_json = {"error": "Unexpected response type", "raw_output2": str(response)}
    # Validate that the expected keys are present
    if "text" not in result_json or "Evaluation" not in result_json:
        result_json = {"error": "Missing required keys in JSON output", "raw_output3": response}
    
    return result_json

# ----- Test the evaluator function -----

# Sample inputs (customize these as needed)
problem_statement = "How can AI help manage waste in cities?"
criteria = "feasibility"
submission = "Using AI to differentiate between types of waste to optimize recycling and waste management."

# Get evaluation result
result = evaluate_solution(problem_statement, criteria, submission)

# Print the structured JSON evaluation
print(json.dumps(result, indent=4))
