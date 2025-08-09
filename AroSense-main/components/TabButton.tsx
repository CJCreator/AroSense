import React from 'react';

interface TabButtonProps {
  tabName: string;
  currentTab: string;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ tabName, currentTab, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1.5 flex-shrink-0 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap
      ${currentTab === tabName 
        ? 'border-primary text-primary bg-surface shadow-sm' 
        : 'border-transparent text-textSecondary hover:text-primary hover:bg-slate-50'}`}
    role="tab"
    aria-selected={currentTab === tabName}
  >
    {icon}
    <span>{children}</span>
  </button>
);

export default TabButton;
