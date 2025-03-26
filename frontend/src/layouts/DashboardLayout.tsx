import React, { ReactNode } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../lib/authContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Default to student if role is not available
  const role = user?.role as 'student' | 'teacher' || 'student';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-transparent">
      <Sidebar role={role} />
      <main className="flex-1 p-6 pt-8 overflow-hidden ml-64">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 