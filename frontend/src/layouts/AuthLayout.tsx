import React from 'react';
import { Outlet } from 'react-router-dom';
import { Code2 } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Hackathon Platform</h1>
          </div>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;