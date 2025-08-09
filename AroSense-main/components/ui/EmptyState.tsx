import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-6">
          <div className="text-6xl opacity-50">
            {icon}
          </div>
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

interface EmptyStateCardProps extends EmptyStateProps {
  gradient?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  gradient = 'from-gray-50 to-gray-100',
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl border border-gray-100 ${className}`}>
      <EmptyState {...props} />
    </div>
  );
};

export { EmptyState, EmptyStateCard };