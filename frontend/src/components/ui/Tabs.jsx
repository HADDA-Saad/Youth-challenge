import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-dark-700 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;
        
        return (
          <button
            key={tab.id}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-6 text-sm font-medium transition-colors border-b-2 
              ${isActive 
                ? 'border-primary-500 text-primary-400' 
                : isDisabled 
                  ? 'border-transparent text-dark-600 cursor-not-allowed opacity-50' 
                  : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
