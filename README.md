# Hackathon Management Platform

A comprehensive platform for managing hackathons, enabling students to participate in challenges and teachers to create, manage, and evaluate submissions.

## Features

### Student Features
- Register and create a student account
- Join hackathons through uniquely shared codes or through regular registration
- Submit projects with files and descriptions
- View submission status and feedback

### Teacher Features
- Register and create a teacher account
- Create and manage hackathons
- Control access to hackathons through eligibility criteria including:
  - Grade-based access
  - School-based access
  - State/region-based access
  - Code-only access (restricting access to only those with the unique code)
- Generate and share unique codes for controlling hackathon access
- Set evaluation parameters
- Review and evaluate student submissions
- Shortlist promising submissions
- Access leaderboards

## Key Security Features
- Flexible access control: Teachers can choose between open registration or code-only registration
- Code-based access: When "Code-only" eligibility is selected, students need a valid code to join
- Role-based visibility: Join codes are only visible to teachers who created the hackathon or are collaborators 
- Automatic registration: Students are automatically registered as participants when joining with a valid code

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- TailwindCSS for styling
- React Hook Form for form handling
- Lucide icons

### Backend
- Node.js and Express
- MongoDB with Mongoose for data modeling
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation and Setup

1. Clone the repository
```
git clone <repository-url>
cd hackathon-platform
```

2. Install dependencies
```
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create environment variables
```
# In the backend directory, create a .env file with the following:
MONGODB_URI=mongodb://localhost:27017/hackathon-platform
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:5173
PORT=5001
```

4. Run the application
```
# Start the backend server
cd backend
npm run dev

# Start the frontend development server
cd ../frontend
npm run dev
```

5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register/student` - Register a student
- `POST /api/auth/register/teacher` - Register a teacher
- `POST /api/auth/login` - Login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Hackathons
- `GET /api/hackathons` - Get all hackathons (for teachers) or joined hackathons (for students)
- `GET /api/hackathons/completed` - Get completed hackathons
- `GET /api/hackathons/:id` - Get a specific hackathon
- `POST /api/hackathons` - Create a hackathon
- `PUT /api/hackathons/:id` - Update a hackathon
- `DELETE /api/hackathons/:id` - Delete a hackathon
- `POST /api/hackathons/:id/collaborators` - Add collaborators
- `POST /api/hackathons/:id/participants` - Register participants
- `GET /api/hackathons/:id/participants` - Get participants list
- `GET /api/hackathons/:id/leaderboard` - Get leaderboard
- `GET /api/hackathons/:id/submissions` - Get all submissions
- `GET /api/hackathons/:id/shortlisted` - Get shortlisted submissions
- `POST /api/hackathons/join-by-code` - Join a hackathon using a unique code (student exclusive)

### Submissions
- `POST /api/submissions` - Create a submission
- `GET /api/submissions/:id` - Get a submission
- `PUT /api/submissions/:id` - Evaluate a submission
- `POST /api/submissions/:id/shortlist` - Toggle shortlist status

## License
MIT 