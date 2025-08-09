import React, { useState } from 'react';
import { Card } from './ui/Card';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface ChartProps {
  data: DataPoint[];
  title: string;
  type?: 'line' | 'bar' | 'area';
  color?: string;
  unit?: string;
  showTrend?: boolean;
  interactive?: boolean;
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ 
  data, 
  title, 
  type = 'line', 
  color = '#3B82F6', 
  unit = '', 
  showTrend = true,
  interactive = true,
  height = 256
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center py-12 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p>No data available</p>
          </div>
        </div>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const trend = data.length > 1 ? (data[data.length - 1].value > data[0].value ? 'up' : 'down') : 'stable';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showTrend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {trend === 'up' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : trend === 'down' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
            <span>{trend === 'up' ? 'Trending up' : trend === 'down' ? 'Trending down' : 'Stable'}</span>
          </div>
        )}
      </div>
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={`${ratio * 100}%`}
              x2="100%"
              y2={`${ratio * 100}%`}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Area fill for area chart */}
          {type === 'area' && data.length > 1 && (
            <polygon
              fill={`${color}20`}
              stroke={color}
              strokeWidth="2"
              points={[
                ...data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 100 - ((d.value - minValue) / range) * 100;
                  return `${x},${y}`;
                }),
                `100,100`,
                `0,100`
              ].join(' ')}
            />
          )}
          
          {/* Line for line and area charts */}
          {(type === 'line' || type === 'area') && data.length > 1 && (
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((d.value - minValue) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}
          
          {/* Bars for bar chart */}
          {type === 'bar' && data.map((d, i) => {
            const x = (i / data.length) * 100;
            const barWidth = 80 / data.length;
            const y = 100 - ((d.value - minValue) / range) * 100;
            const barHeight = ((d.value - minValue) / range) * 100;
            
            return (
              <rect
                key={i}
                x={`${x + (100 / data.length - barWidth) / 2}%`}
                y={`${y}%`}
                width={`${barWidth}%`}
                height={`${barHeight}%`}
                fill={color}
                className={interactive ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''}
                onMouseEnter={() => interactive && setHoveredPoint(i)}
                onMouseLeave={() => interactive && setHoveredPoint(null)}
              />
            );
          })}
          
          {/* Data points for line and area charts */}
          {(type === 'line' || type === 'area') && data.map((d, i) => {
            const x = (i / Math.max(data.length - 1, 1)) * 100;
            const y = 100 - ((d.value - minValue) / range) * 100;
            const isHovered = hoveredPoint === i;
            
            return (
              <g key={i}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={isHovered ? 6 : 4}
                  fill={color}
                  className={interactive ? 'transition-all cursor-pointer hover:r-6' : ''}
                  onMouseEnter={() => interactive && setHoveredPoint(i)}
                  onMouseLeave={() => interactive && setHoveredPoint(null)}
                />
                {isHovered && interactive && (
                  <g>
                    <rect
                      x={`${x}%`}
                      y={`${y - 8}%`}
                      width="60"
                      height="20"
                      fill="rgba(0,0,0,0.8)"
                      rx="4"
                      transform="translate(-30, -25)"
                    />
                    <text
                      x={`${x}%`}
                      y={`${y - 8}%`}
                      fill="white"
                      fontSize="12"
                      textAnchor="middle"
                      transform="translate(0, -10)"
                    >
                      {d.value}{unit}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue.toFixed(1)}{unit}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}{unit}</span>
          <span>{minValue.toFixed(1)}{unit}</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data[0]?.date}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.date}</span>}
        <span>{data[data.length - 1]?.date}</span>
      </div>
      
      {/* Summary stats */}
      {interactive && (
        <div className="flex justify-between text-xs text-gray-600 mt-4 pt-4 border-t">
          <div>
            <span className="font-medium">Min:</span> {minValue.toFixed(1)}{unit}
          </div>
          <div>
            <span className="font-medium">Max:</span> {maxValue.toFixed(1)}{unit}
          </div>
          <div>
            <span className="font-medium">Avg:</span> {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}{unit}
          </div>
        </div>
      )}
    </Card>
  );
};

export default Chart;

// Pre-built chart components
export const HealthMetricChart: React.FC<{
  data: DataPoint[];
  metric: string;
  unit: string;
  color?: string;
}> = ({ data, metric, unit, color = '#10B981' }) => (
  <Chart
    data={data}
    title={`${metric} Trend`}
    type="area"
    color={color}
    unit={unit}
    showTrend
    interactive
  />
);

export const WeightChart: React.FC<{ data: DataPoint[] }> = ({ data }) => (
  <HealthMetricChart data={data} metric="Weight" unit=" lbs" color="#3B82F6" />
);

export const BloodPressureChart: React.FC<{ data: DataPoint[] }> = ({ data }) => (
  <HealthMetricChart data={data} metric="Blood Pressure" unit=" mmHg" color="#EF4444" />
);