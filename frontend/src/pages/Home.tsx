import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, GraduationCap, School, LogIn } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Code2 className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Hackathon Platform</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our platform to participate in or organize exciting hackathons. Connect with talented developers and showcase your skills.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            to="/register/student"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 flex flex-col items-center"
          >
            <GraduationCap className="w-16 h-16 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Student Registration</h2>
            <p className="text-gray-600 text-center">
              Register as a student to participate in hackathons and showcase your innovative solutions.
            </p>
          </Link>

          <Link
            to="/register/teacher"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 flex flex-col items-center"
          >
            <School className="w-16 h-16 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Teacher Registration</h2>
            <p className="text-gray-600 text-center">
              Join as a teacher to create and manage hackathons, evaluate submissions, and mentor students.
            </p>
          </Link>

          <Link
            to="/login"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 flex flex-col items-center"
          >
            <LogIn className="w-16 h-16 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Login</h2>
            <p className="text-gray-600 text-center">
              Already have an account? Login here to access your dashboard and continue your journey.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;