import React from 'react';
import { FemaleIcon } from './icons/FemaleIcon';
import { PregnantWomanIcon } from './icons/PregnantWomanIcon';
import { BabyIcon } from './icons/BabyIcon';
import type { MenstrualCycle, PregnancyProfile, VaccinationSchedule } from '../types/phase2Types';
import { getFertilityStatus } from '../utils/fertilityCalculator';
import { calculatePregnancyDetails } from '../utils/pregnancyCalculator';
import { getOverdueVaccines, calculateVaccineReminders } from '../utils/vaccineReminders';

interface DashboardWidgetsProps {
  cycles?: MenstrualCycle[];
  pregnancyProfile?: PregnancyProfile | null;
  vaccinations?: VaccinationSchedule[];
  childrenCount?: number;
  onNavigate: (path: string) => void;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  cycles = [],
  pregnancyProfile,
  vaccinations = [],
  childrenCount = 0,
  onNavigate
}) => {
  // Women's Health Widget Data
  const fertilityStatus = cycles.length > 0 ? getFertilityStatus(cycles, []) : null;
  const lastPeriod = cycles.length > 0 ? cycles.sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )[0] : null;

  // Pregnancy Widget Data
  const pregnancyData = pregnancyProfile ? calculatePregnancyDetails(pregnancyProfile) : null;

  // Baby Care Widget Data
  const overdueVaccines = vaccinations.length > 0 ? 
    getOverdueVaccines(calculateVaccineReminders(vaccinations, 'Child')) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Women's Health Widget */}
      <div 
        onClick={() => onNavigate('/womens-care')}
        className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <FemaleIcon className="w-8 h-8 text-pink-500" />
          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
            {cycles.length} cycles logged
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Women's Health</h3>
        
        {fertilityStatus ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                fertilityStatus.status === 'fertile' ? 'bg-green-400' :
                fertilityStatus.status === 'ovulation' ? 'bg-pink-400' :
                fertilityStatus.status === 'menstrual' ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium capitalize">{fertilityStatus.status} Phase</span>
            </div>
            <p className="text-xs text-gray-600">{fertilityStatus.message}</p>
            {lastPeriod && (
              <p className="text-xs text-gray-500">
                Last period: {new Date(lastPeriod.start_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Start tracking your cycle to see insights</p>
        )}
      </div>

      {/* Pregnancy Widget */}
      <div 
        onClick={() => onNavigate('/pregnancy')}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <PregnantWomanIcon className="w-8 h-8 text-purple-500" />
          {pregnancyProfile && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pregnancy</h3>
        
        {pregnancyData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">
                {pregnancyData.gestationalAge}
              </span>
              <span className="text-xs text-gray-500">
                T{pregnancyData.trimester}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {pregnancyData.daysRemaining} days until due date
            </p>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((pregnancyData.currentWeek / 40) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Create a pregnancy profile to track your journey</p>
        )}
      </div>

      {/* Baby Care Widget */}
      <div 
        onClick={() => onNavigate('/baby-care')}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <BabyIcon className="w-8 h-8 text-blue-500" />
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {childrenCount} {childrenCount === 1 ? 'child' : 'children'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Baby Care</h3>
        
        {childrenCount > 0 ? (
          <div className="space-y-2">
            {overdueVaccines.length > 0 ? (
              <div className="flex items-center space-x-2">
                <span className="text-red-500">🚨</span>
                <span className="text-sm font-medium text-red-700">
                  {overdueVaccines.length} overdue vaccines
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm font-medium text-green-700">
                  Vaccines up to date
                </span>
              </div>
            )}
            
            <p className="text-xs text-gray-600">
              {vaccinations.filter(v => v.is_completed).length} of {vaccinations.length} vaccines completed
            </p>
            
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ 
                  width: `${vaccinations.length > 0 ? 
                    (vaccinations.filter(v => v.is_completed).length / vaccinations.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Add children to track vaccinations and milestones</p>
        )}
      </div>

      {/* Emergency Info Widget */}
      <div 
        onClick={() => onNavigate('/emergency-info')}
        className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">🚨</span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            Quick Access
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Emergency Info</h3>
        <p className="text-sm text-gray-600">
          Access critical medical information and emergency contacts instantly
        </p>
        
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">QR Code</span>
          <span className="text-xs text-gray-500">Ready for first responders</span>
        </div>
      </div>

      {/* Family Profiles Widget */}
      <div 
        onClick={() => onNavigate('/family-profiles')}
        className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {childrenCount + 1} members
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Family Profiles</h3>
        <p className="text-sm text-gray-600">
          Manage health profiles for all family members
        </p>
        
        <div className="mt-3">
          <p className="text-xs text-gray-500">
            Track medical history, allergies, and emergency contacts
          </p>
        </div>
      </div>

      {/* Wellness Tracking Widget */}
      <div 
        onClick={() => onNavigate('/wellness')}
        className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">💪</span>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            Track Daily
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Wellness</h3>
        <p className="text-sm text-gray-600">
          Monitor vitals, activity, sleep, and overall wellness
        </p>
        
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Vitals</p>
            <p className="text-sm font-medium">📊</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Activity</p>
            <p className="text-sm font-medium">🏃</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Sleep</p>
            <p className="text-sm font-medium">😴</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;