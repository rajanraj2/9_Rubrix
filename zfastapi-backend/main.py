from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes.transcribe import router as transcription_router
from routes.transcribe_s3 import router as transcribe_s3_router
from routes.hackathon_evaluations import router as hackathon_evaluations_router

# Load environment variables
load_dotenv()

# Initialize description
description = "Service for transcribing files and evaluating hackathon submissions based on semantic similarity."

# Create FastAPI app
app = FastAPI(
    title="Hackathon Evaluation Service",
    description=description,
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API routes
app.include_router(transcription_router, prefix="/api", tags=["Transcription"])
app.include_router(transcribe_s3_router, prefix="/api", tags=["S3 Transcription"])
app.include_router(hackathon_evaluations_router, prefix="/api", tags=["Hackathon Evaluations"])

# Add documentation for the video transcription feature
description += """
## Video Transcription
This API now supports transcribing video files! You can use the following endpoints:
- `/api/transcribe/` - Upload and transcribe video files directly
- `/api/transcribe_s3/` - Transcribe video files from S3 without evaluation
- `/api/transcribe_and_evaluate/` - Transcribe and evaluate video files from S3

Supported video formats: MP4, AVI, MKV, MOV, and WEBM.
"""

# Define a simple health check endpoint
@app.get("/")
def read_root():
    return {
        "status": "success",
        "message": "Service is running",
        "service": "PiJam Transcription and Evaluation API",
        "version": "1.0.0"
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run("main:app", host=host, port=port, reload=True)


