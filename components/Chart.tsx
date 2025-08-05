import React from 'react';

interface ChartProps {
  data: Array<{ date: string; value: number; label?: string }>;
  title: string;
  type?: 'line' | 'bar';
  color?: string;
  unit?: string;
}

const Chart: React.FC<ChartProps> = ({ data, title, type = 'line', color = '#3B82F6', unit = '' }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative h-64">
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
          
          {/* Data visualization */}
          {type === 'line' && data.length > 1 && (
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
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / Math.max(data.length - 1, 1)) * 100;
            const y = 100 - ((d.value - minValue) / range) * 100;
            
            return (
              <g key={i}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={color}
                  className="hover:r-6 transition-all"
                />
                <title>{`${d.date}: ${d.value}${unit}`}</title>
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
    </div>
  );
};

export default Chart;