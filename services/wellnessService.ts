import { supabase } from '../src/integrations/supabase/client';
import { 
    VitalLog, WeightLogEntry, ActivityLog, SleepLog, HydrationLog, MoodLog,
    WeightGoal, ActivityGoal, HydrationGoal, WellnessResource 
} from '../types';
import { validateUserId, sanitizeForLog } from '../utils/securityUtils';

// Import Phase 1 services
import { getVitalsLogs, addVitalsLog, getWeightLogs as getPhase1WeightLogs, addWeightLog as addPhase1WeightLog, getActivityLogs as getPhase1ActivityLogs, addActivityLog as addPhase1ActivityLog, getWellnessLogs, addWellnessLog } from './vitalsService';

// Import Phase 1 services
import { getVitalsLogs, addVitalsLog, getWeightLogs as getPhase1WeightLogs, addWeightLog as addPhase1WeightLog, getActivityLogs as getPhase1ActivityLogs, addActivityLog as addPhase1ActivityLog, getWellnessLogs, addWellnessLog } from './vitalsService';

// Import Phase 1 services
import { getVitalsLogs, addVitalsLog, getWeightLogs as getPhase1WeightLogs, addWeightLog as addPhase1WeightLog, getActivityLogs as getPhase1ActivityLogs, addActivityLog as addPhase1ActivityLog, getWellnessLogs, addWellnessLog } from './vitalsService';

// --- Vitals Service - Use Phase 1 with legacy compatibility ---
export const getVitals = async (userId: string): Promise<VitalLog[]> => {
    try {
        const phase1Data = await getVitalsLogs(userId);
        return phase1Data.map(mapPhase1VitalToLegacy);
    } catch (error) {
        console.error('Failed to get vitals:', sanitizeForLog(error));
        throw error;
    }
};

export const addVital = async (userId: string, vital: Omit<VitalLog, 'id' | 'user_id' | 'created_at'>): Promise<VitalLog> => {
    try {
        const phase1Data = mapLegacyVitalToPhase1(vital);
        const result = await addVitalsLog(userId, phase1Data);
        return mapPhase1VitalToLegacy(result);
    } catch (error) {
        console.error('Failed to add vital:', sanitizeForLog(error));
        throw error;
    }
};
export const deleteVital = async (userId: string, vitalId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_vitals').delete().eq('id', vitalId).eq('user_id', userId);
    if (error) throw error;
};

// --- Weight & BMI Service - Use Phase 1 with legacy compatibility ---
export const getWeightLogs = async (userId: string): Promise<WeightLogEntry[]> => {
    try {
        const phase1Data = await getPhase1WeightLogs(userId);
        return phase1Data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            date: item.measured_at.split('T')[0],
            weight: item.weight_kg,
            unit: 'kg' as const,
            notes: item.notes,
            familyMemberId: item.family_member_id
        }));
    } catch (error) {
        console.error('Failed to get weight logs:', sanitizeForLog(error));
        throw error;
    }
};

export const addWeightLog = async (userId: string, log: Omit<WeightLogEntry, 'id' | 'user_id' | 'created_at'>): Promise<WeightLogEntry> => {
    try {
        const phase1Data = {
            family_member_id: log.familyMemberId,
            weight_kg: log.weight,
            measured_at: `${log.date}T00:00:00Z`,
            notes: log.notes
        };
        
        const result = await addPhase1WeightLog(userId, phase1Data);
        
        return {
            id: result.id,
            user_id: result.user_id,
            date: result.measured_at.split('T')[0],
            weight: result.weight_kg,
            unit: 'kg' as const,
            notes: result.notes,
            familyMemberId: result.family_member_id
        };
    } catch (error) {
        console.error('Failed to add weight log:', sanitizeForLog(error));
        throw error;
    }
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

// --- Activity Service - Use Phase 1 with legacy compatibility ---
export const getActivityLogs = async (userId: string): Promise<ActivityLog[]> => {
    try {
        const phase1Data = await getPhase1ActivityLogs(userId);
        return phase1Data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            date: item.activity_date,
            time: '00:00',
            notes: item.notes,
            familyMemberId: item.family_member_id,
            activityType: item.activity_type,
            durationMinutes: item.duration_minutes || 0,
            effortLevel: item.intensity as any,
            steps: item.steps,
            distance: item.distance_km,
            distanceUnit: 'km' as const
        }));
    } catch (error) {
        console.error('Failed to get activity logs:', sanitizeForLog(error));
        throw error;
    }
};

