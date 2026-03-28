// src/components/ui/EmptyState.jsx
import React from 'react';
import Button from './Button';

const EmptyState = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      {icon ? (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">{icon}</div>
      ) : (
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      
      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="primary">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;