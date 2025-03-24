from fastapi import FastAPI
from routes.evaluate import router as evaluate_router
from routes.transcribe import router as transcription_router
from routes.summary_feedback import router as summary_feedback_router
from routes.summary import router as summary_router
# from routes.evaluate import router as evaluate_solution_router
from routes.transcribe_s3 import router as transcription_s3_router

app = FastAPI(title="AI Evaluation Service", version="1.0")

# Include API routes
app.include_router(evaluate_router, prefix="/api/evaluate")
app.include_router(transcription_router, prefix="/api")
# app.include_router(summary_feedback_router, prefix="/api/summary_feedback")
app.include_router(summary_router, prefix="/api/summary")
# app.include_router(evaluate_solution_router, prefix="/api/evaluate_solution")
app.include_router(transcription_s3_router, prefix="/api/transcribe_s3")

@app.get("/")
def home():
    return {"message": "AI Evaluation API is running!"}


