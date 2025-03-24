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
│   ├── transcribe.py     # File transcription endpoints
│   ├── summary_feedback.py # Summary and feedback generation endpoints
│   └── ideal_solution.py # Ideal solution management endpoints
├── services/             # Business logic
│   ├── evaluation.py     # Evaluation service
│   ├── transcription.py  # File transcription service
│   ├── smry_fdbk.py      # Summary and feedback service
│   └── evaluate_parameters.py # Parameter-based evaluation service
├── models/               # ML models and utilities
│   ├── sbert_model.py    # SBERT model for text embeddings
│   └── whisper_model.py  # Whisper model for audio transcription
└── utils/               # Utility functions
```

## API Endpoints

### 1. Evaluation Endpoints (`/api/evaluate/`)

#### POST `/api/evaluate/submission/`
Evaluates a student's submission using cosine similarity and parameter-based scoring.

**Request Body:**
```json
{
    "student_text": "Student's submission text",
    "ideal_text": "Ideal solution text"
}
```

**Response:**
```json
{
    "cosine_similarity": {
        "similarity_score": 85.5,
        "student_embedding": [...]
    },
    "parameter_scores": {
        "relevance": 85,
        "clarity": 90,
        "impact": 88,
        "completeness": 92
    }
}
```

#### POST `/api/evaluate/evaluate/parameters/`
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

#### POST `/api/generate_summary_feedback/`
Generates summary and constructive feedback for student submissions.

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
    "feedback": "Constructive feedback with strengths and areas for improvement"
}
```

### 4. Ideal Solution Endpoints (`/api/ideal_solution/`)

#### POST `/api/ideal_solution/store/`
Stores an ideal solution for future evaluations.

**Request Body:**
```json
{
    "ideal_text": "Ideal solution text",
    "problem_id": "unique_problem_id"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Ideal solution stored successfully",
    "embedding": [...]
}
```

## Running the FastAPI Backend

### Prerequisites
1. Python 3.8 or higher
2. pip (Python package manager)
3. Virtual environment (recommended)

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

4. **Set up environment variables**
   ```bash
   # Windows (PowerShell)
   $env:HF_API_KEY="your_huggingface_api_key"

   # Linux/Mac
   export HF_API_KEY="your_huggingface_api_key"
   ```

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Production mode
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. **Access the API**
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
   docker run -p 8000:8000 -e HF_API_KEY=your_huggingface_api_key fastapi-backend
   ```

## Dependencies

- FastAPI
- scikit-learn
- sentence-transformers
- PyPDF2
- python-docx
- pytesseract
- Pillow
- requests
- beautifulsoup4
- speech_recognition
- transformers (for Whisper model)
- uvicorn (ASGI server)
- python-multipart (for file uploads)
- pydantic (for data validation)

## Features

- Text similarity evaluation using SBERT embeddings
- Parameter-based evaluation with customizable criteria
- Multi-format file transcription
- AI-powered summary and feedback generation
- Support for various file types and formats
- RESTful API design with proper error handling
- Interactive API documentation
- Docker support for containerization

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
