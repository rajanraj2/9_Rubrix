# Hackathon Platform Backend

Backend API for the Hackathon Platform application built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT)
- Role-based access control (Student and Teacher roles)
- Hackathon management
- Participant registration
- Submission handling
- Evaluation and shortlisting
- Leaderboard generation

## API Endpoints

### Authentication

- `POST /api/auth/register/student` - Register a new student
- `POST /api/auth/register/teacher` - Register a new teacher
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Hackathons

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

### Submissions

- `POST /api/submissions` - Create a submission
- `GET /api/submissions/:id` - Get a submission
- `PUT /api/submissions/:id` - Update a submission (evaluation, teacher only)
- `POST /api/submissions/:id/shortlist` - Toggle shortlist status (teacher only)

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hackathon-platform
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```
4. Start the server:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js 