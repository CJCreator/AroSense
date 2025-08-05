import { supabase } from '../src/integrations/supabase/client';
import { validateUserId } from '../utils/securityUtils';

// User Points
export const getUserPoints = async (userId: string) => {
    if (!validateUserId(userId)) return { user_id: '', total_points: 0 };
    
    const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || { user_id: userId, total_points: 0 };
};

export const updateUserPoints = async (userId: string, points: number) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('user_points')
        .upsert({ user_id: userId, total_points: points })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Earned Badges
export const getEarnedBadges = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('earned_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const awardBadge = async (userId: string, badgeId: string) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('earned_badges')
        .insert({ 
            user_id: userId, 
            badge_id: badgeId, 
            earned_date: new Date().toISOString().split('T')[0] 
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Activity Streaks
export const getActivityStreaks = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('activity_streaks')
        .select('*')
        .eq('user_id', userId);
    
    if (error) throw error;
    return data;
};

export const updateActivityStreak = async (userId: string, activityType: string, streakData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('activity_streaks')
        .upsert({ 
            user_id: userId, 
            activity_type: activityType,
            ...streakData
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};