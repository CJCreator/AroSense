import React from 'react';
import { Card } from './Card';
import Chart from '../Chart';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  data: Array<{ date: string; value: number }>;
  target?: number;
  color: string;
}

interface HealthMetricsWidgetProps {
  metrics: HealthMetric[];
  className?: string;
}

export const HealthMetricsWidget: React.FC<HealthMetricsWidgetProps> = ({ 
  metrics, 
  className = '' 
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Health Metrics</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map(metric => (
          <div key={metric.id} className="space-y-4">
            {/* Metric Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{metric.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold" style={{ color: metric.color }}>
                    {metric.value}{metric.unit}
                  </span>
                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {metric.trend === 'up' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      ) : metric.trend === 'down' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      )}
                    </svg>
                    <span>{Math.abs(metric.change)}{metric.unit}</span>
                  </div>
                </div>
              </div>
              
              {/* Target Progress */}
              {metric.target && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Target: {metric.target}{metric.unit}</div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                        backgroundColor: metric.color
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mini Chart */}
            <div className="h-20">
              <Chart
                data={metric.data}
                title=""
                type="line"
                color={metric.color}
                unit={metric.unit}
                showTrend={false}
                interactive={false}
                height={80}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const MetricCard: React.FC<{ metric: HealthMetric }> = ({ metric }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-gray-800">{metric.name}</h4>
      <div className={`flex items-center space-x-1 text-sm ${
        metric.trend === 'up' ? 'text-green-600' : 
        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
      }`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {metric.trend === 'up' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          ) : metric.trend === 'down' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          )}
        </svg>
        <span>{Math.abs(metric.change)}</span>
      </div>
    </div>
    
    <div className="text-2xl font-bold mb-2" style={{ color: metric.color }}>
      {metric.value}{metric.unit}
    </div>
    
    {metric.target && (
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Target: {metric.target}{metric.unit}</span>
        <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
      </div>
    )}
  </Card>
);