export const addActivityLog = async (userId: string, log: Omit<ActivityLog, 'id' | 'user_id' | 'created_at'>): Promise<ActivityLog> => {
    try {
        const phase1Data = {
            family_member_id: log.familyMemberId,
            activity_type: log.activityType,
            duration_minutes: log.durationMinutes,
            distance_km: log.distance,
            steps: log.steps,
            intensity: log.effortLevel as any,
            activity_date: log.date,
            notes: log.notes
        };
        
        const result = await addPhase1ActivityLog(userId, phase1Data);
        
        return {
            id: result.id,
            user_id: result.user_id,
            date: result.activity_date,
            time: '00:00',
            notes: result.notes,
            familyMemberId: result.family_member_id,
            activityType: result.activity_type,
            durationMinutes: result.duration_minutes || 0,
            effortLevel: result.intensity as any,
            steps: result.steps,
            distance: result.distance_km,
            distanceUnit: 'km' as const
        };
    } catch (error) {
        console.error('Failed to add activity log:', sanitizeForLog(error));
        throw error;
    }
};
export const deleteActivityLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_activity_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Sleep Service - Use Phase 1 with legacy compatibility ---
export const getSleepLogs = async (userId: string): Promise<SleepLog[]> => {
    try {
        const phase1Data = await getWellnessLogs(userId);
        return phase1Data
            .filter(item => item.log_type === 'sleep')
            .map(item => ({
                id: item.id,
                user_id: item.user_id,
                date: item.log_date,
                time: '00:00',
                notes: item.notes,
                familyMemberId: item.family_member_id,
                bedTime: '22:00',
                wakeTime: '06:00',
                durationHours: item.value_numeric || 8,
                quality: item.value_text as any
            }));
    } catch (error) {
        console.error('Failed to get sleep logs:', sanitizeForLog(error));
        throw error;
    }
};

export const addSleepLog = async (userId: string, log: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>): Promise<SleepLog> => {
    try {
        const wellnessData = {
            family_member_id: log.familyMemberId,
            log_type: 'sleep' as const,
            value_numeric: log.durationHours,
            value_text: log.quality,
            log_date: log.date,
            notes: log.notes
        };
        
        const result = await addWellnessLog(userId, wellnessData);
        
        return {
            id: result.id,
            user_id: result.user_id,
            date: result.log_date,
            time: '00:00',
            notes: result.notes,
            familyMemberId: result.family_member_id,
            bedTime: log.bedTime,
            wakeTime: log.wakeTime,
            durationHours: result.value_numeric || 8,
            quality: result.value_text as any
        };
    } catch (error) {
        console.error('Failed to add sleep log:', sanitizeForLog(error));
        throw error;
    }
};
export const deleteSleepLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_sleep_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Hydration Service - Use Phase 1 with legacy compatibility ---
export const getHydrationLogs = async (userId: string): Promise<HydrationLog[]> => {
    try {
        const phase1Data = await getWellnessLogs(userId);
        return phase1Data
            .filter(item => item.log_type === 'hydration')
            .map(item => ({
                id: item.id,
                user_id: item.user_id,
                date: item.log_date,
                time: '00:00',
                notes: item.notes,
                familyMemberId: item.family_member_id,
                amount: item.value_numeric || 0,
                unit: 'ml' as const
            }));
    } catch (error) {
        console.error('Failed to get hydration logs:', sanitizeForLog(error));
        throw error;
    }
};

export const addHydrationLog = async (userId: string, log: Omit<HydrationLog, 'id' | 'user_id' | 'created_at'>): Promise<HydrationLog> => {
    try {
        const wellnessData = {
            family_member_id: log.familyMemberId,
            log_type: 'hydration' as const,
            value_numeric: log.amount,
            log_date: log.date,
            notes: log.notes
        };
        
        const result = await addWellnessLog(userId, wellnessData);
        
        return {
            id: result.id,
            user_id: result.user_id,
            date: result.log_date,
            time: '00:00',
            notes: result.notes,
            familyMemberId: result.family_member_id,
            amount: result.value_numeric || 0,
            unit: 'ml' as const
        };
    } catch (error) {
        console.error('Failed to add hydration log:', sanitizeForLog(error));
        throw error;
    }
};
export const deleteHydrationLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_hydration_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Mood Service - Use Phase 1 with legacy compatibility ---
export const getMoodLogs = async (userId: string): Promise<MoodLog[]> => {
    try {
        const phase1Data = await getWellnessLogs(userId);
        return phase1Data
            .filter(item => item.log_type === 'mood')
            .map(item => ({
                id: item.id,
                user_id: item.user_id,
                date: item.log_date,
                time: '00:00',
                notes: item.notes,
                familyMemberId: item.family_member_id,
                moodRating: item.scale_rating,
                selectedMoods: item.value_text ? [item.value_text] : [],
                journal: item.notes
            }));
    } catch (error) {
        console.error('Failed to get mood logs:', sanitizeForLog(error));
        throw error;
    }
};

