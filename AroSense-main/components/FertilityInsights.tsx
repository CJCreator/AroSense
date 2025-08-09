import React from 'react';
import type { MenstrualCycle, FertilityWindow } from '../types/phase2Types';
import { getFertilityStatus, predictNextCycle, getCurrentCycleDay } from '../utils/fertilityCalculator';

interface FertilityInsightsProps {
  cycles: MenstrualCycle[];
  fertilityWindows: FertilityWindow[];
}

const FertilityInsights: React.FC<FertilityInsightsProps> = ({ cycles, fertilityWindows }) => {
  const fertilityStatus = getFertilityStatus(cycles, fertilityWindows);
  const nextCyclePrediction = predictNextCycle(cycles);
  const currentCycleDay = getCurrentCycleDay(cycles);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menstrual': return 'bg-red-100 text-red-800 border-red-200';
      case 'fertile': return 'bg-green-100 text-green-800 border-green-200';
      case 'ovulation': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'luteal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'menstrual': return '🩸';
      case 'fertile': return '🌱';
      case 'ovulation': return '🥚';
      case 'luteal': return '🌙';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Fertility Insights</h3>
      
      {/* Current Status */}
      <div className={`p-4 rounded-lg border-2 mb-4 ${getStatusColor(fertilityStatus.status)}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(fertilityStatus.status)}</span>
          <div>
            <p className="font-semibold capitalize">{fertilityStatus.status} Phase</p>
            <p className="text-sm">{fertilityStatus.message}</p>
          </div>
        </div>
      </div>

      {/* Cycle Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-700">
            {currentCycleDay || '?'}
          </p>
          <p className="text-xs text-gray-600">Current Cycle Day</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-700">
            {cycles.length > 0 ? 
              Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length) : 
              28
            }
          </p>
          <p className="text-xs text-gray-600">Avg Cycle Length</p>
        </div>
      </div>

      {/* Predictions */}
      {nextCyclePrediction && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Predictions</h4>
          
          <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>🥚</span>
              <span className="text-sm font-medium">Next Ovulation</span>
            </div>
            <span className="text-sm text-pink-700">
              {new Date(nextCyclePrediction.nextOvulation).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>🩸</span>
              <span className="text-sm font-medium">Next Period</span>
            </div>
            <span className="text-sm text-red-700">
              {new Date(nextCyclePrediction.nextPeriod).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> {
            fertilityStatus.status === 'fertile' ? 'This is your fertile window - best time for conception!' :
            fertilityStatus.status === 'ovulation' ? 'Peak fertility day - highest chance of conception!' :
            fertilityStatus.status === 'menstrual' ? 'Track your flow intensity and symptoms for better predictions.' :
            'Log more cycles to improve prediction accuracy.'
          }
        </p>
      </div>
    </div>
  );
};

export default FertilityInsights;