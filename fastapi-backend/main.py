from fastapi import FastAPI
from routes.evaluate import router as evaluate_router
from routes.transcribe import router as transcription_router

app = FastAPI(title="AI Evaluation Service", version="1.0")

# Include API routes
app.include_router(evaluate_router, prefix="/api/evaluate")
app.include_router(transcription_router, prefix="/api")

@app.get("/")
def home():
    return {"message": "AI Evaluation API is running!"}
