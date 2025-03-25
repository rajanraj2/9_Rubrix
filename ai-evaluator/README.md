# FastAPI Backend - AI Evaluation Service

This FastAPI backend provides AI-powered evaluation services for student submissions, including text analysis, parameter-based evaluation, and feedback generation.

## Project Structure

```
fastapi-backend/
├── main.py                 # Main FastAPI application entry point
├── config.py              # Configuration settings
├── requirements.txt       # Project dependencies
├── routes/               # API route handlers
│   ├── evaluate.py       # Evaluation endpoints
│   ├── summary.py       # Summary generation endpoints
│   └── transcribe.py     # File transcription endpoints
├── services/             # Business logic
│   ├── langchain_evaluation.py  # LangChain evaluation service
│   ├── summariser.py           # Text summarization service
│   ├── evaluate_parameters.py  # Parameter-based evaluation logic
│   ├── evaluate_similarity.py  # Similarity scoring service
│   ├── prompt_templates.py     # Prompt templates for evaluation
│   └── transcription.py        # File transcription service
├── models/               # ML models and utilities
│   ├── sbert_model.py    # SBERT model for text embeddings
│   ├── whisper_model.py  # Whisper model for audio transcription
│   └── bart_model.py     # BART model for text summarization
└── utils/               # Utility functions
```

## API Endpoints

### 1. Evaluation Endpoints (`/api/evaluate/`)

#### POST `/api/evaluate/parameters/`
Evaluates submission based on multiple parameters using SBERT and TF-IDF.

**Request Body:**
```json
{
    "problem_statement": "Problem description",
    "parameters": ["relevance", "impact", "clarity"],
    "student_submission": "Student's submission text",
    "sbert_weight": 0.7,
    "tfidf_weight": 0.3
}
```

**Response:**
```json
{
    "parameter_scores": {
        "relevance": {
            "sbert_similarity": 85.5,
            "tfidf_similarity": 78.2,
            "final_score": 82.8
        },
        "impact": {
            "sbert_similarity": 76.3,
            "tfidf_similarity": 82.1,
            "final_score": 78.7
        },
        "clarity": {
            "sbert_similarity": 88.4,
            "tfidf_similarity": 85.6,
            "final_score": 87.3
        }
    }
}
```

### 2. Transcription Endpoints (`/api/transcribe/`)

#### POST `/api/transcribe/`
Extracts text from uploaded files.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: File upload

**Response:**
```json
{
    "filename": "uploaded_file.ext",
    "extracted_text": "Extracted text content"
}
```

**Supported File Types:**
- Text files (.txt)
- PDF documents (.pdf)
- Word documents (.docx)
- Images (.png, .jpg, .jpeg)
- Audio files (.mp3, .wav, .m4a)
- Code files (.py, .cpp, .java)
- Web pages (URLs)

### 3. Summary and Feedback Endpoints (`/api/generate_summary_feedback/`)

#### POST `/api/summary/`
Generates summary  for student submissions.

**Request Body:**
```json
{
    "problem_statement": "Problem description",
    "student_submission": "Student's submission text",
    "parameter_definitions": {
        "relevance": "How well does the submission address the problem?",
        "impact": "What is the potential effect of the solution?",
        "clarity": "Is the explanation clear and structured?"
    }
}
```

**Response:**
```json
{
    "status": "success",
    "summary": "Generated summary of the submission",
}
```

## Running the FastAPI Backend

### Prerequisites
1. Python 3.8 or higher
2. pip (Python package manager)
3. Virtual environment (recommended)
4. Tesseract OCR installed on system
5. FFmpeg installed on system

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fastapi-backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   # Development mode with auto-reload
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Production mode
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

5. **Access the API**
   - API will be available at `http://localhost:8000`
   - Interactive API docs (Swagger UI) at `http://localhost:8000/docs`
   - Alternative API docs (ReDoc) at `http://localhost:8000/redoc`

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t fastapi-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 8000:8000 fastapi-backend
   ```

## Dependencies

- FastAPI==0.115.11
- uvicorn==0.34.0
- sentence-transformers==3.4.1
- numpy==2.0.2
- scikit-learn==1.5.2
- torch==2.6.0
- torchaudio==2.6.0
- pytesseract==0.3.13
- openai-whisper==20240930
- moviepy==2.1.2
- SpeechRecognition==3.14.1
- requests==2.32.3
- python-docx==1.1.2
- PyPDF2==3.0.1
- docx2txt==0.8
- beautifulsoup4==4.12.3
- pillow==10.4.0
- python-multipart==0.0.20
- boto3==1.37.18
- python-dotenv==1.0.1
- ffmpeg-python==0.2.0
- langchain==0.3.21
- huggingface-hub==0.26.3
- transformers==4.46.3
- langchain-community==0.3.20
- langchain-huggingface==0.1.2

## Features

- Text similarity evaluation using SBERT embeddings
- Parameter-based evaluation with customizable criteria
- Multi-format file transcription
- AI-powered summary and feedback generation using BART model
- Support for various file types and formats
- RESTful API design with proper error handling
- Interactive API documentation
- Docker support for containerization
- Combined processing endpoint for streamlined workflow

## Error Handling

All endpoints include proper error handling and return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 500: Internal Server Error

Error responses include a status and message field for better debugging.

## Development

- The API uses FastAPI's automatic OpenAPI documentation
- All endpoints are properly typed using Pydantic models
- Code follows PEP 8 style guidelines
- Modular architecture for easy maintenance and scaling
- Local model inference without external API dependencies
