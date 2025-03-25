# from fastapi import APIRouter, UploadFile, File, Form
# import requests
# from pydantic import BaseModel
# import json

# router = APIRouter()

# BASE_URL = "http://127.0.0.1:8000/api"  # Change if needed

# class EvaluationRequest(BaseModel):
#     problem_statement: str
#     student_submission: str
#     parameters: list[str]
#     sbert_weight: float = 0.7
#     tfidf_weight: float = 0.3

# class SummaryRequest(BaseModel):
#     problem_statement: str
#     student_submission: str
#     parameter_definitions: dict

# @router.post("/process_all/")
# async def process_all(
#     file: UploadFile = File(...),
#     problem_statement: str = Form("Default problem statement"),
#     parameters: str = Form("relevance,impact,clarity"),
#     parameter_definitions: str = Form(
#         json.dumps({
#             "relevance": "How well does the submission address the problem?",
#             "impact": "What is the potential effect of the solution?",
#             "clarity": "Is the explanation clear and structured?"
#         })
#     )
# ):
#     """
#     This endpoint processes a file through multiple stages:
#     1. Transcribes the file content
#     2. Evaluates the transcribed text
#     3. Generates summary and feedback
#     """
#     try:
#         # Parse parameters from string to list
#         parameters_list = [p.strip() for p in parameters.split(",")]
        
#         # Parse parameter definitions from JSON string
#         try:
#             param_defs = json.loads(parameter_definitions)
#         except json.JSONDecodeError:
#             param_defs = {
#                 "relevance": "How well does the submission address the problem?",
#                 "impact": "What is the potential effect of the solution?",
#                 "clarity": "Is the explanation clear and structured?"
#             }

#         # 1. Transcribe the file
#         transcribe_response = requests.post(
#             f"{BASE_URL}/transcribe/", 
#             files={"file": file.file}
#         )
#         transcribe_response.raise_for_status()
#         transcribed_text = transcribe_response.json().get("extracted_text", "")

#         if not transcribed_text:
#             return {"error": "Transcription failed"}

#         # 2. Evaluate parameters
#         evaluate_params = EvaluationRequest(
#             problem_statement=problem_statement,
#             student_submission=transcribed_text,
#             parameters=parameters_list
#         )
#         parameters_response = requests.post(
#             f"{BASE_URL}/evaluate/parameters/",
#             json=evaluate_params.model_dump()
#         )
#         parameters_response.raise_for_status()

#         # 3. Generate Summary and Feedback
#         summary_request = SummaryRequest(
#             problem_statement=problem_statement,
#             student_submission=transcribed_text,
#             parameter_definitions=param_defs
#         )
#         summary_response = requests.post(
#             f"{BASE_URL}/summary/",
#             json=summary_request.model_dump()
#         )
#         summary_response.raise_for_status()

#         # 4. Collect all results
#         return {
#             "status": "success",
#             "transcription": transcribed_text,
#             "parameter_evaluation": parameters_response.json(),
#             "summary_feedback": summary_response.json()
#         }

#     except requests.exceptions.RequestException as e:
#         return {
#             "status": "error",
#             "message": f"API request failed: {str(e)}"
#         }
#     except Exception as e:
#         return {
#             "status": "error",
#             "message": f"Processing failed: {str(e)}"
#         }
