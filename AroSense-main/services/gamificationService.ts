import { supabase } from '../src/integrations/supabase/client';
import { validateUserId, sanitizeForLog } from '../utils/securityUtils';

interface ActivityStreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

// User Points
export const getUserPoints = async (userId: string) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('user_points')
            .select('*')
            .eq('user_id', validatedUserId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data || { user_id: validatedUserId, total_points: 0 };
    } catch (error) {
        console.error('Failed to get user points:', sanitizeForLog(error));
        return { user_id: '', total_points: 0 };
    }
};

export const updateUserPoints = async (userId: string, points: number) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('user_points')
            .upsert({ user_id: validatedUserId, total_points: points })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to update user points:', sanitizeForLog(error));
        throw new Error('Failed to update user points');
    }
};

// Earned Badges
export const getEarnedBadges = async (userId: string) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('earned_badges')
            .select('*')
            .eq('user_id', validatedUserId)
            .order('earned_date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get earned badges:', sanitizeForLog(error));
        return [];
    }
};

export const awardBadge = async (userId: string, badgeId: string) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('earned_badges')
            .insert({ 
                user_id: validatedUserId, 
                badge_id: badgeId, 
                earned_date: new Date().toISOString().split('T')[0] 
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to award badge:', sanitizeForLog(error));
        throw new Error('Failed to award badge');
    }
};

// Activity Streaks
export const getActivityStreaks = async (userId: string) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('activity_streaks')
            .select('*')
            .eq('user_id', validatedUserId);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get activity streaks:', sanitizeForLog(error));
        return [];
    }
};

export const updateActivityStreak = async (userId: string, activityType: string, streakData: ActivityStreakData) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('activity_streaks')
            .upsert({ 
                user_id: validatedUserId, 
                activity_type: activityType,
                current_streak: streakData.current_streak,
                longest_streak: streakData.longest_streak,
                last_activity_date: streakData.last_activity_date
            }, { onConflict: 'user_id,activity_type' })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to update activity streak:', sanitizeForLog(error));
        throw new Error('Failed to update activity streak');
    }
};