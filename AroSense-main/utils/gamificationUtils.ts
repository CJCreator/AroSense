import { UserPoints, BadgeDefinition, EarnedBadge, ActivityStreak, ActivityTypeForGamification } from '../types.ts';
import { POINTS_ALLOCATION, INITIAL_BADGES } from '../constants.tsx';
import { sanitizeForLog } from './securityUtils';
import { supabase } from '../src/integrations/supabase/client';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];


// --- Point Management ---
export const getUserPoints = async (userId: string): Promise<UserPoints> => {
  if (!userId) return { user_id: '', totalPoints: 0 };
  
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? { user_id: data.user_id, totalPoints: data.total_points } : { user_id: userId, totalPoints: 0 };
  } catch (error) {
    console.error('Failed to get user points:', sanitizeForLog(error));
    return { user_id: userId, totalPoints: 0 };
  }
};

export const awardPoints = async (userId: string, activityType: ActivityTypeForGamification, reason?: string): Promise<UserPoints> => {
  if (!userId) return getUserPoints('');
  const pointsToAdd = POINTS_ALLOCATION[activityType] || 0;
  
  if (pointsToAdd > 0) {
    try {
      const currentPoints = await getUserPoints(userId);
      const newTotal = currentPoints.totalPoints + pointsToAdd;
      
      const { data, error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          total_points: newTotal
        }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) throw error;
      console.log(`Awarded ${pointsToAdd} points to ${sanitizeForLog(userId)} for ${sanitizeForLog(activityType)}`);
      window.dispatchEvent(new CustomEvent('gamificationUpdate'));
      return { user_id: data.user_id, totalPoints: data.total_points };
    } catch (error) {
      console.error('Failed to award points:', sanitizeForLog(error));
      return getUserPoints(userId);
    }
  }
  return getUserPoints(userId);
};

let isDailyLaunchRunning = false; 

export const awardPointsForDailyLaunch = async (userId: string): Promise<void> => {
    if (!userId || isDailyLaunchRunning) return;
    isDailyLaunchRunning = true;

    try {
        const todayStr = formatDate(new Date());
        const { data } = await supabase
            .from('user_points')
            .select('last_daily_login_award_date')
            .eq('user_id', userId)
            .single();

        if (!data || data.last_daily_login_award_date !== todayStr) {
            await supabase
                .from('user_points')
                .upsert({ 
                    user_id: userId, 
                    last_daily_login_award_date: todayStr 
                }, { onConflict: 'user_id' });

            await awardPoints(userId, ActivityTypeForGamification.DAILY_APP_LAUNCH);
            
            const welcomeBadgeDef = INITIAL_BADGES.find(b => b.id === 'badge_welcome_aboard');
            if (welcomeBadgeDef && !(await hasBadge(userId, welcomeBadgeDef.id))) {
                await awardBadge(userId, welcomeBadgeDef);
            }
        }
    } catch (error) {
        console.error('Daily launch rewards error:', sanitizeForLog(error));
    } finally {
        isDailyLaunchRunning = false;
    }
};

// --- Log Count Management ---
export const getLogCount = async (userId: string, activityType: ActivityTypeForGamification): Promise<number> => {
    if (!userId) return 0;
    
    try {
        const { data, error } = await supabase
            .from('activity_log_counts')
            .select('count')
            .eq('user_id', userId)
            .eq('activity_type', activityType)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data?.count || 0;
    } catch (error) {
        console.error('Failed to get log count:', sanitizeForLog(error));
        return 0;
    }
};

export const incrementLogCount = async (userId: string, activityType: ActivityTypeForGamification): Promise<number> => {
    if (!userId) return 0;
    
    try {
        const currentCount = await getLogCount(userId, activityType);
        const newCount = currentCount + 1;
        
        const { data, error } = await supabase
            .from('activity_log_counts')
            .upsert({
                user_id: userId,
                activity_type: activityType,
                count: newCount
            }, { onConflict: 'user_id,activity_type' })
            .select('count')
            .single();
        
        if (error) throw error;
        console.log(`Incremented log count for ${sanitizeForLog(activityType)}. New count: ${data.count}`);
        return data.count;
    } catch (error) {
        console.error('Failed to increment log count:', sanitizeForLog(error));
        return 0;
    }
};

// --- Badge Management ---
export const getEarnedBadges = async (userId: string): Promise<EarnedBadge[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('earned_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_date', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(badge => ({
      user_id: badge.user_id,
      badgeId: badge.badge_id,
      earnedDate: badge.earned_date
    })) : [];
  } catch (error) {
    console.error('Failed to get earned badges:', sanitizeForLog(error));
    return [];
  }
};

export const hasBadge = async (userId: string, badgeId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('earned_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();
    
    return !error && !!data;
  } catch (error) {
    return false;
  }
};

const awardBadge = async (userId: string, badgeDef: BadgeDefinition): Promise<void> => {
  if (!userId || await hasBadge(userId, badgeDef.id)) return;

  try {
    const { error } = await supabase
      .from('earned_badges')
      .insert({
        user_id: userId,
        badge_id: badgeDef.id,
        earned_date: formatDate(new Date())
      });
    
    if (error) throw error;
    
    console.log(`Awarded badge "${sanitizeForLog(badgeDef.name)}" to ${sanitizeForLog(userId)}`);
    window.dispatchEvent(new CustomEvent('gamificationUpdate'));
  } catch (error) {
    console.error('Failed to award badge:', sanitizeForLog(error));
  }
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
  
  try {
    const { data, error } = await supabase
      .from('activity_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? {
      user_id: data.user_id,
      activityType,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastLogDate: data.last_log_date
    } : { user_id: userId, activityType, currentStreak: 0, longestStreak: 0, lastLogDate: '' };
  } catch (error) {
    console.error('Failed to get activity streak:', sanitizeForLog(error));
    return { user_id: userId, activityType, currentStreak: 0, longestStreak: 0, lastLogDate: '' };
  }
};

export const updateStreak = async (userId: string, activityType: ActivityTypeForGamification): Promise<ActivityStreak> => {
  if (!userId) return getActivityStreak('', activityType);
  
  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(new Date(Date.now() - 86400000));
  
  try {
    const streakData = await getActivityStreak(userId, activityType);
    
    if (streakData.lastLogDate === todayStr) {
      return streakData; // Already updated today
    }
    
    const newCurrentStreak = streakData.lastLogDate === yesterdayStr ? streakData.currentStreak + 1 : 1;
    const newLongestStreak = Math.max(newCurrentStreak, streakData.longestStreak);
    
    const { data, error } = await supabase
      .from('activity_streaks')
      .upsert({
        user_id: userId,
        activity_type: activityType,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_log_date: todayStr
      }, { onConflict: 'user_id,activity_type' })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`Updated streak for ${sanitizeForLog(activityType)}. Current: ${newCurrentStreak}, Longest: ${newLongestStreak}`);
    window.dispatchEvent(new CustomEvent('gamificationUpdate'));
    
    return {
      user_id: data.user_id,
      activityType,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastLogDate: data.last_log_date
    };
  } catch (error) {
    console.error('Failed to update streak:', sanitizeForLog(error));
    return getActivityStreak(userId, activityType);
  }
};

export const dispatchGamificationUpdate = () => {
    window.dispatchEvent(new CustomEvent('gamificationUpdate'));
};