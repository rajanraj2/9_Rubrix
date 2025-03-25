import requests
import json

# API base URL
API_BASE_URL = "http://localhost:8000/api"

def test_root_endpoint():
    """Test if the API is running."""
    response = requests.get("http://localhost:8000/")
    print(f"Root endpoint status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_transcribe_s3_video():
    """Test transcribing a video file from S3."""
    
    # S3 URL for a test video file
    # Note: Replace this with a valid S3 URL to a video file for actual testing
    test_video_url = "https://your-bucket.s3.amazonaws.com/test-video.mp4"
    
    # Request body
    payload = {
        "s3_url": test_video_url
    }
    
    # Uncomment to make an actual API call
    # response = requests.post(f"{API_BASE_URL}/transcribe_s3/", json=payload)
    # print(f"Transcribe S3 video status: {response.status_code}")
    # print(f"Response: {response.json()}")
    
    print(f"Would send request to {API_BASE_URL}/transcribe_s3/ with payload: {json.dumps(payload, indent=2)}")
    print("Note: This is a simulated test. For actual testing, replace the S3 URL and uncomment the request.")

def test_evaluation_with_sample_data():
    """Test evaluating a submission with sample data."""
    
    # Request body
    payload = {
        "s3_url": "https://your-bucket.s3.amazonaws.com/test-file.pdf",
        "submission_id": "test-submission-123",
        "hackathon_id": "hackathon-2023",
        "parameters": [
            {
                "id": "creativity",
                "name": "Creativity",
                "description": "How creative and original is the solution?"
            },
            {
                "id": "implementation",
                "name": "Technical Implementation",
                "description": "How well was the technical implementation done?"
            },
            {
                "id": "presentation",
                "name": "Presentation",
                "description": "How well is the idea presented?"
            }
        ]
    }
    
    # Uncomment to make an actual API call
    # response = requests.post(f"{API_BASE_URL}/transcribe_and_evaluate/", json=payload)
    # print(f"Evaluation status: {response.status_code}")
    # print(f"Response: {response.json()}")
    
    print(f"Would send request to {API_BASE_URL}/transcribe_and_evaluate/ with payload: {json.dumps(payload, indent=2)}")
    print("Note: This is a simulated test. For actual testing, replace the S3 URL and uncomment the request.")

def print_api_documentation():
    """Print documentation for the API endpoints."""
    print("\n=== API DOCUMENTATION ===")
    print("\n1. Transcribe a file (direct upload):")
    print("   POST /api/transcribe/")
    print("   - Upload a file to extract text")
    
    print("\n2. Transcribe a file from S3:")
    print("   POST /api/transcribe_s3/")
    print('   - Request body: {"s3_url": "https://your-bucket.s3.amazonaws.com/your-file.mp4"}')
    print("   - Supports all file types including videos")
    
    print("\n3. Transcribe and evaluate a submission:")
    print("   POST /api/transcribe_and_evaluate/")
    print("   - Extracts text from an S3 file and evaluates it against parameters")
    print("   - Returns evaluation scores for each parameter")
    
    print("\n4. Get evaluation for a submission:")
    print("   GET /api/evaluation/{submission_id}")
    print("   - Returns the evaluation for a specific submission")
    
    print("\n5. Get all evaluations for a hackathon:")
    print("   GET /api/hackathon/{hackathon_id}/evaluations")
    print("   - Returns all evaluations for a specific hackathon")
    
    print("\n6. Get statistics for a hackathon:")
    print("   GET /api/hackathon/{hackathon_id}/statistics")
    print("   - Returns statistics for evaluations in a hackathon")
    print("   - Includes average scores and score distribution")
    print("\n=============================")

if __name__ == "__main__":
    # Test if the API is running
    test_root_endpoint()
    
    # Print the API documentation
    print_api_documentation()
    
    # Test the video transcription endpoint
    test_transcribe_s3_video()
    
    # Test the evaluation endpoint
    test_evaluation_with_sample_data() 