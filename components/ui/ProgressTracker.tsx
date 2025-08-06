import React from 'react';
import { Card } from './Card';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  category: 'health' | 'fitness' | 'nutrition' | 'wellness';
}

interface ProgressTrackerProps {
  goals: Goal[];
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ goals, className = '' }) => {
  const getCategoryColor = (category: Goal['category']) => {
    const colors = {
      health: 'from-red-500 to-pink-500',
      fitness: 'from-blue-500 to-cyan-500',
      nutrition: 'from-green-500 to-emerald-500',
      wellness: 'from-purple-500 to-indigo-500'
    };
    return colors[category];
  };

  const getCategoryIcon = (category: Goal['category']) => {
    const icons = {
      health: '❤️',
      fitness: '💪',
      nutrition: '🥗',
      wellness: '🧘'
    };
    return icons[category];
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Progress Tracker</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All Goals
        </button>
      </div>

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isCompleted = progress >= 100;
          
          return (
            <div key={goal.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(goal.category)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg">{getCategoryIcon(goal.category)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                    <p className="text-sm text-gray-600">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>
                
                {isCompleted && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{progress.toFixed(0)}% Complete</span>
                  {goal.deadline && (
                    <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(goal.category)} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Action Button */}
              <button className="w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                {isCompleted ? 'View Details' : 'Update Progress'}
              </button>
            </div>
          );
        })}
      </div>
      
      {goals.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-gray-500 mb-4">No goals set yet</p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Set Your First Goal
          </button>
        </div>
      )}
    </Card>
  );
};

export const GoalCard: React.FC<{ goal: Goal; onUpdate: (id: string, current: number) => void }> = ({ 
  goal, 
  onUpdate 
}) => {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{goal.title}</h4>
        <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">
        {goal.current} / {goal.target} {goal.unit}
      </p>
    </Card>
  );
};