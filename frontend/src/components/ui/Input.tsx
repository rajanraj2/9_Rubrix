import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, icon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            className={cn(
              "w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:shadow-sm",
              icon ? "pl-10" : "",
              error 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-purple-500 focus:border-purple-500",
              "placeholder:text-gray-400 hover:border-gray-400",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;