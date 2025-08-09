import { supabase } from '../src/integrations/supabase/client';
import { 
    VitalsLog, VitalsLogInput,
    WeightLog, WeightLogInput,
    ActivityLog, ActivityLogInput,
    WellnessLog, WellnessLogInput,
    QueryOptions 
} from '../types/phase1Types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// =============================================
// VITALS TRACKING
// =============================================

export const getVitalsLogs = async (userId: string, options: QueryOptions = {}): Promise<VitalsLog[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('vitals_logs')
            .select('*')
            .eq('user_id', validatedUserId);
        
        if (options.familyMemberId) {
            const validatedFamilyMemberId = validateId(options.familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        if (options.startDate) {
            query = query.gte('measured_at', options.startDate);
        }
        
        if (options.endDate) {
            query = query.lte('measured_at', options.endDate);
        }
        
        const { data, error } = await query
            .order('measured_at', { ascending: false })
            .limit(options.limit || 100);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get vitals logs:', sanitizeForLog(error));
        throw new Error('Failed to get vitals logs');
    }
};

export const addVitalsLog = async (userId: string, vitalsData: VitalsLogInput): Promise<VitalsLog> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('vitals_logs')
            .insert({ ...vitalsData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add vitals log:', sanitizeForLog(error));
        throw new Error('Failed to add vitals log');
    }
};

export const updateVitalsLog = async (userId: string, logId: string, vitalsData: Partial<VitalsLogInput>): Promise<VitalsLog> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedLogId = validateId(logId);
        
        const { data, error } = await supabase
            .from('vitals_logs')
            .update(vitalsData)
            .eq('user_id', validatedUserId)
            .eq('id', validatedLogId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No vitals log found to update');
        return data;
    } catch (error) {
        console.error('Failed to update vitals log:', sanitizeForLog(error));
        throw new Error('Failed to update vitals log');
    }
};

export const deleteVitalsLog = async (userId: string, logId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedLogId = validateId(logId);
        
        const { error } = await supabase
            .from('vitals_logs')
            .delete()
            .eq('user_id', validatedUserId)
            .eq('id', validatedLogId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete vitals log:', sanitizeForLog(error));
        throw new Error('Failed to delete vitals log');
    }
};

// =============================================
// WEIGHT TRACKING
// =============================================

export const getWeightLogs = async (userId: string, options: QueryOptions = {}): Promise<WeightLog[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('weight_logs')
            .select('*')
            .eq('user_id', validatedUserId);
        
        if (options.familyMemberId) {
            const validatedFamilyMemberId = validateId(options.familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        if (options.startDate) {
            query = query.gte('measured_at', options.startDate);
        }
        
        if (options.endDate) {
            query = query.lte('measured_at', options.endDate);
        }
        
        const { data, error } = await query
            .order('measured_at', { ascending: false })
            .limit(options.limit || 100);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get weight logs:', sanitizeForLog(error));
        throw new Error('Failed to get weight logs');
    }
};

export const addWeightLog = async (userId: string, weightData: WeightLogInput): Promise<WeightLog> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('weight_logs')
            .insert({ ...weightData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add weight log:', sanitizeForLog(error));
        throw new Error('Failed to add weight log');
    }
};

// =============================================
// ACTIVITY TRACKING
// =============================================

export const getActivityLogs = async (userId: string, options: QueryOptions = {}): Promise<ActivityLog[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', validatedUserId);
        
        if (options.familyMemberId) {
            const validatedFamilyMemberId = validateId(options.familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        if (options.startDate) {
            query = query.gte('activity_date', options.startDate);
        }
        
        if (options.endDate) {
            query = query.lte('activity_date', options.endDate);
        }
        
        const { data, error } = await query
            .order('activity_date', { ascending: false })
            .limit(options.limit || 100);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get activity logs:', sanitizeForLog(error));
        throw new Error('Failed to get activity logs');
    }
};

export const addActivityLog = async (userId: string, activityData: ActivityLogInput): Promise<ActivityLog> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('activity_logs')
            .insert({ ...activityData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add activity log:', sanitizeForLog(error));
        throw new Error('Failed to add activity log');
    }
};

// =============================================
// WELLNESS TRACKING
// =============================================

export const getWellnessLogs = async (userId: string, options: QueryOptions = {}): Promise<WellnessLog[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('wellness_logs')
            .select('*')
            .eq('user_id', validatedUserId);
        
        if (options.familyMemberId) {
            const validatedFamilyMemberId = validateId(options.familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        if (options.startDate) {
            query = query.gte('log_date', options.startDate);
        }
        
        if (options.endDate) {
            query = query.lte('log_date', options.endDate);
        }
        
        const { data, error } = await query
            .order('log_date', { ascending: false })
            .limit(options.limit || 100);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get wellness logs:', sanitizeForLog(error));
        throw new Error('Failed to get wellness logs');
    }
};

export const addWellnessLog = async (userId: string, wellnessData: WellnessLogInput): Promise<WellnessLog> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('wellness_logs')
            .insert({ ...wellnessData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add wellness log:', sanitizeForLog(error));
        throw new Error('Failed to add wellness log');
    }
};