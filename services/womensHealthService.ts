import { supabase } from '../src/integrations/supabase/client';
import { validateUserId } from '../utils/securityUtils';

// Period Tracking
export const getPeriodEntries = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('period_entries')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const addPeriodEntry = async (userId: string, entryData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('period_entries')
        .insert({ ...entryData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Symptom Tracking
export const getSymptomLogs = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const addSymptomLog = async (userId: string, logData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('symptom_logs')
        .insert({ ...logData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Screening Reminders
export const getScreeningReminders = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('screening_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('next_due_date', { ascending: true });
    
    if (error) throw error;
    return data;
};

export const addScreeningReminder = async (userId: string, reminderData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('screening_reminders')
        .insert({ ...reminderData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};