import { supabase } from '../integrations/supabase/client';
import { 
    VitalLog, WeightLogEntry, ActivityLog, SleepLog, HydrationLog, MoodLog,
    WeightGoal, ActivityGoal, HydrationGoal, WellnessResource 
} from '../types';

// --- Vitals Service ---
export const getVitals = async (userId: string): Promise<VitalLog[]> => {
    const { data, error } = await supabase.from('wellness_vitals').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return data as VitalLog[];
};
export const addVital = async (userId: string, vital: Omit<VitalLog, 'id' | 'user_id' | 'created_at'>): Promise<VitalLog> => {
    const { data, error } = await supabase.from('wellness_vitals').insert({ ...vital, user_id: userId }).select().single();
    if (error) throw error;
    return data as VitalLog;
};
export const deleteVital = async (userId: string, vitalId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_vitals').delete().eq('id', vitalId).eq('user_id', userId);
    if (error) throw error;
};

// --- Weight & BMI Service ---
export const getWeightLogs = async (userId: string): Promise<WeightLogEntry[]> => {
    const { data, error } = await supabase.from('wellness_weight_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return data as WeightLogEntry[];
};
export const addWeightLog = async (userId: string, log: Omit<WeightLogEntry, 'id' | 'user_id' | 'created_at'>): Promise<WeightLogEntry> => {
    const { data, error } = await supabase.from('wellness_weight_logs').insert({ ...log, user_id: userId }).select().single();
    if (error) throw error;
    return data as WeightLogEntry;
};
export const deleteWeightLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_weight_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Goals (Weight, Activity, Hydration) ---
export const getGoals = async (userId: string): Promise<{ weight_goal: WeightGoal, activity_goal: ActivityGoal, hydration_goal: HydrationGoal } | null> => {
    const { data, error } = await supabase.from('wellness_goals').select('weight_goal, activity_goal, hydration_goal').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore 'no rows' error
    return data;
};
export const saveWeightGoal = async (userId: string, goal: WeightGoal): Promise<void> => {
    const { error } = await supabase.from('wellness_goals').upsert({ user_id: userId, weight_goal: goal });
    if (error) throw error;
};
export const saveActivityGoal = async (userId: string, goal: ActivityGoal): Promise<void> => {
    const { error } = await supabase.from('wellness_goals').upsert({ user_id: userId, activity_goal: goal });
    if (error) throw error;
};
export const saveHydrationGoal = async (userId: string, goal: HydrationGoal): Promise<void> => {
    const { error } = await supabase.from('wellness_goals').upsert({ user_id: userId, hydration_goal: goal });
    if (error) throw error;
};

// --- Activity Service ---
export const getActivityLogs = async (userId: string): Promise<ActivityLog[]> => {
    const { data, error } = await supabase.from('wellness_activity_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return data as ActivityLog[];
};
export const addActivityLog = async (userId: string, log: Omit<ActivityLog, 'id' | 'user_id' | 'created_at'>): Promise<ActivityLog> => {
    const { data, error } = await supabase.from('wellness_activity_logs').insert({ ...log, user_id: userId }).select().single();
    if (error) throw error;
    return data as ActivityLog;
};
export const deleteActivityLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_activity_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Sleep Service ---
export const getSleepLogs = async (userId: string): Promise<SleepLog[]> => {
    const { data, error } = await supabase.from('wellness_sleep_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return data as SleepLog[];
};
export const addSleepLog = async (userId: string, log: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>): Promise<SleepLog> => {
    const { data, error } = await supabase.from('wellness_sleep_logs').insert({ ...log, user_id: userId }).select().single();
    if (error) throw error;
    return data as SleepLog;
};
export const deleteSleepLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_sleep_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Hydration Service ---
export const getHydrationLogs = async (userId: string): Promise<HydrationLog[]> => {
    const { data, error } = await supabase.from('wellness_hydration_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return data as HydrationLog[];
};
export const addHydrationLog = async (userId: string, log: Omit<HydrationLog, 'id' | 'user_id' | 'created_at'>): Promise<HydrationLog> => {
    const { data, error } = await supabase.from('wellness_hydration_logs').insert({ ...log, user_id: userId }).select().single();
    if (error) throw error;
    return data as HydrationLog;
};
export const deleteHydrationLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_hydration_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Mood Service ---
export const getMoodLogs = async (userId: string): Promise<MoodLog[]> => {
    const { data, error } = await supabase.from('wellness_mood_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return data as MoodLog[];
};
export const addMoodLog = async (userId: string, log: Omit<MoodLog, 'id' | 'user_id' | 'created_at'>): Promise<MoodLog> => {
    const { data, error } = await supabase.from('wellness_mood_logs').insert({ ...log, user_id: userId }).select().single();
    if (error) throw error;
    return data as MoodLog;
};
export const deleteMoodLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_mood_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Wellness Resources Service (Global, not user-specific) ---
export const getWellnessResources = async (): Promise<WellnessResource[]> => {
    // This can be migrated to a Supabase table later if needed
    return Promise.resolve([
        { id: 'res1', title: 'Understanding Blood Pressure', category: 'Vitals', summary: 'Learn what the numbers mean and how to maintain a healthy BP.'},
        { id: 'res2', title: 'Benefits of Daily Activity', category: 'Activity', summary: 'Discover how even small amounts of daily exercise can improve your health.'},
        { id: 'res3', title: 'The Importance of Hydration', category: 'Hydration', summary: 'Why drinking enough water is crucial for your body and mind.'}
    ]);
};