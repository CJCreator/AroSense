import { supabase } from '../src/integrations/supabase/client';
import {
    FeedingLogEntry, DiaperLogEntry, BabySleepLogEntry, GrowthRecordEntry, MilestoneEntry,
    VaccinationEntry, FoodLogEntry
} from '../types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// Generic helper for adding a log
const addLog = async <T extends { id: string }>(tableName: string, userId: string, childId: string, logData: Omit<T, 'id' | 'user_id' | 'childId' | 'created_at'>): Promise<T> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from(tableName)
            .insert({ ...logData, user_id: validatedUserId, child_id: validatedChildId })
            .select()
            .single();
        if (error) throw error;
        return data as T;
    } catch (error) {
        console.error(`Failed to add log to ${tableName}:`, sanitizeForLog(error));
        throw new Error(`Failed to add log to ${tableName}`);
    }
};

// Generic helper for updating a log
const updateLog = async <T>(tableName: string, userId: string, logId: string, logData: Partial<T>): Promise<T> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedLogId = validateId(logId);
        
        const { data, error } = await supabase
            .from(tableName)
            .update(logData)
            .eq('id', validatedLogId)
            .eq('user_id', validatedUserId)
            .select()
            .single();
        if (error) throw error;
        if (!data) throw new Error(`No data returned after update in ${tableName}`);
        return data as T;
    } catch (error) {
        console.error(`Failed to update log in ${tableName}:`, sanitizeForLog(error));
        throw new Error(`Failed to update log in ${tableName}`);
    }
};

// Generic helper for deleting a log
const deleteLog = async (tableName: string, userId: string, logId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedLogId = validateId(logId);
        
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', validatedLogId)
            .eq('user_id', validatedUserId);
        if (error) throw error;
    } catch (error) {
        console.error(`Failed to delete log from ${tableName}:`, sanitizeForLog(error));
        throw new Error(`Failed to delete log from ${tableName}`);
    }
};

