# Hackathon Management Platform

A comprehensive platform for organizing and participating in hackathons, built with React, Node.js, Express, and MongoDB.

## Features

- User authentication with role-based access control (Student and Teacher roles)
- Teacher dashboard for creating and managing hackathons
- Student dashboard for participating in hackathons
- Submission management system
- Evaluation and shortlisting functionality
- Leaderboards for hackathon results

## Project Structure

The project is divided into two main parts:

- `frontend`: React application built with TypeScript, Tailwind CSS, and Vite
- `backend`: Node.js/Express API with MongoDB database

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hackathon-platform
   ```

2. Install dependencies for both frontend and backend:
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hackathon-platform
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

5. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

6. Open your browser and navigate to http://localhost:5173

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register/student` - Register a new student
- `POST /api/auth/register/teacher` - Register a new teacher
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Hackathon Endpoints

- `POST /api/hackathons` - Create a new hackathon (teacher only)
- `GET /api/hackathons` - Get all hackathons
- `GET /api/hackathons/:id` - Get a single hackathon
- `PUT /api/hackathons/:id` - Update a hackathon (teacher only)
- `DELETE /api/hackathons/:id` - Delete a hackathon (teacher only)
- `POST /api/hackathons/:id/participants` - Register for a hackathon
- `GET /api/hackathons/:id/participants` - Get hackathon participants (teacher only)
- `GET /api/hackathons/:id/submissions` - Get hackathon submissions (teacher only)
- `GET /api/hackathons/:id/leaderboard` - Get hackathon leaderboard
- `GET /api/hackathons/:id/shortlisted` - Get shortlisted submissions (teacher only)

### Submission Endpoints

- `POST /api/submissions` - Create a submission
- `GET /api/submissions/:id` - Get a submission
- `PUT /api/submissions/:id` - Update a submission (evaluation, teacher only)
- `POST /api/submissions/:id/shortlist` - Toggle shortlist status (teacher only)

## Technologies Used

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router DOM
- React Hook Form
- Zod
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

## License

This project is licensed under the MIT License 