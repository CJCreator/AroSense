import React from 'react';
import type { PregnancyProfile } from '../types/phase2Types';

interface PregnancyTimelineProps {
  profile: PregnancyProfile;
}

const PregnancyTimeline: React.FC<PregnancyTimelineProps> = ({ profile }) => {
  const calculateCurrentWeek = () => {
    const lmpDate = new Date(profile.last_menstrual_period);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.min(diffWeeks, 42);
  };

  const currentWeek = profile.current_week || calculateCurrentWeek();
  const totalWeeks = 40;
  const progressPercentage = (currentWeek / totalWeeks) * 100;

  const getTrimester = (week: number) => {
    if (week <= 12) return 1;
    if (week <= 27) return 2;
    return 3;
  };

  const getWeekInfo = (week: number) => {
    const weekInfo: { [key: number]: string } = {
      4: "Baby is the size of a poppy seed",
      8: "Baby is the size of a raspberry", 
      12: "Baby is the size of a lime",
      16: "Baby is the size of an avocado",
      20: "Baby is the size of a banana",
      24: "Baby is the size of an ear of corn",
      28: "Baby is the size of an eggplant",
      32: "Baby is the size of a coconut",
      36: "Baby is the size of a papaya",
      40: "Baby is full term!"
    };
    
    const nearestWeek = Object.keys(weekInfo)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
      );
    
    return weekInfo[nearestWeek] || "Your baby is growing!";
  };

  const milestones = [
    { week: 4, title: "Heart begins beating", color: "bg-red-400" },
    { week: 8, title: "Major organs form", color: "bg-orange-400" },
    { week: 12, title: "End of first trimester", color: "bg-yellow-400" },
    { week: 16, title: "Gender can be determined", color: "bg-green-400" },
    { week: 20, title: "Anatomy scan", color: "bg-blue-400" },
    { week: 24, title: "Viability milestone", color: "bg-indigo-400" },
    { week: 28, title: "Third trimester begins", color: "bg-purple-400" },
    { week: 32, title: "Rapid brain development", color: "bg-pink-400" },
    { week: 36, title: "Baby is considered full-term", color: "bg-green-500" },
    { week: 40, title: "Due date!", color: "bg-red-500" }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-purple-800 mb-2">
          Week {currentWeek} of {totalWeeks}
        </h3>
        <p className="text-purple-600 mb-4">{getWeekInfo(currentWeek)}</p>
        <div className="text-sm text-gray-600">
          Trimester {getTrimester(currentWeek)} • Due: {new Date(profile.estimated_due_date).toLocaleDateString()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const isPassed = currentWeek >= milestone.week;
            const isCurrent = currentWeek === milestone.week;
            
            return (
              <div key={milestone.week} className="relative flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold z-10
                  ${isPassed ? milestone.color : 'bg-gray-300'}
                  ${isCurrent ? 'ring-4 ring-purple-200 scale-110' : ''}
                  transition-all duration-300
                `}>
                  {milestone.week}
                </div>
                
                <div className={`
                  ml-4 p-3 rounded-lg flex-1
                  ${isPassed ? 'bg-white shadow-sm' : 'bg-gray-50'}
                  ${isCurrent ? 'ring-2 ring-purple-300' : ''}
                  transition-all duration-300
                `}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-medium ${isPassed ? 'text-gray-800' : 'text-gray-500'}`}>
                        Week {milestone.week}
                      </p>
                      <p className={`text-sm ${isPassed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {milestone.title}
                      </p>
                    </div>
                    {isPassed && (
                      <div className="text-green-500">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-3">
          <p className="text-2xl font-bold text-purple-600">{currentWeek}</p>
          <p className="text-xs text-gray-600">Weeks</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-2xl font-bold text-pink-600">{Math.max(0, 40 - currentWeek)}</p>
          <p className="text-xs text-gray-600">Weeks Left</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-2xl font-bold text-indigo-600">{getTrimester(currentWeek)}</p>
          <p className="text-xs text-gray-600">Trimester</p>
        </div>
      </div>
    </div>
  );
};

export default PregnancyTimeline;