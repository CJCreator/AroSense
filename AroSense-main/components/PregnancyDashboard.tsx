import React, { useEffect, useState } from 'react';
import type { PregnancyProfile } from '../types/phase2Types';
import { calculatePregnancyDetails, getWeeklyDevelopment, getPregnancyMilestones } from '../utils/pregnancyCalculator';

interface PregnancyDashboardProps {
  profile: PregnancyProfile;
  onWeekUpdate?: (week: number) => void;
}

const PregnancyDashboard: React.FC<PregnancyDashboardProps> = ({ profile, onWeekUpdate }) => {
  const [calculations, setCalculations] = useState(() => calculatePregnancyDetails(profile));
  const [weeklyInfo, setWeeklyInfo] = useState(() => getWeeklyDevelopment(calculations.currentWeek));

  useEffect(() => {
    const newCalculations = calculatePregnancyDetails(profile);
    setCalculations(newCalculations);
    setWeeklyInfo(getWeeklyDevelopment(newCalculations.currentWeek));
    
    // Auto-update week if different from stored value
    if (profile.current_week !== newCalculations.currentWeek) {
      onWeekUpdate?.(newCalculations.currentWeek);
    }
  }, [profile, onWeekUpdate]);

  const progressPercentage = (calculations.currentWeek / 40) * 100;
  const milestones = getPregnancyMilestones(calculations.currentWeek);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            {calculations.gestationalAge}
          </h2>
          <p className="text-purple-100 mb-4">
            {calculations.daysRemaining} days to go
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-purple-300 rounded-full h-3 mb-2">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-purple-100">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>
      </div>

      {/* Weekly Development */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">This Week's Development</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👶</span>
              <div>
                <p className="font-medium">Baby Size</p>
                <p className="text-sm text-gray-600">{weeklyInfo.babySize}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-medium">Development</p>
                <p className="text-sm text-gray-600">{weeklyInfo.development}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-2xl">🤰</span>
              <div>
                <p className="font-medium">Your Changes</p>
                <p className="text-sm text-gray-600">{weeklyInfo.maternalChanges}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium">This Week's Tip</p>
                <p className="text-sm text-gray-600">{weeklyInfo.tips}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{calculations.currentWeek}</p>
          <p className="text-xs text-gray-600">Weeks</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-pink-600">{calculations.trimester}</p>
          <p className="text-xs text-gray-600">Trimester</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{calculations.daysPregnant}</p>
          <p className="text-xs text-gray-600">Days Pregnant</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{calculations.daysRemaining}</p>
          <p className="text-xs text-gray-600">Days Left</p>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Pregnancy Milestones</h3>
        
        <div className="space-y-2">
          {milestones.slice(0, 5).map((milestone) => (
            <div key={milestone.week} className={`
              flex items-center justify-between p-3 rounded-lg
              ${milestone.passed ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}
            `}>
              <div className="flex items-center space-x-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${milestone.passed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}
                `}>
                  {milestone.passed ? '✓' : milestone.week}
                </div>
                <span className="text-sm font-medium">{milestone.title}</span>
              </div>
              <span className="text-xs">Week {milestone.week}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Conception Date</span>
            <span className="text-sm text-gray-600">
              {new Date(calculations.conceptionDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Due Date</span>
            <span className="text-sm text-purple-600 font-medium">
              {new Date(calculations.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Last Menstrual Period</span>
            <span className="text-sm text-gray-600">
              {new Date(profile.last_menstrual_period).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PregnancyDashboard;