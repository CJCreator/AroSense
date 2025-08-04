import { UserPoints, BadgeDefinition, EarnedBadge, ActivityStreak, ActivityTypeForGamification } from '../types.ts';
import { POINTS_ALLOCATION, INITIAL_BADGES } from '../constants.tsx'; 

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const getKey = (userId: string, type: string) => `${userId}_${type}`;

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};


// --- Point Management ---
export const getUserPoints = async (userId: string): Promise<UserPoints> => {
  if (!userId) return { user_id: '', totalPoints: 0 };
  const key = getKey(userId, 'gamification_user_points');
  const defaultPoints = { user_id: userId, totalPoints: 0 };
  const points = getFromStorage<UserPoints>(key, defaultPoints);
  return Promise.resolve(points);
};

export const awardPoints = async (userId: string, activityType: ActivityTypeForGamification, reason?: string): Promise<UserPoints> => {
  if (!userId) return getUserPoints(''); 
  const pointsToAdd = POINTS_ALLOCATION[activityType] || 0;
  
  if (pointsToAdd > 0) {
    const currentPoints = await getUserPoints(userId);
    const updatedPoints = { ...currentPoints, totalPoints: currentPoints.totalPoints + pointsToAdd };
    saveToStorage(getKey(userId, 'gamification_user_points'), updatedPoints);
    
    console.log(`Awarded ${pointsToAdd} points to ${userId} for ${activityType}. Reason: ${reason || 'N/A'}.`);
    window.dispatchEvent(new CustomEvent('gamificationUpdate'));
    return updatedPoints;
  }
  return getUserPoints(userId);
};

let isDailyLaunchRunning = false; 

export const awardPointsForDailyLaunch = async (userId: string): Promise<void> => {
    if (!userId || isDailyLaunchRunning) return;
    isDailyLaunchRunning = true; 

    try {
        const pointsData = await getUserPoints(userId);
        const todayStr = formatDate(new Date());

        if (pointsData.lastDailyLoginAwardDate !== todayStr) {
            const updatedPoints = { ...pointsData, lastDailyLoginAwardDate: todayStr };
            saveToStorage(getKey(userId, 'gamification_user_points'), updatedPoints);

            await awardPoints(userId, ActivityTypeForGamification.DAILY_APP_LAUNCH, 'Daily App Launch');
            
            const welcomeBadgeDef = INITIAL_BADGES.find(b => b.id === 'badge_welcome_aboard');
            if (welcomeBadgeDef && !(await hasBadge(userId, welcomeBadgeDef.id))) {
                 await awardBadge(userId, welcomeBadgeDef);
            }
        }
    } catch (error) {
        console.error("An error occurred during daily launch rewards:", error);
    } finally {
        isDailyLaunchRunning = false; 
    }
};

// --- Log Count Management ---
export const getLogCount = async (userId: string, activityType: ActivityTypeForGamification): Promise<number> => {
    if (!userId) return 0;
    const key = getKey(userId, 'gamification_log_counts');
    const allCounts = getFromStorage<Record<ActivityTypeForGamification, number>>(key, {} as Record<ActivityTypeForGamification, number>);
    return Promise.resolve(allCounts[activityType] || 0);
};

export const incrementLogCount = async (userId: string, activityType: ActivityTypeForGamification): Promise<number> => {
    if (!userId) return 0;
    const key = getKey(userId, 'gamification_log_counts');
    const allCounts = getFromStorage<Record<ActivityTypeForGamification, number>>(key, {} as Record<ActivityTypeForGamification, number>);
    const newCount = (allCounts[activityType] || 0) + 1;
    allCounts[activityType] = newCount;
    saveToStorage(key, allCounts);
    
    console.log(`Incremented log count for ${activityType} for ${userId}. New count: ${newCount}`);
    return Promise.resolve(newCount);
};

// --- Badge Management ---
export const getEarnedBadges = async (userId: string): Promise<EarnedBadge[]> => {
  if (!userId) return [];
  const key = getKey(userId, 'gamification_earned_badges');
  const badges = getFromStorage<EarnedBadge[]>(key, []);
  return Promise.resolve(badges);
};

export const hasBadge = async (userId: string, badgeId: string): Promise<boolean> => {
  if (!userId) return false;
  const earnedBadges = await getEarnedBadges(userId);
  return earnedBadges.some(b => b.badgeId === badgeId);
};

