import React from 'react';
import { Card, CardHeader, CardContent } from './Card';
import Button from './Button';

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  value?: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  variant?: 'default' | 'gradient';
  gradient?: string;
  className?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  icon,
  value,
  change,
  action,
  children,
  variant = 'default',
  gradient = 'from-blue-500 to-purple-600',
  className = ''
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  if (variant === 'gradient') {
    return (
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-white/80">{icon}</div>}
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
            </div>
          </div>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="text-white hover:bg-white/20"
            >
              {action.label}
            </Button>
          )}
        </div>
        
        {value && (
          <div className="mb-4">
            <div className="text-3xl font-bold mb-1">{value}</div>
            {change && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(change.trend)}
                <span className="text-sm text-white/80">{change.value}</span>
              </div>
            )}
          </div>
        )}
        
        {children}
      </div>
    );
  }

  return (
    <Card variant="elevated" className={className}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={action && (
          <Button variant="ghost" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      />
      
      <CardContent>
        {value && (
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
            {change && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(change.trend)}
                <span className="text-sm text-gray-600">{change.value}</span>
              </div>
            )}
          </div>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;