export const addMoodLog = async (userId: string, log: Omit<MoodLog, 'id' | 'user_id' | 'created_at'>): Promise<MoodLog> => {
    try {
        const wellnessData = {
            family_member_id: log.familyMemberId,
            log_type: 'mood' as const,
            scale_rating: log.moodRating,
            value_text: log.selectedMoods?.[0],
            log_date: log.date,
            notes: log.journal || log.notes
        };
        
        const result = await addWellnessLog(userId, wellnessData);
        
        return {
            id: result.id,
            user_id: result.user_id,
            date: result.log_date,
            time: '00:00',
            notes: result.notes,
            familyMemberId: result.family_member_id,
            moodRating: result.scale_rating,
            selectedMoods: result.value_text ? [result.value_text] : [],
            journal: result.notes
        };
    } catch (error) {
        console.error('Failed to add mood log:', sanitizeForLog(error));
        throw error;
    }
};
export const deleteMoodLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase.from('wellness_mood_logs').delete().eq('id', logId).eq('user_id', userId);
    if (error) throw error;
};

// --- Wellness Resources Service (Global, not user-specific) ---
export const getWellnessResources = async (): Promise<WellnessResource[]> => {
    return Promise.resolve([
        { id: 'res1', title: 'Understanding Blood Pressure', category: 'Vitals', summary: 'Learn what the numbers mean and how to maintain a healthy BP.'},
        { id: 'res2', title: 'Benefits of Daily Activity', category: 'Activity', summary: 'Discover how even small amounts of daily exercise can improve your health.'},
        { id: 'res3', title: 'The Importance of Hydration', category: 'Hydration', summary: 'Why drinking enough water is crucial for your body and mind.'}
    ]);
};

// --- Wellness Summary Service ---
interface WellnessSummary {
    lastBP?: VitalLog;
    currentWeight?: WeightLogEntry;
    todayActivityProgress: { logged: number; goal: number; unit: string };
    todayHydrationProgress: { logged: number; goal: number; unit: string };
    lastMood?: MoodLog;
}

export const getWellnessSummary = async (userId: string): Promise<WellnessSummary | null> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const [vitals, weights, activities, hydration, moods] = await Promise.all([
            getVitals(validatedUserId),
            getWeightLogs(validatedUserId), 
            getActivityLogs(validatedUserId),
            getHydrationLogs(validatedUserId),
            getMoodLogs(validatedUserId)
        ]);
        
        // Helper functions for mapping between legacy and Phase 1 formats
        function mapLegacyVitalToPhase1(vital: Omit<VitalLog, 'id' | 'user_id'>): any {
            const baseData = {
                family_member_id: vital.familyMemberId,
                measured_at: `${vital.date}T${vital.time || '00:00'}:00Z`,
                notes: vital.notes
            };
            
            switch (vital.type) {
                case 'BloodPressure':
                    return {
                        ...baseData,
                        vital_type: 'blood_pressure',
                        systolic: vital.systolic,
                        diastolic: vital.diastolic,
                        value_numeric: vital.pulse
                    };
                case 'HeartRate':
                    return {
                        ...baseData,
                        vital_type: 'heart_rate',
                        value_numeric: vital.value
                    };
                case 'BloodGlucose':
                    return {
                        ...baseData,
                        vital_type: 'blood_glucose',
                        value_numeric: vital.level,
                        unit: vital.unit,
                        value_text: vital.readingContext
                    };
                case 'Temperature':
                    return {
                        ...baseData,
                        vital_type: 'temperature',
                        value_numeric: vital.value,
                        unit: vital.unit
                    };
                case 'OxygenSaturation':
                    return {
                        ...baseData,
                        vital_type: 'oxygen_saturation',
                        value_numeric: vital.value
                    };
                default:
                    return baseData;
            }
        }
        
        function mapPhase1VitalToLegacy(phase1: any): VitalLog {
            const baseData = {
                id: phase1.id,
                user_id: phase1.user_id,
                date: phase1.measured_at.split('T')[0],
                time: phase1.measured_at.split('T')[1]?.substring(0, 5) || '00:00',
                notes: phase1.notes,
                familyMemberId: phase1.family_member_id
            };
            
            switch (phase1.vital_type) {
                case 'blood_pressure':
                    return {
                        ...baseData,
                        type: 'BloodPressure',
                        systolic: phase1.systolic,
                        diastolic: phase1.diastolic,
                        pulse: phase1.value_numeric
                    };
                case 'heart_rate':
                    return {
                        ...baseData,
                        type: 'HeartRate',
                        value: phase1.value_numeric
                    };
                case 'blood_glucose':
                    return {
                        ...baseData,
                        type: 'BloodGlucose',
                        level: phase1.value_numeric,
                        unit: phase1.unit || 'mg/dL',
                        readingContext: phase1.value_text || 'Random'
                    };
                case 'temperature':
                    return {
                        ...baseData,
                        type: 'Temperature',
                        value: phase1.value_numeric,
                        unit: phase1.unit || 'Celsius'
                    };
                case 'oxygen_saturation':
                    return {
                        ...baseData,
                        type: 'OxygenSaturation',
                        value: phase1.value_numeric
                    };
                default:
                    return {
                        ...baseData,
                        type: 'HeartRate',
                        value: 0
                    };
            }
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        return {
            lastBP: vitals.find(v => v.type === 'BloodPressure'),
            currentWeight: weights[0],
            todayActivityProgress: { 
                logged: activities.filter(a => a.date === today).length, 
                goal: 1, 
                unit: 'activities' 
            },
            todayHydrationProgress: { 
                logged: hydration.filter(h => h.date === today).reduce((sum, h) => sum + h.amount, 0), 
                goal: 2000, 
                unit: 'ml' 
            },
            lastMood: moods[0]
        };
    } catch (error) {
        console.error('Failed to get wellness summary:', sanitizeForLog(error));
        return null;
    }
};

