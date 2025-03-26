# Submission Processing Worker

This worker is responsible for processing submissions from the Redis queue and sending them to the FastAPI backend for transcription and evaluation.

## Setup

1. Make sure you have Node.js installed on your machine.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in the `.env` file in the backend directory:
   ```
   REDIS_URL=redis://localhost:6379
   FASTAPI_URL=http://127.0.0.1:8000
   WORKER_API_KEY=your_worker_api_key
   WORKER_POLLING_INTERVAL=5000
   ```

## Running the Worker

To start the worker, run:

```bash
node worker.js
```

The worker will:
1. Connect to Redis using the URL specified in the `.env` file
2. Poll the Redis queue at the interval specified in the `.env` file
3. Process submissions from the queue one by one
4. Send each submission to the FastAPI backend for transcription and evaluation
5. Update the submission in MongoDB with the evaluation results

## Data Flow

1. Student submits a solution (text, file, or both) via the frontend
2. The backend stores the submission in MongoDB and S3 (for files)
3. The backend adds the submission metadata to the Redis queue
4. The worker picks up the submission from the queue
5. The worker sends the submission to the FastAPI microservice
6. The FastAPI microservice transcribes the submission (if needed), evaluates it, and returns the results
7. The worker updates the submission in MongoDB with the evaluation results

## Troubleshooting

- If the worker fails to connect to Redis, check the Redis URL in the `.env` file
- If the worker fails to send submissions to the FastAPI backend, check the FASTAPI_URL in the `.env` file
- If the worker fails to update submissions in MongoDB, check the WORKER_API_KEY in the `.env` file

## Security

The worker uses an API key to authenticate with the backend. Make sure to set the WORKER_API_KEY in the `.env` file to a secure value. 