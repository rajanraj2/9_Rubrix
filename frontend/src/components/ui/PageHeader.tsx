import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center mb-4 sm:mb-0">
        {icon && (
          <div className="mr-4 bg-gradient-to-br from-purple-100 to-orange-100 p-3 rounded-lg shadow-md">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex space-x-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader; 