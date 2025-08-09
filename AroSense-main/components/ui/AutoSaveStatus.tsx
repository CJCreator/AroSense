import React from 'react';

interface AutoSaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  isSaving,
  lastSaved,
  className = ''
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSaving) {
    return (
      <div className={`flex items-center text-sm text-gray-500 ${className}`}>
        <div className="animate-spin w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full mr-2" />
        Saving...
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center text-sm text-green-600 ${className}`}>
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Saved at {formatTime(lastSaved)}
      </div>
    );
  }

  return null;
};