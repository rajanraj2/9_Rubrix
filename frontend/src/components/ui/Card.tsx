import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover3D?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover3D = true
}) => {
  const baseClasses = "bg-white rounded-2xl shadow-card p-6 overflow-hidden relative";
  const hoverClasses = hover3D ? "hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300" : "";
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card; 