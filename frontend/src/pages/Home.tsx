import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, GraduationCap, School } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-transparent pt-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white p-3 rounded-xl shadow-lg animate-float">
              <Code2 className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Rubrix
              <span className="block text-lg md:text-xl font-semibold text-gray-600 mt-2">
                Learning Through Creation
              </span>
            </h1>
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            An educational platform that empowers students through creative coding challenges and meaningful projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <Link
            to="/register/student"
            className="group bg-white rounded-2xl transform hover:-translate-y-2 transition-all duration-300 p-8 flex flex-col items-center shadow-card hover:shadow-card-hover overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-purple-100 p-4 rounded-xl mb-6 transform group-hover:scale-110 transition-transform relative z-10">
              <GraduationCap className="w-16 h-16 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 relative z-10">I am a Student</h2>
            <p className="text-gray-600 text-center relative z-10">
              Join competitions, showcase your skills, and connect with other creative students.
            </p>
            <div className="mt-6 relative z-10">
              <span className="px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-md shadow-button-3d transform translate-y-0 hover:-translate-y-1 hover:shadow-button-3d-hover transition-all inline-block">
                Register Now
              </span>
            </div>
          </Link>

          <Link
            to="/register/teacher"
            className="group bg-white rounded-2xl transform hover:-translate-y-2 transition-all duration-300 p-8 flex flex-col items-center shadow-card hover:shadow-card-hover overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-orange-100 p-4 rounded-xl mb-6 transform group-hover:scale-110 transition-transform relative z-10">
              <School className="w-16 h-16 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 relative z-10">I am a Teacher</h2>
            <p className="text-gray-600 text-center relative z-10">
              Create challenges, mentor students, and facilitate hands-on learning experiences.
            </p>
            <div className="mt-6 relative z-10">
              <span className="px-6 py-3 text-sm font-medium text-white bg-orange-600 rounded-md shadow-button-3d transform translate-y-0 hover:-translate-y-1 hover:shadow-button-3d-hover transition-all inline-block">
                Register Now
              </span>
            </div>
          </Link>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-gray-600">
            Already have an account? <Link to="/login" className="text-purple-600 font-medium hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;