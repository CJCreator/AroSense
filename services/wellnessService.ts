import { 
    VitalLog, WeightLogEntry, BMIRecord, WeightGoal, ActivityLog, ActivityGoal, 
    SleepLog, HydrationLog, HydrationGoal, MoodLog, WellnessResource 
} from '../types.ts';

const getLocalStorageKey = (userId: string, dataType: string): string => {
    return `${userId}_${dataType}`;
};

const genericGet = async <T>(userId: string, tableName: string): Promise<T[]> => {
    const key = getLocalStorageKey(userId, tableName);
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return [];
    }
};

const genericSave = async <T>(userId: string, tableName: string, items: T[]): Promise<void> => {
    const key = getLocalStorageKey(userId, tableName);
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error);
        throw new Error(`Failed to save data for ${tableName}.`);
    }
};

const genericGetGoal = async <T>(userId: string, tableName: string, defaultGoal: T): Promise<T> => {
    const key = getLocalStorageKey(userId, tableName);
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultGoal;
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return defaultGoal;
    }
};

const genericSaveGoal = async <T>(userId: string, tableName: string, goal: T): Promise<void> => {
    const key = getLocalStorageKey(userId, tableName);
    try {
        localStorage.setItem(key, JSON.stringify(goal));
    } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error);
        throw new Error(`Failed to save goal for ${tableName}.`);
    }
};


// --- Vitals Service ---
export const getVitals = (userId: string): Promise<VitalLog[]> => genericGet<VitalLog>(userId, 'wellness_vitals');
export const saveVitals = (userId: string, vitals: VitalLog[]): Promise<void> => genericSave<VitalLog>(userId, 'wellness_vitals', vitals);

// --- Weight & BMI Service ---
export const getWeightLogs = (userId: string): Promise<WeightLogEntry[]> => genericGet<WeightLogEntry>(userId, 'wellness_weight_logs');
export const saveWeightLogs = (userId: string, logs: WeightLogEntry[]): Promise<void> => genericSave<WeightLogEntry>(userId, 'wellness_weight_logs', logs);

export const getBmiRecords = (userId: string): Promise<BMIRecord[]> => genericGet<BMIRecord>(userId, 'wellness_bmi_records');
export const saveBmiRecords = (userId: string, records: BMIRecord[]): Promise<void> => genericSave<BMIRecord>(userId, 'wellness_bmi_records', records);

export const getWeightGoal = (userId: string, defaultGoal: WeightGoal): Promise<WeightGoal> => genericGetGoal<WeightGoal>(userId, 'wellness_weight_goal', defaultGoal);
export const saveWeightGoal = (userId: string, goal: WeightGoal): Promise<void> => genericSaveGoal<WeightGoal>(userId, 'wellness_weight_goal', goal);


// --- Activity Service ---
export const getActivityLogs = (userId: string): Promise<ActivityLog[]> => genericGet<ActivityLog>(userId, 'wellness_activity_logs');
export const saveActivityLogs = (userId: string, logs: ActivityLog[]): Promise<void> => genericSave<ActivityLog>(userId, 'wellness_activity_logs', logs);

export const getActivityGoal = (userId: string, defaultGoal: ActivityGoal): Promise<ActivityGoal> => genericGetGoal<ActivityGoal>(userId, 'wellness_activity_goal', defaultGoal);
export const saveActivityGoal = (userId: string, goal: ActivityGoal): Promise<void> => genericSaveGoal<ActivityGoal>(userId, 'wellness_activity_goal', goal);


// --- Sleep Service ---
export const getSleepLogs = (userId: string): Promise<SleepLog[]> => genericGet<SleepLog>(userId, 'wellness_sleep_logs');
export const saveSleepLogs = (userId: string, logs: SleepLog[]): Promise<void> => genericSave<SleepLog>(userId, 'wellness_sleep_logs', logs);

// --- Hydration Service ---
export const getHydrationLogs = (userId: string): Promise<HydrationLog[]> => genericGet<HydrationLog>(userId, 'wellness_hydration_logs');
export const saveHydrationLogs = (userId: string, logs: HydrationLog[]): Promise<void> => genericSave<HydrationLog>(userId, 'wellness_hydration_logs', logs);

export const getHydrationGoal = (userId: string, defaultGoal: HydrationGoal): Promise<HydrationGoal> => genericGetGoal<HydrationGoal>(userId, 'wellness_hydration_goal', defaultGoal);
export const saveHydrationGoal = (userId: string, goal: HydrationGoal): Promise<void> => genericSaveGoal<HydrationGoal>(userId, 'wellness_hydration_goal', goal);

// --- Mood Service ---
export const getMoodLogs = (userId: string): Promise<MoodLog[]> => genericGet<MoodLog>(userId, 'wellness_mood_logs');
export const saveMoodLogs = (userId: string, logs: MoodLog[]): Promise<void> => genericSave<MoodLog>(userId, 'wellness_mood_logs', logs);


// --- Wellness Resources Service (Global, not user-specific) ---
export const getWellnessResources = async (): Promise<WellnessResource[]> => {
    // Mock data for local version
    return Promise.resolve([
        { id: 'res1', title: 'Understanding Blood Pressure', category: 'Vitals', summary: 'Learn what the numbers mean and how to maintain a healthy BP.'},
        { id: 'res2', title: 'Benefits of Daily Activity', category: 'Activity', summary: 'Discover how even small amounts of daily exercise can improve your health.'},
        { id: 'res3', title: 'The Importance of Hydration', category: 'Hydration', summary: 'Why drinking enough water is crucial for your body and mind.'}
    ]);
};