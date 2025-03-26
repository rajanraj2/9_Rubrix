import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "w-full px-3 py-2 border rounded-lg appearance-none transition-all duration-200 pr-10 focus:outline-none focus:ring-2 focus:shadow-sm",
              error 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-purple-500 focus:border-purple-500",
              "hover:border-gray-400",
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;