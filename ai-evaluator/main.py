from fastapi import FastAPI
from routes.evaluate import router as evaluate_router
from routes.transcribe import router as transcription_router
from routes.summary import router as summary_router

app = FastAPI(title="AI Evaluation Service", version="1.0")

# Include API routes
app.include_router(evaluate_router, tags=["Evaluation"], prefix="/api")
app.include_router(transcription_router, tags=["Transcription"], prefix="/api")
app.include_router(summary_router, tags=["Summary"], prefix="/api/summary")

@app.get("/", summary="Home", description="Check if the API is running")
def home():
    return {"message": "AI Evaluation API is running!"}


