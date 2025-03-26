from fastapi import FastAPI
from routes.evaluate import router as evaluate_router
from routes.transcribe import router as transcription_router
from routes.summary import router as summary_router
# from routes.process_all import router as process_all_router
# from routes.summary_feedback import router as summary_feedback_router
# from routes.transcribe_s3 import router as transcription_s3_router

app = FastAPI(title="AI Evaluation Service", version="1.0")

# Include API routes
app.include_router(evaluate_router, tags=["Evaluation"], prefix="/api")
app.include_router(transcription_router, tags=["Transcription"], prefix="/api")
app.include_router(summary_router, tags=["Summary"], prefix="/api/summary")
# app.include_router(process_all_router, tags=["Process All"], prefix="/api/process_all")
# app.include_router(summary_feedback_router, prefix="/api/summary_feedback")
# app.include_router(transcription_s3_router, prefix="/api/transcribe_s3")

@app.get("/")
def home():
    return {"message": "AI Evaluation API is running!"}


