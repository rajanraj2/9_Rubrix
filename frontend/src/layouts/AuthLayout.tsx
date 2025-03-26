import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-transparent">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-xl shadow-lg animate-float">
              <Code2 className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rubrix
              <span className="block text-sm font-normal text-gray-600 mt-1">
                Learning Through Creation
              </span>
            </h1>
          </Link>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-card overflow-hidden transform hover:shadow-card-hover transition-all duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;