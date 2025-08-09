import React from 'react';

interface EmptyStateProps {
  message: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, className = '' }) => (
  <div className={`text-center text-textSecondary py-4 ${className}`}>{message}</div>
);

export default EmptyState;
