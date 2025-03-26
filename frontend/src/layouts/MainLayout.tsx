import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface MainLayoutProps {
  children: ReactNode;
  centered?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, centered = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-transparent">
      <Navbar />
      <div className={`pt-20 px-4 pb-12 ${centered ? 'flex flex-col items-center justify-center' : ''}`}>
        <div className={`container mx-auto ${centered ? 'max-w-6xl' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 