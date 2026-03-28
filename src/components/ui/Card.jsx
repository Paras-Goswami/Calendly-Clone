// src/components/ui/Card.jsx
import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  const hoverStyles = hoverable ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 flex justify-between items-center ${className}`}>
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export default Card;