const awardBadge = async (userId: string, badgeDef: BadgeDefinition): Promise<void> => {
  if (!userId || await hasBadge(userId, badgeDef.id)) return;

  const newEarnedBadge: EarnedBadge = { user_id: userId, badgeId: badgeDef.id, earnedDate: formatDate(new Date()) };
  const earnedBadges = await getEarnedBadges(userId);
  earnedBadges.push(newEarnedBadge);
  saveToStorage(getKey(userId, 'gamification_earned_badges'), earnedBadges);
  
  let alertMessage = `Congratulations! You've earned the "${badgeDef.name}" badge! ${badgeDef.icon}`;
  if (badgeDef.rewardMessage) {
      alertMessage += `\n\n${badgeDef.rewardMessage}`;
  }
  alert(alertMessage); 

  console.log(`Awarded badge "${badgeDef.name}" to ${userId}`);
  window.dispatchEvent(new CustomEvent('gamificationUpdate'));
};

export const checkAndAwardBadges = async (userId: string, newlyPerformedActivityType?: ActivityTypeForGamification): Promise<void> => {
  if (!userId) return;
  const userPoints = await getUserPoints(userId); 

  for (const badgeDef of INITIAL_BADGES) {
    if (await hasBadge(userId, badgeDef.id) || badgeDef.criteriaType === 'SPECIAL_WELCOME') {
        continue;
    }

    let criteriaMet = false;
    switch (badgeDef.criteriaType) {
        case 'FIRST_TIME_ACTION':
            if (newlyPerformedActivityType && badgeDef.criteriaValue === newlyPerformedActivityType) {
                if ((await getLogCount(userId, badgeDef.criteriaValue as ActivityTypeForGamification)) === 1) {
                     criteriaMet = true;
                }
            }
            break;
        case 'LOG_COUNT':
            if (badgeDef.criteriaTargetActivity) {
                const currentCount = await getLogCount(userId, badgeDef.criteriaTargetActivity);
                if (currentCount >= (badgeDef.criteriaValue as number)) {
                    criteriaMet = true;
                }
            }
            break;
        case 'POINTS_THRESHOLD':
            if (badgeDef.criteriaValue && userPoints.totalPoints >= (badgeDef.criteriaValue as number)) {
                criteriaMet = true;
            } else if (badgeDef.pointsRequired && userPoints.totalPoints >= badgeDef.pointsRequired) {
                 criteriaMet = true;
            }
            break;
    }

    if (criteriaMet) {
      await awardBadge(userId, badgeDef);
    }
  }
};

// --- Streak Management ---
export const getActivityStreak = async (userId: string, activityType: ActivityTypeForGamification): Promise<ActivityStreak> => {
  if (!userId) return { user_id: '', activityType, currentStreak: 0, longestStreak: 0, lastLogDate: '' };
  const key = getKey(userId, `gamification_streak_${activityType}`);
  const defaultStreak = { user_id: userId, activityType, currentStreak: 0, longestStreak: 0, lastLogDate: '' };
  const streak = getFromStorage<ActivityStreak>(key, defaultStreak);
  return Promise.resolve(streak);
};

export const updateStreak = async (userId: string, activityType: ActivityTypeForGamification): Promise<ActivityStreak> => {
  if (!userId) return getActivityStreak('', activityType);
  const streakData = await getActivityStreak(userId, activityType);
  const todayStr = formatDate(new Date());

  if (streakData.lastLogDate === todayStr) {
    return streakData; // Already updated today
  }

  const yesterdayStr = formatDate(new Date(Date.now() - 86400000)); 

  if (streakData.lastLogDate === yesterdayStr) {
    streakData.currentStreak += 1; // Continue streak
  } else {
    streakData.currentStreak = 1; // Reset streak
  }

  streakData.lastLogDate = todayStr;
  if (streakData.currentStreak > streakData.longestStreak) {
    streakData.longestStreak = streakData.currentStreak;
  }
  
  saveToStorage(getKey(userId, `gamification_streak_${activityType}`), streakData);
  
  console.log(`Updated streak for ${activityType} for ${userId}. Current: ${streakData.currentStreak}, Longest: ${streakData.longestStreak}`);
  window.dispatchEvent(new CustomEvent('gamificationUpdate'));
  
  return streakData;
};

export const dispatchGamificationUpdate = () => {
    window.dispatchEvent(new CustomEvent('gamificationUpdate'));
};