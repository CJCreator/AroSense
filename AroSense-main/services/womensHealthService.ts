import { supabase } from '../src/integrations/supabase/client';
import { validateUserId, sanitizeForLog } from '../utils/securityUtils';

interface PeriodEntryData {
  start_date: string;
  end_date?: string;
  flow_intensity: string;
  symptoms?: string[];
  notes?: string;
}

interface SymptomLogData {
  date: string;
  symptoms: string[];
  severity: number;
  notes?: string;
}

interface ScreeningReminderData {
  screening_type: string;
  next_due_date: string;
  frequency_months: number;
  notes?: string;
}

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

export const addPeriodEntry = async (userId: string, entryData: PeriodEntryData) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('period_entries')
            .insert({ ...entryData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add period entry:', sanitizeForLog(error));
        throw new Error('Failed to add period entry');
    }
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

export const addSymptomLog = async (userId: string, logData: SymptomLogData) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('symptom_logs')
            .insert({ ...logData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add symptom log:', sanitizeForLog(error));
        throw new Error('Failed to add symptom log');
    }
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

export const addScreeningReminder = async (userId: string, reminderData: ScreeningReminderData) => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('screening_reminders')
            .insert({ ...reminderData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add screening reminder:', sanitizeForLog(error));
        throw new Error('Failed to add screening reminder');
    }
};