import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardWidgets from '../components/DashboardWidgets';
import * as womensHealthService from '../services/womensHealthServicePhase2';
import * as pregnancyService from '../services/pregnancyServicePhase2';
import * as babyCareService from '../services/babyCareServicePhase2';
import * as familyMemberService from '../services/familyMemberService';
import type { MenstrualCycle, PregnancyProfile, VaccinationSchedule } from '../types/phase2Types';
import type { FamilyMember } from '../types';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Health data state
  const [cycles, setCycles] = useState<MenstrualCycle[]>([]);
  const [pregnancyProfile, setPregnancyProfile] = useState<PregnancyProfile | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationSchedule[]>([]);
  const [children, setChildren] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadDashboardData = async () => {
      try {
        // Load all health data in parallel
        const [cyclesData, pregnancyData, familyData] = await Promise.all([
          womensHealthService.getMenstrualCycles().catch(() => []),
          pregnancyService.getActivePregnancyProfile().catch(() => null),
          familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User').catch(() => [])
        ]);
        
        setCycles(cyclesData);
        setPregnancyProfile(pregnancyData);
        
        // Filter children (5 years and under)
        const childMembers = familyData.filter(member => {
          const age = calculateAge(member.dateOfBirth);
          return age <= 5;
        });
        setChildren(childMembers);
        
        // Load vaccination data for all children
        if (childMembers.length > 0) {
          const allVaccinations = await Promise.all(
            childMembers.map(child => 
              babyCareService.getVaccinationSchedules(child.id).catch(() => [])
            )
          );
          setVaccinations(allVaccinations.flat());
        }
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access your health dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your health dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {currentUser.user_metadata.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's your health overview for {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{cycles.length}</p>
            <p className="text-sm opacity-90">Cycles Tracked</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{pregnancyProfile ? '1' : '0'}</p>
            <p className="text-sm opacity-90">Active Pregnancy</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{children.length}</p>
            <p className="text-sm opacity-90">Children</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{vaccinations.filter(v => v.is_completed).length}</p>
            <p className="text-sm opacity-90">Vaccines Complete</p>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Health Modules</h2>
        <DashboardWidgets
          cycles={cycles}
          pregnancyProfile={pregnancyProfile}
          vaccinations={vaccinations}
          childrenCount={children.length}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {cycles.length > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
              <span className="text-pink-500">🩸</span>
              <div>
                <p className="text-sm font-medium">Last period logged</p>
                <p className="text-xs text-gray-600">
                  {new Date(cycles[0].start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          
          {pregnancyProfile && (
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-500">🤰</span>
              <div>
                <p className="text-sm font-medium">Pregnancy profile active</p>
                <p className="text-xs text-gray-600">
                  Due {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          
          {vaccinations.length > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-500">💉</span>
              <div>
                <p className="text-sm font-medium">Vaccination tracking active</p>
                <p className="text-xs text-gray-600">
                  {vaccinations.filter(v => v.is_completed).length} vaccines completed
                </p>
              </div>
            </div>
          )}
          
          {cycles.length === 0 && !pregnancyProfile && vaccinations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No recent activity</p>
              <p className="text-sm text-gray-400">
                Start tracking your health to see activity here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;