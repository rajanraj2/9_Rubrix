EVALUATION_PROMPT_TEMPLATE = """
how good is the solution on a scale of 1 to 5 for the following problem statement:
problem statement: {problem_statement}
criteria: {criteria}
submission: {submission}


"""




# EVALUATION_PROMPT_TEMPLATE = """
# You are an expert evaluator for hackathon submissions. Your task is to assess the given submission based on the specified criteria.

# ### Problem Statement:
# {problem_statement}

# ### Submission:
# {submission}

# ### Evaluation Criteria:
# - {criteria}

# ### Instructions:
# - Provide a **brief summary** of the submission in 2-3 sentences.
# - Assign a **score between 0 and 100** for the given criteria.
# - Respond **only** in valid JSON format with the following keys:

# ```json
# {
#   "summary": "Brief summary of the submission.",
#   "score": 85
# }
# """






# EVALUATION_PROMPT_TEMPLATE = """
# You are an expert judge evaluating a hackathon project.

# Problem Statement: {problem_statement}

# Evaluation Criteria:
# {criteria}

# Submission:
# {submission}

# Task:
# 1. Evaluate the submission on each criterion by assigning a score between 0 and 100.
# 2. Generate a concise summary of the submission's strengths and weaknesses.

# Your output must be a single valid JSON object with exactly the following structure and nothing else. Do not include any extra text, commentary, or formatting outside of the JSON.

# The JSON object must have these keys:
# - "Summary": a string summarizing the submission.
# - "Feedback": a string providing a short feedback on the submission.
# - "Evaluation": an array of objects, each object containing:
#     - "Criterion": a string representing the name of the criterion,
#     - "Score": a number (0-100),

# Example JSON (this is only an example, do not output this in your response):
# {{
#     "Summary": "The submission addresses waste management with a novel approach.",
#     "Feedback": "The submission is innovative and has a clear potential for impact.",
#     "Evaluation": [
#         {{
#             "Criterion": "Feasibility",
#             "Score": 80,
#             "Feedback": "The solution is practical but lacks scalability details."
#         }},
#         {{
#             "Criterion": "Innovation",
#             "Score": 85,
#             "Feedback": "The approach is creative and unique."
#         }}
#     ]
# }}
# """
