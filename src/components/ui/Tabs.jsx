// src/components/ui/Tabs.jsx
import React from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="mb-6">
      <nav className="flex space-x-2" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } px-4 py-2 font-medium text-sm rounded-md transition-colors`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;