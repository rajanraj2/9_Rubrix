import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  effect3D?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  effect3D = true,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const effect3DClasses = effect3D 
    ? 'shadow-button-3d transform hover:-translate-y-1 hover:shadow-button-3d-hover'
    : 'shadow-md hover:shadow-lg';
    
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`
        rounded-md font-medium transition-all ${sizeClasses[size]} 
        ${variantClasses[variant]} ${effect3DClasses} ${widthClass} 
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 