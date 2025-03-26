import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'pending';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, role: 'student' | 'teacher' | 'pending', pin: string) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        // Not logged in, do nothing
        console.log('User not logged in');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email: string,role: 'student' | 'teacher' | 'pending',  pin: string ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({ email, role,  pin });
      setUser(response.data.user);
      
      // Redirect to appropriate dashboard
      console.log("role in authcontext: " ,response.data.user.role);
      if (response.data.user.role === 'student') {
        navigate('/dashboard/student');
      } else {
        navigate('/dashboard/teacher');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register student function
  const registerStudent = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.registerStudent(data);
      setUser(response.data.user);
      navigate('/dashboard/student');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register teacher function
  const registerTeacher = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.registerTeacher(data);
      setUser(response.data.user);
      navigate('/dashboard/teacher');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        registerStudent,
        registerTeacher,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 