// --- Feeding Logs ---
export const getFeedingLogs = async (userId: string, childId: string): Promise<FeedingLogEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_feeding_logs')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get feeding logs:', sanitizeForLog(error));
        throw new Error('Failed to get feeding logs');
    }
};
export const addFeedingLog = (userId: string, childId: string, logData: Omit<FeedingLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<FeedingLogEntry>('baby_feeding_logs', userId, childId, logData);
export const updateFeedingLog = (userId: string, logId: string, logData: Partial<FeedingLogEntry>) => updateLog<FeedingLogEntry>('baby_feeding_logs', userId, logId, logData);
export const deleteFeedingLog = (userId: string, logId: string) => deleteLog('baby_feeding_logs', userId, logId);

// --- Diaper Logs ---
export const getDiaperLogs = async (userId: string, childId: string): Promise<DiaperLogEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_diaper_logs')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get diaper logs:', sanitizeForLog(error));
        throw new Error('Failed to get diaper logs');
    }
};
export const addDiaperLog = (userId: string, childId: string, logData: Omit<DiaperLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<DiaperLogEntry>('baby_diaper_logs', userId, childId, logData);
export const updateDiaperLog = (userId: string, logId: string, logData: Partial<DiaperLogEntry>) => updateLog<DiaperLogEntry>('baby_diaper_logs', userId, logId, logData);
export const deleteDiaperLog = (userId: string, logId: string) => deleteLog('baby_diaper_logs', userId, logId);

// --- Baby Sleep Logs ---
export const getBabySleepLogs = async (userId: string, childId: string): Promise<BabySleepLogEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_sleep_logs')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('start_time', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get sleep logs:', sanitizeForLog(error));
        throw new Error('Failed to get sleep logs');
    }
};
export const addBabySleepLog = (userId: string, childId: string, logData: Omit<BabySleepLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<BabySleepLogEntry>('baby_sleep_logs', userId, childId, logData);
export const updateBabySleepLog = (userId: string, logId: string, logData: Partial<BabySleepLogEntry>) => updateLog<BabySleepLogEntry>('baby_sleep_logs', userId, logId, logData);
export const deleteBabySleepLog = (userId: string, logId: string) => deleteLog('baby_sleep_logs', userId, logId);

// --- Growth Records ---
export const getGrowthRecords = async (userId: string, childId: string): Promise<GrowthRecordEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_growth_records')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get growth records:', sanitizeForLog(error));
        throw new Error('Failed to get growth records');
    }
};
export const addGrowthRecord = (userId: string, childId: string, recordData: Omit<GrowthRecordEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<GrowthRecordEntry>('baby_growth_records', userId, childId, recordData);
export const updateGrowthRecord = (userId: string, recordId: string, recordData: Partial<GrowthRecordEntry>) => updateLog<GrowthRecordEntry>('baby_growth_records', userId, recordId, recordData);
export const deleteGrowthRecord = (userId: string, recordId: string) => deleteLog('baby_growth_records', userId, recordId);

// --- Milestones ---
export const getMilestones = async (userId: string, childId: string): Promise<MilestoneEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_milestones')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get milestones:', sanitizeForLog(error));
        throw new Error('Failed to get milestones');
    }
};
export const addMilestone = (userId: string, childId: string, milestoneData: Omit<MilestoneEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<MilestoneEntry>('baby_milestones', userId, childId, milestoneData);
export const updateMilestone = (userId: string, milestoneId: string, milestoneData: Partial<MilestoneEntry>) => updateLog<MilestoneEntry>('baby_milestones', userId, milestoneId, milestoneData);
export const deleteMilestone = (userId: string, milestoneId: string) => deleteLog('baby_milestones', userId, milestoneId);
export const bulkAddMilestones = async (userId: string, childId: string, milestones: Omit<MilestoneEntry, 'id' | 'user_id' | 'childId' | 'created_at'>[]): Promise<MilestoneEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const milestonesToInsert = milestones.map(m => ({ 
            ...m, 
            user_id: validatedUserId, 
            child_id: validatedChildId 
        }));
        
        const { data, error } = await supabase
            .from('baby_milestones')
            .insert(milestonesToInsert)
            .select();
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to bulk add milestones:', sanitizeForLog(error));
        throw new Error('Failed to bulk add milestones');
    }
};

// --- Vaccinations ---
export const getVaccinations = async (userId: string, childId: string): Promise<VaccinationEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_vaccinations')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('administered_date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get vaccinations:', sanitizeForLog(error));
        throw new Error('Failed to get vaccinations');
    }
};
export const addVaccination = (userId: string, childId: string, vaccinationData: Omit<VaccinationEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<VaccinationEntry>('baby_vaccinations', userId, childId, vaccinationData);
export const updateVaccination = (userId: string, vaccinationId: string, vaccinationData: Partial<VaccinationEntry>) => updateLog<VaccinationEntry>('baby_vaccinations', userId, vaccinationId, vaccinationData);
export const deleteVaccination = (userId: string, vaccinationId: string) => deleteLog('baby_vaccinations', userId, vaccinationId);

// --- Food Logs (Baby Nutrition) ---
export const getFoodLogs = async (userId: string, childId: string): Promise<FoodLogEntry[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedChildId = validateId(childId);
        
        const { data, error } = await supabase
            .from('baby_food_logs')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('child_id', validatedChildId)
            .order('date', { ascending: false })
            .order('time', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get food logs:', sanitizeForLog(error));
        throw new Error('Failed to get food logs');
    }
};
export const addFoodLog = (userId: string, childId: string, logData: Omit<FoodLogEntry, 'id'|'user_id'|'childId'|'created_at'>) => addLog<FoodLogEntry>('baby_food_logs', userId, childId, logData);
export const updateFoodLog = (userId: string, logId: string, logData: Partial<FoodLogEntry>) => updateLog<FoodLogEntry>('baby_food_logs', userId, logId, logData);
export const deleteFoodLog = (userId: string, logId: string) => deleteLog('baby_food_logs', userId, logId);