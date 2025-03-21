import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import StudentRegistration from './pages/auth/StudentRegistration';
import TeacherRegistration from './pages/auth/TeacherRegistration';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import HackathonDetails from './pages/dashboard/HackathonDetails';
import LeaderboardPage from './pages/dashboard/LeaderboardPage';
import ShortlistedPage from './pages/dashboard/ShortlistedPage';
import CreateHackathon from './pages/dashboard/CreateHackathon';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import HackathonSubmission from './pages/dashboard/HackathonSubmission';
import CompletedHackathonView from './pages/dashboard/CompletedHackathonView';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/register/teacher" element={<TeacherRegistration />} />
        </Route>
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/student/hackathon/:hackathonId" element={<HackathonSubmission />} />
        <Route path="/dashboard/student/hackathon/:hackathonId/submission" element={<CompletedHackathonView />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/teacher/create" element={<CreateHackathon />} />
        <Route path="/dashboard/teacher/hackathon/:hackathonId" element={<HackathonDetails />} />
        <Route path="/dashboard/teacher/hackathon/:hackathonId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/dashboard/teacher/hackathon/:hackathonId/shortlisted" element={<ShortlistedPage />} />
      </Routes>
    </Router>
  );
};

export default App;