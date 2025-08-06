import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Chart, { HealthMetricChart, WeightChart, BloodPressureChart } from '../components/Chart';
import { ProgressTracker } from '../components/ui/ProgressTracker';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { DashboardWidget } from '../components/ui';
import Button from '../components/ui/Button';

interface HealthInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
  action?: string;
}

const AnalyticsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('weight');

  // Mock data - replace with actual service calls
  const healthData = {
    weight: [
      { date: '2024-01-01', value: 180 },
      { date: '2024-01-15', value: 178 },
      { date: '2024-02-01', value: 176 },
      { date: '2024-02-15', value: 175 },
      { date: '2024-03-01', value: 174 }
    ],
    bloodPressure: [
      { date: '2024-01-01', value: 130 },
      { date: '2024-01-15', value: 125 },
      { date: '2024-02-01', value: 128 },
      { date: '2024-02-15', value: 122 },
      { date: '2024-03-01', value: 120 }
    ],
    heartRate: [
      { date: '2024-01-01', value: 72 },
      { date: '2024-01-15', value: 68 },
      { date: '2024-02-01', value: 70 },
      { date: '2024-02-15', value: 65 },
      { date: '2024-03-01', value: 67 }
    ]
  };

  const goals = [
    {
      id: '1',
      title: 'Lose 10 pounds',
      target: 10,
      current: 6,
      unit: 'lbs',
      deadline: '2024-06-01',
      category: 'fitness' as const
    },
    {
      id: '2',
      title: 'Walk 10,000 steps daily',
      target: 10000,
      current: 8500,
      unit: 'steps',
      category: 'fitness' as const
    },
    {
      id: '3',
      title: 'Drink 8 glasses of water',
      target: 8,
      current: 6,
      unit: 'glasses',
      category: 'wellness' as const
    }
  ];

  const insights: HealthInsight[] = [
    {
      id: '1',
      title: 'Great Progress on Weight Loss',
      description: 'You\'ve lost 6 pounds in the last 3 months. Keep up the excellent work!',
      type: 'positive',
      action: 'View Weight Trends'
    },
    {
      id: '2',
      title: 'Blood Pressure Improving',
      description: 'Your blood pressure has decreased by 10 mmHg since January.',
      type: 'positive'
    },
    {
      id: '3',
      title: 'Hydration Goal Needs Attention',
      description: 'You\'re averaging 6 glasses of water daily. Try to reach your 8-glass goal.',
      type: 'warning',
      action: 'Set Reminders'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Health Analytics</h1>
                <p className="text-gray-600 mt-1">Insights and trends from your health data</p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              {(['7d', '30d', '90d', '1y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardWidget
            title="Current Weight"
            value="174 lbs"
            change={{ value: "-6 lbs this month", trend: 'down' }}
            icon={<span className="text-2xl">⚖️</span>}
            variant="gradient"
            gradient="from-blue-500 to-cyan-600"
          />
          
          <DashboardWidget
            title="Blood Pressure"
            value="120/80"
            change={{ value: "Optimal range", trend: 'up' }}
            icon={<span className="text-2xl">❤️</span>}
            variant="gradient"
            gradient="from-red-500 to-pink-600"
          />
          
          <DashboardWidget
            title="Heart Rate"
            value="67 bpm"
            change={{ value: "Resting rate", trend: 'stable' }}
            icon={<span className="text-2xl">💓</span>}
            variant="gradient"
            gradient="from-purple-500 to-indigo-600"
          />
          
          <DashboardWidget
            title="Health Score"
            value="87%"
            change={{ value: "+5% this week", trend: 'up' }}
            icon={<span className="text-2xl">📊</span>}
            variant="gradient"
            gradient="from-green-500 to-emerald-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeightChart data={healthData.weight} />
          <BloodPressureChart data={healthData.bloodPressure} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Tracker */}
          <div className="lg:col-span-2">
            <ProgressTracker goals={goals} />
          </div>

          {/* Health Insights */}
          <div>
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Health Insights</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {insights.map(insight => (
                  <div key={insight.id} className={`p-4 rounded-xl border-l-4 ${
                    insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <h4 className="font-semibold text-gray-800 mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    {insight.action && (
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {insight.action} →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;