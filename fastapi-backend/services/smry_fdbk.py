# import os
# import requests

# # HF_API_KEY = os.getenv("HF_API_KEY")  # Replace with your Hugging Face API key
# print(HF_API_KEY)

# def generate_summary_feedback_llama(problem_statement, student_submission, parameters):
#     """
#     Uses a text generation model to generate both a summary and constructive feedback.
#     """
#     prompt = f"""
#     You are an expert in summarization and evaluation. 
#     First, generate a concise **summary** of the given student submission.
#     Then, provide **constructive feedback** based on the following criteria.
    
#     Problem Statement: {problem_statement}
#     Student Submission: {student_submission}

#     Evaluation Criteria:
#     """
#     for param, desc in parameters.items():
#         prompt += f"\n- {param}: {desc}"

#     prompt += "\n\nFirst, provide a brief **summary**. Then, give **feedback** highlighting strengths and areas of improvement."

#     url = "https://api-inference.huggingface.co/models/facebook/opt-1.3b"
#     headers = {"Authorization": f"Bearer {HF_API_KEY}"}
#     payload = {
#         "inputs": prompt,
#         "parameters": {
#             "max_length": 500,
#             "temperature": 0.7,
#             "top_p": 0.9
#         }
#     }

#     try:
#         response = requests.post(url, headers=headers, json=payload)
#         response.raise_for_status()  # Raise an exception for bad status codes
        
#         if response.status_code == 200:
#             response_text = response.json()[0]["generated_text"]
#             # Split response into summary and feedback
#             parts = response_text.split("Feedback:", 1)
#             summary = parts[0].strip() if len(parts) > 1 else "Summary not found."
#             feedback = "Feedback:" + parts[1].strip() if len(parts) > 1 else "Feedback not found."
#             return summary, feedback
#         else:
#             return "Error in generating summary & feedback", f"API Error: {response.status_code}"
#     except Exception as e:
#         return "Error in generating summary & feedback", f"Error: {str(e)}"



import os
import requests

HF_API_KEY = os.getenv("HF_API_KEY")  # Replace with your Hugging Face API key
# print("Hello")
# print(HF_API_KEY)

def generate_summary_feedback_llama(problem_statement, student_submission, parameters):
    """
    Uses LLaMA 3 to generate both a **summary** and **constructive feedback**.
    """
    prompt = f"""
    You are an expert in summarization and evaluation. 
    First, generate a concise **summary** of the given student submission.
    Then, provide **constructive feedback** based on the following criteria.
    
    Problem Statement: {problem_statement}
    Student Submission: {student_submission}

    Evaluation Criteria:
    """
    for param, desc in parameters.items():
        prompt += f"\n- {param}: {desc}"

    prompt += "\n\nFirst, provide a brief **summary**. Then, give **feedback** highlighting strengths and areas of improvement."

    url = "https://api-inference.huggingface.co/models/meta-llama/Llama-3-8B"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": prompt}

    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        response_text = response.json()[0]["generated_text"]
        # Split response into summary and feedback (assuming LLaMA generates both)
        parts = response_text.split("Feedback:", 1)
        summary = parts[0].strip() if len(parts) > 1 else "Summary not found."
        feedback = "Feedback:" + parts[1].strip() if len(parts) > 1 else "Feedback not found."
        return summary, feedback
    else:
        return "Error in generating summary & feedback", "Error in generating summary & feedback"
