import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import StarIcon from '../components/icons/StarIcon.tsx';
import { INITIAL_BADGES } from '../constants.tsx'; 
import { UserPoints, EarnedBadge, ActivityStreak, BadgeDefinition, ActivityTypeForGamification } from '../types.ts';
import { getUserPoints, getEarnedBadges, getActivityStreak } from '../utils/gamificationUtils.ts';
import { useAuth } from '../contexts/AuthContext.tsx'; 

const WellnessRewardsPage: React.FC = () => {
  const { currentUser } = useAuth(); 
  const userId = currentUser?.id || '';
  const navigate = useNavigate(); // Initialize useNavigate

  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [waterStreak, setWaterStreak] = useState<ActivityStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setIsLoading(false);
        return;
    }; 

    const loadGamificationData = async () => {
        setIsLoading(true);
        try {
            const pointsData = await getUserPoints(userId);
            setUserPoints(pointsData);

            const badgesData = await getEarnedBadges(userId);
            setEarnedBadges(badgesData);

            const streakData = await getActivityStreak(userId, ActivityTypeForGamification.LOG_WATER_WELLNESS);
            setWaterStreak(streakData);
        } catch (error) {
            console.error("Failed to load gamification data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    loadGamificationData();
    window.addEventListener('gamificationUpdate', loadGamificationData);
    return () => window.removeEventListener('gamificationUpdate', loadGamificationData);
  }, [userId]);

  const handleBadgeClick = (badgeDef: BadgeDefinition) => {
    const isEarned = earnedBadges.some(eb => eb.badgeId === badgeDef.id);

    if (isEarned && badgeDef.rewardMessage) {
        alert(`${badgeDef.name} Reward:\n\n${badgeDef.rewardMessage}`);
    } else if (isEarned) {
        alert(`You've earned the "${badgeDef.name}" badge! Keep up the great work!`);
    } else {
        // Handle navigation for unearned LOG_COUNT badges
        if (badgeDef.criteriaType === 'LOG_COUNT' && badgeDef.criteriaTargetActivity) {
            switch (badgeDef.criteriaTargetActivity) {
                case ActivityTypeForGamification.LOG_VITALS_WELLNESS:
                    sessionStorage.setItem('wellnessTargetTab', 'vitals');
                    navigate('/wellness');
                    return;
                case ActivityTypeForGamification.LOG_WATER_WELLNESS:
                    sessionStorage.setItem('wellnessTargetTab', 'hydration');
                    navigate('/wellness');
                    return;
                case ActivityTypeForGamification.LOG_BABY_MILESTONE:
                    sessionStorage.setItem('babyCareTargetTab', 'milestones');
                    navigate('/baby-care');
                    return;
                default:
                    alert(`Keep engaging to unlock the "${badgeDef.name}" badge!\nDescription: ${badgeDef.description}`);
            }
        } else {
            alert(`Keep engaging to unlock the "${badgeDef.name}" badge!\nDescription: ${badgeDef.description}`);
        }
    }
  };
  
  if (isLoading) {
    return (
        <div className="text-center p-8">
            <p className="text-textSecondary">Loading your rewards...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <StarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-reward-gold" />
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Your Wellness Rewards</h2>
        </div>
      </div>

      {/* Stats Overview */}
      <section className="bg-surface p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-textPrimary mb-4">Stats Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-light p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-primary-dark">Total Points</p>
                <p className="text-4xl font-bold text-primary mt-1">{userPoints?.totalPoints || 0}</p>
            </div>
            <div className="bg-secondary-light p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-secondary-dark">Badges Unlocked</p>
                <p className="text-4xl font-bold text-secondary mt-1">{earnedBadges.length}</p>
            </div>
             <div className="bg-teal-100 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-teal-700">Daily Water Streak</p>
                <p className="text-4xl font-bold text-teal-600 mt-1">💧 {waterStreak?.currentStreak || 0}</p>
                 {waterStreak && waterStreak.longestStreak > 0 && <p className="text-xs text-teal-500">Longest: {waterStreak.longestStreak} days</p>}
            </div>
        </div>
      </section>

      {/* Badge Gallery */}
      <section className="bg-surface p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-textPrimary mb-6">Badge Gallery</h3>
        {INITIAL_BADGES.length === 0 ? (
          <p className="text-textSecondary">No badges defined yet. Stay tuned!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {INITIAL_BADGES.map(badgeDef => {
              const earnedBadgeInfo = earnedBadges.find(eb => eb.badgeId === badgeDef.id);
              const isEarned = !!earnedBadgeInfo;
              const earnedDate = isEarned ? earnedBadgeInfo.earnedDate : null;
              
              const baseClasses = "p-4 border rounded-lg text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-start aspect-square";
              const earnedClasses = "bg-green-50 border-green-400 shadow-lg hover:shadow-xl";
              const notEarnedClasses = "bg-slate-100 border-slate-300 opacity-70 hover:opacity-100 hover:shadow-md";

              return (
                <div 
                    key={badgeDef.id} 
                    className={`${baseClasses} ${isEarned ? earnedClasses : notEarnedClasses}`}
                    onClick={() => handleBadgeClick(badgeDef)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleBadgeClick(badgeDef)}
                    aria-label={`Badge: ${badgeDef.name}. ${badgeDef.description}. Status: ${isEarned ? 'Earned' : 'Not earned'}.`}
                >
                  <div className={`text-5xl mb-2 ${isEarned ? '' : 'grayscale'}`}>{badgeDef.icon}</div>
                  <h4 className={`text-sm font-semibold mb-1 ${isEarned ? 'text-green-800' : 'text-textSecondary'}`}>{badgeDef.name}</h4>
                  <p className={`text-xs ${isEarned ? 'text-green-700' : 'text-slate-500'} flex-grow`}>{badgeDef.description}</p>
                  {isEarned && earnedDate && <p className="text-xs text-slate-400 mt-auto pt-1">Earned: {new Date(earnedDate).toLocaleDateString()}</p>}
                  {!isEarned && badgeDef.criteriaType === 'POINTS_THRESHOLD' && badgeDef.criteriaValue && <p className="text-xs text-blue-500 mt-auto pt-1">Requires {badgeDef.criteriaValue} points</p>}
                  {!isEarned && badgeDef.criteriaType === 'LOG_COUNT' && badgeDef.criteriaValue && <p className="text-xs text-blue-500 mt-auto pt-1">Log {badgeDef.criteriaValue} times</p>}

                </div>
              );
            })}
          </div>
        )}
      </section>
      
      <div className="text-center text-textSecondary text-sm mt-8">
        <p>More features like leaderboards, challenges, and user levels are coming soon to make your wellness journey even more exciting!</p>
        <p>Keep logging your activities to earn more points and unlock new achievements!</p>
      </div>
    </div>
  );
};

export default WellnessRewardsPage;