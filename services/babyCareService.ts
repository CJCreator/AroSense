import { supabase } from '../src/integrations/supabase/client';
import {
    FeedingLogEntry, DiaperLogEntry, BabySleepLogEntry, GrowthRecordEntry, MilestoneEntry,
    VaccinationEntry, FoodLogEntry
} from '../types';

// Generic helper for adding a log
const addLog = async <T extends { id: string }>(tableName: string, userId: string, childId: string, logData: Omit<T, 'id' | 'user_id' | 'childId' | 'created_at'>): Promise<T> => {
    const { data, error } = await supabase
        .from(tableName)
        .insert({ ...logData, user_id: userId, child_id: childId })
        .select()
        .single();
    if (error) throw error;
    return data as T;
};

// Generic helper for updating a log
const updateLog = async <T>(tableName: string, userId: string, logId: string, logData: Partial<T>): Promise<T> => {
    const { data, error } = await supabase
        .from(tableName)
        .update(logData)
        .eq('id', logId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data as T;
};

// Generic helper for deleting a log
const deleteLog = async (tableName: string, userId: string, logId: string): Promise<void> => {
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', logId)
        .eq('user_id', userId);
    if (error) throw error;
};

// --- Feeding Logs ---
export const getFeedingLogs = async (userId: string, childId: string): Promise<FeedingLogEntry[]> => {
    const { data, error } = await supabase.from('baby_feeding_logs').select('*').eq('user_id', userId).eq('child_id', childId).order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
};
export const addFeedingLog = (userId: string, childId: string, logData: Omit<FeedingLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<FeedingLogEntry>('baby_feeding_logs', userId, childId, logData);
export const updateFeedingLog = (userId: string, logId: string, logData: Partial<FeedingLogEntry>) => updateLog<FeedingLogEntry>('baby_feeding_logs', userId, logId, logData);
export const deleteFeedingLog = (userId: string, logId: string) => deleteLog('baby_feeding_logs', userId, logId);

// --- Diaper Logs ---
export const getDiaperLogs = async (userId: string, childId: string): Promise<DiaperLogEntry[]> => {
    const { data, error } = await supabase.from('baby_diaper_logs').select('*').eq('user_id', userId).eq('child_id', childId).order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
};
export const addDiaperLog = (userId: string, childId: string, logData: Omit<DiaperLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<DiaperLogEntry>('baby_diaper_logs', userId, childId, logData);
export const updateDiaperLog = (userId: string, logId: string, logData: Partial<DiaperLogEntry>) => updateLog<DiaperLogEntry>('baby_diaper_logs', userId, logId, logData);
export const deleteDiaperLog = (userId: string, logId: string) => deleteLog('baby_diaper_logs', userId, logId);

// --- Baby Sleep Logs ---
export const getBabySleepLogs = async (userId: string, childId: string): Promise<BabySleepLogEntry[]> => {
    const { data, error } = await supabase.from('baby_sleep_logs').select('*').eq('user_id', userId).eq('child_id', childId).order('start_time', { ascending: false });
    if (error) throw error;
    return data;
};
export const addBabySleepLog = (userId: string, childId: string, logData: Omit<BabySleepLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<BabySleepLogEntry>('baby_sleep_logs', userId, childId, logData);
export const updateBabySleepLog = (userId: string, logId: string, logData: Partial<BabySleepLogEntry>) => updateLog<BabySleepLogEntry>('baby_sleep_logs', userId, logId, logData);
export const deleteBabySleepLog = (userId: string, logId: string) => deleteLog('baby_sleep_logs', userId, logId);

// --- Growth Records ---
export const getGrowthRecords = async (userId: string, childId: string): Promise<GrowthRecordEntry[]> => {
    const { data, error } = await supabase.from('baby_growth_records').select('*').eq('user_id', userId).eq('child_id', childId).order('date', { ascending: false });
    if (error) throw error;
    return data;
};
export const addGrowthRecord = (userId: string, childId: string, recordData: Omit<GrowthRecordEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<GrowthRecordEntry>('baby_growth_records', userId, childId, recordData);
export const updateGrowthRecord = (userId: string, recordId: string, recordData: Partial<GrowthRecordEntry>) => updateLog<GrowthRecordEntry>('baby_growth_records', userId, recordId, recordData);
export const deleteGrowthRecord = (userId: string, recordId: string) => deleteLog('baby_growth_records', userId, recordId);

// --- Milestones ---
export const getMilestones = async (userId: string, childId: string): Promise<MilestoneEntry[]> => {
    const { data, error } = await supabase.from('baby_milestones').select('*').eq('user_id', userId).eq('child_id', childId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};
export const addMilestone = (userId: string, childId: string, milestoneData: Omit<MilestoneEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<MilestoneEntry>('baby_milestones', userId, childId, milestoneData);
export const updateMilestone = (userId: string, milestoneId: string, milestoneData: Partial<MilestoneEntry>) => updateLog<MilestoneEntry>('baby_milestones', userId, milestoneId, milestoneData);
export const deleteMilestone = (userId: string, milestoneId: string) => deleteLog('baby_milestones', userId, milestoneId);
export const bulkAddMilestones = async (userId: string, childId: string, milestones: Omit<MilestoneEntry, 'id' | 'user_id' | 'childId' | 'created_at'>[]): Promise<MilestoneEntry[]> => {
    const milestonesToInsert = milestones.map(m => ({ ...m, user_id: userId, child_id: childId }));
    const { data, error } = await supabase.from('baby_milestones').insert(milestonesToInsert).select();
    if (error) throw error;
    return data;
};

// --- Vaccinations ---
export const getVaccinations = async (userId: string, childId: string): Promise<VaccinationEntry[]> => {
    const { data, error } = await supabase.from('baby_vaccinations').select('*').eq('user_id', userId).eq('child_id', childId).order('administered_date', { ascending: false });
    if (error) throw error;
    return data;
};
export const addVaccination = (userId: string, childId: string, vaccinationData: Omit<VaccinationEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<VaccinationEntry>('baby_vaccinations', userId, childId, vaccinationData);
export const updateVaccination = (userId: string, vaccinationId: string, vaccinationData: Partial<VaccinationEntry>) => updateLog<VaccinationEntry>('baby_vaccinations', userId, vaccinationId, vaccinationData);
export const deleteVaccination = (userId: string, vaccinationId: string) => deleteLog('baby_vaccinations', userId, vaccinationId);

// --- Food Logs (Baby Nutrition) ---
export const getFoodLogs = async (userId: string, childId: string): Promise<FoodLogEntry[]> => {
    const { data, error } = await supabase.from('baby_food_logs').select('*').eq('user_id', userId).eq('child_id', childId).order('date', { ascending: false }).order('time', { ascending: false });
    if (error) throw error;
    return data;
};
export const addFoodLog = (userId: string, childId: string, logData: Omit<FoodLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<FoodLogEntry>('baby_food_logs', userId, childId, logData);
export const updateFoodLog = (userId: string, logId: string, logData: Partial<FoodLogEntry>) => updateLog<FoodLogEntry>('baby_food_logs', userId, logId, logData);
export const deleteFoodLog = (userId: string, logId: string) => deleteLog('baby_food_logs', userId, logId);