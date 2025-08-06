import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavItem, FamilyMember, UserPoints, EarnedBadge, ActivityStreak, BadgeDefinition, ActivityTypeForGamification } from '../types.ts';
import { NAVIGATION_ITEMS, DEFAULT_FAMILY_MEMBER_IMAGE, INITIAL_BADGES } from '../constants.tsx'; 
import PlusIcon from './icons/PlusIcon.tsx';
import StarIcon from './icons/StarIcon.tsx';
import HeartbeatIcon from './icons/HeartbeatIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import { getUserPoints, getEarnedBadges, getActivityStreak } from '../utils/gamificationUtils.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import * as familyMemberService from '../services/familyMemberService.ts';
import { sanitizeForLog } from '../utils/securityUtils';
import { Card, CardHeader, CardContent } from './ui/Card';
import Button from './ui/Button';
import DashboardWidget from './ui/DashboardWidget';
import { EmptyStateCard } from './ui/EmptyState';





const Dashboard: React.FC = () => {
  const [quickAccessItems, setQuickAccessItems] = useState<NavItem[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const { currentUser } = useAuth(); // Get current user

  // Gamification state
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [waterStreak, setWaterStreak] = useState<ActivityStreak | null>(null);

  useEffect(() => {
    const defaultQuickAccess = NAVIGATION_ITEMS.filter(item => item.isFeature && (item.path !== '/dashboard') && !item.isNew && item.name !== 'Wellness Rewards').slice(0, 4);
    const newFeaturesQuickAccess = NAVIGATION_ITEMS.filter(item => item.isNew && item.name !== 'Wellness Rewards').slice(0,2);
    setQuickAccessItems([...defaultQuickAccess, ...newFeaturesQuickAccess].slice(0,6));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Load family members
    setIsLoadingMembers(true);
    familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User')
      .then(data => {
        setFamilyMembers(data);
      })
      .catch(err => {
        console.error("Failed to load family members for dashboard", sanitizeForLog(err));
      })
      .finally(() => {
        setIsLoadingMembers(false);
      });

    // Load gamification data
    const loadGamificationData = async () => {
        try {
            setUserPoints(await getUserPoints(currentUser.id));
            setEarnedBadges(await getEarnedBadges(currentUser.id));
            setWaterStreak(await getActivityStreak(currentUser.id, ActivityTypeForGamification.LOG_WATER_WELLNESS));
        } catch (error) {
            console.error('Failed to load gamification data:', sanitizeForLog(error));
        }
    }
    
    loadGamificationData();
    
    const handleGamificationUpdate = () => {
        if(currentUser) loadGamificationData();
    };
    window.addEventListener('gamificationUpdate', handleGamificationUpdate);
    return () => window.removeEventListener('gamificationUpdate', handleGamificationUpdate);

  }, [currentUser]);

  const getBadgeDefinition = (badgeId: string): BadgeDefinition | undefined => {
    return INITIAL_BADGES.find(b => b.id === badgeId);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-energetic-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome back{currentUser ? `, ${currentUser.user_metadata.name || 'User'}` : ''}!
              </h1>
              <p className="text-gray-600">Here's your health overview for today</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<PlusIcon className="w-5 h-5" />}
              className="shadow-lg hover:shadow-xl"
            >
              Quick Add
            </Button>
          </div>
        </div>

        {/* Health Overview Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardWidget
            title="Health Score"
            subtitle="Overall wellness"
            value="85%"
            change={{ value: "+5% this week", trend: 'up' }}
            icon={<HeartbeatIcon className="w-6 h-6" />}
            variant="gradient"
            gradient="from-green-500 to-emerald-600"
          />
          
          <DashboardWidget
            title="Family Members"
            subtitle="Active profiles"
            value={familyMembers.length}
            icon={<UsersIcon className="w-6 h-6" />}
            action={{
              label: "Manage",
              onClick: () => window.location.href = '/family-profiles'
            }}
          />
          
          <DashboardWidget
            title="Wellness Points"
            subtitle="Total earned"
            value={userPoints?.totalPoints || 0}
            change={{ value: "New badges available", trend: 'up' }}
            icon={<StarIcon className="w-6 h-6" />}
            variant="gradient"
            gradient="from-yellow-500 to-orange-600"
          />
          
          <DashboardWidget
            title="Water Streak"
            subtitle="Daily hydration"
            value={`${waterStreak?.currentStreak || 0} days`}
            icon={<span className="text-2xl">💧</span>}
            variant="gradient"
            gradient="from-blue-500 to-cyan-600"
          />
        </div>

        {/* Quick Access Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Quick Access</h2>
            <Button variant="ghost" size="sm">
              Customize
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickAccessItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
                  {item.isNew && (
                    <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Family Members */}
          <div className="lg:col-span-2">
            <Card variant="elevated" className="h-full">
              <CardHeader
                title="Family Members"
                subtitle={`${familyMembers.length} active profiles`}
                icon={<UsersIcon className="w-6 h-6 text-primary-600" />}
                action={
                  <Button variant="ghost" size="sm">
                    <Link to="/family-profiles">Manage All</Link>
                  </Button>
                }
              />
              
              <CardContent>
                {isLoadingMembers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading members...</p>
                  </div>
                ) : familyMembers.length === 0 ? (
                  <EmptyStateCard
                    icon="👥"
                    title="No family members yet"
                    description="Add family members to start tracking their health"
                    action={{
                      label: "Add Member",
                      onClick: () => window.location.href = '/family-profiles'
                    }}
                    gradient="from-blue-50 to-purple-50"
                  />
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {familyMembers.map(member => (
                      <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.relationship || 'Family Member'}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Link to={`/family-profiles#${member.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Emergency Checklist */}
          <div>
            <Card variant="elevated" className="h-full">
              <CardHeader
                title="Emergency Ready?"
                subtitle="Keep your info updated"
                icon={<span className="text-2xl">🚨</span>}
              />
              
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Emergency Contacts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Medical Conditions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Blood Type Info</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Link to="/emergency">Review Emergency Info</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;