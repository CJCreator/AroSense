import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavItem, FamilyMember, UserPoints, EarnedBadge, ActivityStreak, BadgeDefinition, ActivityTypeForGamification } from '../types.ts';
import { NAVIGATION_ITEMS, DEFAULT_FAMILY_MEMBER_IMAGE, INITIAL_BADGES } from '../constants.tsx'; 
import PlusIcon from './icons/PlusIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import { getUserPoints, getEarnedBadges, getActivityStreak } from '../utils/gamificationUtils.ts';
import StarIcon from './icons/StarIcon.tsx'; 
import { useAuth } from '../contexts/AuthContext.tsx'; // Import useAuth
import * as familyMemberService from '../services/familyMemberService.ts';


const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; titleAction?: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, className, titleAction, icon }) => (
    <div className={`bg-surface p-4 sm:p-6 rounded-xl shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
        </div>
        {titleAction}
      </div>
      {children}
    </div>
  );


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
        console.error("Failed to load family members for dashboard", err);
      })
      .finally(() => {
        setIsLoadingMembers(false);
      });

    // Load gamification data
    const loadGamificationData = async () => {
        setUserPoints(await getUserPoints(currentUser.id));
        setEarnedBadges(await getEarnedBadges(currentUser.id));
        setWaterStreak(await getActivityStreak(currentUser.id, ActivityTypeForGamification.LOG_WATER_WELLNESS)); 
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">
            Welcome back{currentUser ? `, ${currentUser.user_metadata.name || 'User'}` : ''}!
        </h2>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition self-start sm:self-auto">
          <PlusIcon className="w-5 h-5" />
          <span>Quick Add</span>
        </button>
      </div>

      {/* Gamification Section */}
      <Card title="Wellness Rewards" icon={<StarIcon className="w-6 h-6 text-secondary" />} className="bg-gradient-to-r from-primary-light via-cyan-50 to-secondary-light">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-sm text-textSecondary font-medium">Total Points</p>
                <p className="text-3xl font-bold text-primary">{userPoints?.totalPoints || 0}</p>
            </div>
            <div>
                <p className="text-sm text-textSecondary font-medium">Badges Earned</p>
                {earnedBadges.length > 0 ? (
                    <div className="flex justify-center items-center space-x-2 mt-2">
                        {earnedBadges.slice(0, 4).map(eb => {
                            const badgeDef = getBadgeDefinition(eb.badgeId);
                            return badgeDef ? (
                                <span key={eb.badgeId} title={badgeDef.name} className="text-2xl cursor-default">{badgeDef.icon}</span>
                            ) : null;
                        })}
                        {earnedBadges.length > 4 && <span className="text-xs text-textSecondary">+{earnedBadges.length - 4} more</span>}
                    </div>
                ) : (
                    <p className="text-sm text-textSecondary mt-2">-</p>
                )}
            </div>
            <div>
                <p className="text-sm text-textSecondary font-medium">Daily Water Streak</p>
                <p className="text-2xl font-bold text-primary">💧 {waterStreak?.currentStreak || 0} <span className="text-lg font-medium">days</span></p>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/wellness-rewards" className="text-sm text-primary hover:underline font-medium">
                View All Rewards & Progress &raquo;
            </Link>
          </div>
      </Card>


      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-textPrimary">Quick Access</h3>
          <button className="text-sm text-primary hover:underline flex items-center">
            <EditIcon className="w-4 h-4 mr-1" />
            Customize
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {quickAccessItems.map(item => (
            <Link key={item.name} to={item.path} className="block p-4 sm:p-6 bg-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <item.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
                <h4 className="font-semibold text-textPrimary text-sm sm:text-base">{item.name}</h4>
                {item.isNew && <span className="mt-1 text-xs bg-accent text-white px-2 py-0.5 rounded-full">New</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Family Members" className="lg:col-span-1">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLoadingMembers ? (
              <p className="text-textSecondary text-center">Loading members...</p>
            ) : (
              familyMembers.map(member => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <img src={member.profileImageUrl || DEFAULT_FAMILY_MEMBER_IMAGE} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-textPrimary">{member.name}</p>
                    <p className="text-xs text-textSecondary">{member.relationshipToUser}</p>
                  </div>
                  <Link to={`/family-profiles#${member.id}`} className="ml-auto text-primary hover:underline text-sm px-2 py-1 rounded hover:bg-primary-light">View</Link>
                </div>
              ))
            )}
             <Link to="/family-profiles" className="block text-center mt-4 text-primary hover:underline font-medium">
              Manage All Profiles
            </Link>
          </div>
        </Card>

        <Card title="Emergency Checklist" className="lg:col-span-1">
            <div className="text-sm text-textSecondary">
                <p>Is your emergency information up-to-date?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Emergency Contacts</li>
                    <li>Allergies &amp; Medical Conditions</li>
                    <li>Blood Type</li>
                </ul>
                 <Link to="/emergency" className="block text-center mt-4 text-primary hover:underline font-medium">
                    Review Emergency Info &raquo;
                </Link>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;