// Helper functions for mapping between legacy and Phase 1 formats
function mapLegacyVitalToPhase1(vital: Omit<VitalLog, 'id' | 'user_id'>): any {
    const baseData = {
        family_member_id: vital.familyMemberId,
        measured_at: `${vital.date}T${vital.time || '00:00'}:00Z`,
        notes: vital.notes
    };
    
    switch (vital.type) {
        case 'BloodPressure':
            return {
                ...baseData,
                vital_type: 'blood_pressure',
                systolic: vital.systolic,
                diastolic: vital.diastolic,
                value_numeric: vital.pulse
            };
        case 'HeartRate':
            return {
                ...baseData,
                vital_type: 'heart_rate',
                value_numeric: vital.value
            };
        default:
            return baseData;
    }
}

function mapPhase1VitalToLegacy(phase1: any): VitalLog {
    const baseData = {
        id: phase1.id,
        user_id: phase1.user_id,
        date: phase1.measured_at.split('T')[0],
        time: phase1.measured_at.split('T')[1]?.substring(0, 5) || '00:00',
        notes: phase1.notes,
        familyMemberId: phase1.family_member_id
    };
    
    switch (phase1.vital_type) {
        case 'blood_pressure':
            return {
                ...baseData,
                type: 'BloodPressure',
                systolic: phase1.systolic,
                diastolic: phase1.diastolic,
                pulse: phase1.value_numeric
            };
        case 'heart_rate':
            return {
                ...baseData,
                type: 'HeartRate',
                value: phase1.value_numeric
            };
        default:
            return {
                ...baseData,
                type: 'HeartRate',
                value: 0
            };
    }
}

// Helper functions for mapping between legacy and Phase 1 formats
function mapLegacyVitalToPhase1(vital: Omit<VitalLog, 'id' | 'user_id'>): any {
    const baseData = {
        family_member_id: vital.familyMemberId,
        measured_at: `${vital.date}T${vital.time || '00:00'}:00Z`,
        notes: vital.notes
    };
    
    switch (vital.type) {
        case 'BloodPressure':
            return {
                ...baseData,
                vital_type: 'blood_pressure',
                systolic: vital.systolic,
                diastolic: vital.diastolic,
                value_numeric: vital.pulse
            };
        case 'HeartRate':
            return {
                ...baseData,
                vital_type: 'heart_rate',
                value_numeric: vital.value
            };
        default:
            return baseData;
    }
}

function mapPhase1VitalToLegacy(phase1: any): VitalLog {
    const baseData = {
        id: phase1.id,
        user_id: phase1.user_id,
        date: phase1.measured_at.split('T')[0],
        time: phase1.measured_at.split('T')[1]?.substring(0, 5) || '00:00',
        notes: phase1.notes,
        familyMemberId: phase1.family_member_id
    };
    
    switch (phase1.vital_type) {
        case 'blood_pressure':
            return {
                ...baseData,
                type: 'BloodPressure',
                systolic: phase1.systolic,
                diastolic: phase1.diastolic,
                pulse: phase1.value_numeric
            };
        case 'heart_rate':
            return {
                ...baseData,
                type: 'HeartRate',
                value: phase1.value_numeric
            };
        default:
            return {
                ...baseData,
                type: 'HeartRate',
                value: 0
            };
    }
}