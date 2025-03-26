import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || 
      location.pathname === '/register/student' || 
      location.pathname === '/register/teacher'||
      location.pathname === '/admin/dashboard') {
    return null;
  }

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-semibold text-gray-900">Rubrix</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-6">
                <span className="text-gray-700 font-medium">
                  {user.fullName}
                </span>
                <button 
                  onClick={() => logout()}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transform hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-2">
          <div className="container mx-auto px-4">
            {user ? (
              <div className="space-y-2 py-2">
                <div className="text-gray-700 font-medium py-2">
                  {user.fullName} <span className="text-xs text-purple-600 ml-1">({user.role})</span>
                </div>
                <button 
                  onClick={() => { logout(); toggleMenu(); }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="block py-2 text-center text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                onClick={toggleMenu}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 