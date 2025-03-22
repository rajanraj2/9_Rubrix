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
import HackathonSubmission from './pages/dashboard/HackathonSubmission';
import CompletedHackathonView from './pages/dashboard/CompletedHackathonView';
import CreateHackathon from './pages/dashboard/CreateHackathon';
import LeaderboardPage from './pages/dashboard/LeaderboardPage';
import ShortlistedPage from './pages/dashboard/ShortlistedPage';
import Navbar from './components/Navbar';

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

        {/* Student Routes */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/student/hackathon/:hackathonId" element={<HackathonSubmission />} />
          <Route path="/dashboard/student/hackathon/:hackathonId/submission" element={<CompletedHackathonView />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute role="teacher" />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/create-hackathon" element={<CreateHackathon />} />
          <Route path="/dashboard/teacher/hackathon/:hackathonId" element={<HackathonDetails />} />
          <Route path="/dashboard/teacher/hackathon/:hackathonId/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dashboard/teacher/hackathon/:hackathonId/shortlisted" element={<ShortlistedPage />} />
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