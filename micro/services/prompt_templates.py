EVALUATION_PROMPT_TEMPLATE = """
You are an expert judge evaluating a hackathon project.

Problem Statement: {problem_statement}

Evaluation Criteria:
{criteria}

Submission:
{submission}

Task:
1. Evaluate the submission on each criterion by assigning a score between 0 and 100.
2. Provide a short explanation for each score.
3. Generate a concise summary of the submission's strengths and weaknesses.

Your output must be a single valid JSON object with exactly the following structure and nothing else. Do not include any extra text, commentary, or formatting outside of the JSON.

The JSON object must have these keys:
- "Summary": a string summarizing the submission.
- "Evaluation": an array of objects, each object containing:
    - "Criterion": a string representing the name of the criterion,
    - "Score": a number (0-100),
    - "Feedback": a string providing a short explanation.

Example JSON (this is only an example, do not output this in your response):
{{
    "Summary": "The submission addresses waste management with a novel approach.",
    "Evaluation": [
        {{
            "Criterion": "Feasibility",
            "Score": 80,
            "Feedback": "The solution is practical but lacks scalability details."
        }},
        {{
            "Criterion": "Innovation",
            "Score": 85,
            "Feedback": "The approach is creative and unique."
        }}
    ]
}}
"""
