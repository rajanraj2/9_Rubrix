import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import StudentRegistration from './pages/auth/StudentRegistration';
import TeacherRegistration from './pages/auth/TeacherRegistration';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import HackathonDetails from './pages/dashboard/HackathonDetails';
import HackathonDetail from './pages/dashboard/HackathonDetail';
import HackathonSubmission from './pages/dashboard/HackathonSubmission';
import CreateHackathon from './pages/dashboard/CreateHackathon';
import LeaderboardPage from './pages/dashboard/LeaderboardPage';
import ShortlistedPage from './pages/dashboard/ShortlistedPage';

import Navbar from './components/Navbar';
import AdminLogin from './pages/auth/AdminLogin';
import ProtectedAdminRoute from './pages/utils/ProtectedAdminRoute';
import AdminDashboard from './pages/dashboard/AdminDashBoard';
import SubmissionViewPage from './pages/dashboard/SubmissionViewPage';
import CompletedHackathonView from './pages/dashboard/CompletedHackathonView';


// Protected route component
const ProtectedRoute = ({ role }: { role?: 'student' | 'teacher' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <Outlet />;
};

const AppWithAuth = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
       
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/register/teacher" element={<TeacherRegistration />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>


        {/* Student Routes */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/student/hackathon/:hackathonId" element={<HackathonDetail />} />
          <Route path="/dashboard/student/hackathon/:hackathonId/submission" element={<HackathonSubmission />} />
          <Route path="/dashboard/student/completed-hackathons" element={<CompletedHackathonView />} />
          <Route path="/dashboard/student/ongoing-hackathons" element={<StudentDashboard />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute role="teacher" />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/create-hackathon" element={<CreateHackathon />} />
          <Route path="/dashboard/teacher/hackathon/:hackathonId" element={<HackathonDetails />} />
          <Route path="/dashboard/teacher/hackathon/:hackathonId/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dashboard/teacher/hackathon/:hackathonId/shortlisted" element={<ShortlistedPage />} />

          <Route path="/dashboard/teacher/submission/:submissionId" element={<SubmissionViewPage />} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </Router>
  );
};

export default App;