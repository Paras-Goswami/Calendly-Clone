// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  as = 'input',
  className = '',
  helperText,
  children, // used for <select> options
  ...props
}, ref) => {
  const Component = as;
  
  const baseInputStyles = 'mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors';
  const errorStyles = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  
  // Specific padding for different elements
  const elementStyles = as === 'textarea' ? 'py-2 px-3' : 'h-10 px-3';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Component
        ref={ref}
        className={`${baseInputStyles} ${errorStyles} ${elementStyles}`}
        {...props}
      >
        {children}
      </Component>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;