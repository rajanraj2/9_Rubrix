# Hackathon Evaluation Service

This service provides AI-powered evaluation of hackathon submissions by processing files from S3, transcribing text content, and performing semantic analysis to score submissions against predefined parameters.

## Features

- **File Transcription**: Extract text from various file formats (PDF, DOCX, images, audio, video)
- **Semantic Analysis**: Evaluate submission content using similarity metrics against evaluation parameters
- **Parameter-based Scoring**: Score submissions on multiple parameters with customizable weights
- **Hackathon Statistics**: Generate aggregate statistics and visualizations for hackathon submissions
- **MongoDB Integration**: Store evaluation results for persistence and retrieval

## External Dependencies

This project requires the following external dependencies:

1. **FFmpeg**: Required for audio extraction from video files
   - **macOS**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Ensure you have FFmpeg installed (see above)
4. Create a `.env` file with your AWS and MongoDB credentials:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   MONGO_URI=your_mongo_uri
   ```
5. Run the server:
   ```
   uvicorn main:app --reload
   ```

## API Endpoints

### Transcription Endpoints

1. **Direct File Upload Transcription**
   - `POST /api/transcribe/`
   - Upload a file to extract text
   - Supports documents, images, audio, and video files

2. **S3 File Transcription**
   - `POST /api/transcribe_s3/`
   - Request body: `{"s3_url": "https://your-bucket.s3.amazonaws.com/your-file.ext"}`
   - Transcribes files from S3 without evaluation
   - Supports documents, images, audio, and video files

### Evaluation Endpoints

1. **Transcribe and Evaluate S3 File**
   - `POST /api/transcribe_and_evaluate/`
   - Extracts text from an S3 file and evaluates it against parameters
   - Supports documents, images, audio, and video files

2. **Get Evaluation by Submission ID**
   - `GET /api/evaluation/{submission_id}`
   - Returns the evaluation results for a specific submission

3. **Get All Evaluations for a Hackathon**
   - `GET /api/hackathon/{hackathon_id}/evaluations`
   - Returns all evaluations for a specific hackathon

4. **Get Hackathon Statistics**
   - `GET /api/hackathon/{hackathon_id}/statistics`
   - Returns statistics for evaluations in a hackathon

## S3 File Handling

The service provides robust handling for downloading and processing files from S3. It supports:

1. **Various S3 URL Formats**:
   - `s3://bucket-name/key`
   - `https://bucket-name.s3.region.amazonaws.com/key`
   - `https://s3.amazonaws.com/bucket-name/key`
   - Presigned URLs with query parameters

2. **Multiple File Types**:
   - Documents: PDF, DOCX, etc.
   - Images: JPG, PNG, etc.
   - Audio: MP3, WAV, etc.
   - Video: MP4, AVI, MOV, etc.
   - Text files: TXT, MD, etc.

3. **Transcription Pipeline**:
   - File is downloaded from S3 to a temporary directory
   - Text is extracted using the appropriate method based on file type
   - For videos and audio, content is transcribed using Whisper
   - Temporary files are cleaned up after processing

## API Usage Examples

### Transcribe File from S3

```bash
curl -X POST "http://localhost:8000/api/transcribe_s3/" \
  -H "Content-Type: application/json" \
  -d '{"s3_url": "https://your-bucket.s3.amazonaws.com/your-file.pdf"}'
```

### Transcribe and Evaluate Submission

```bash
curl -X POST "http://localhost:8000/api/transcribe_and_evaluate/" \
  -H "Content-Type: application/json" \
  -d '{
    "s3_url": "https://your-bucket.s3.amazonaws.com/submission.mp4",
    "submission_id": "sub123",
    "hackathon_id": "hack456",
    "parameters": [
      {
        "id": "creativity",
        "name": "Creativity",
        "description": "How creative and original is the solution?"
      },
      {
        "id": "technical",
        "name": "Technical Implementation",
        "description": "How well was the technical implementation done?"
      }
    ]
  }'
```

### Get Evaluation Results

```bash
curl -X GET "http://localhost:8000/api/evaluation/sub123"
```

## Error Handling

The service provides detailed error handling for:
- Invalid S3 URLs
- Failed downloads
- Unsupported file types
- Transcription errors
- Evaluation failures

All errors are logged and appropriate error responses are returned to the client.

## Architecture

The service is built with FastAPI and follows a modular architecture:

- **Routes**: API endpoints and request/response handling
- **Services**: Business logic and processing
- **Models**: ML models for text encoding and analysis
- **Utils**: Database connection and helper functions

## Integration with Main Backend

The service is designed to work with the main hackathon platform:

1. The main backend generates presigned URLs for files stored in S3
2. These URLs are sent to this service along with submission information
3. This service processes the file, evaluates the content, and stores results
4. The main backend can retrieve evaluation results and statistics
