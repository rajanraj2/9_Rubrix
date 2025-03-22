import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || 
      location.pathname === '/register/student' || 
      location.pathname === '/register/teacher') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-semibold text-gray-900">Hackathon Platform</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  {user.fullName} ({user.role})
                </span>
                <button 
                  onClick={() => logout()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link 
                  to="/register/student"
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Student Sign Up
                </Link>
                <Link 
                  to="/register/teacher"
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Teacher Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 