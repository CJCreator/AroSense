import {
    FeedingLogEntry, DiaperLogEntry, BabySleepLogEntry, GrowthRecordEntry, MilestoneEntry,
    VaccinationEntry, FoodLogEntry
} from '../types.ts';


const getLocalStorageKey = (userId: string, childId: string, dataType: string): string => {
    return `${userId}_${childId}_${dataType}`;
};

const genericGet = async <T>(userId: string, childId: string, tableName: string): Promise<T[]> => {
    const key = getLocalStorageKey(userId, childId, tableName);
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return [];
    }
};

const genericSave = async <T>(userId: string, childId: string, tableName: string, items: T[]): Promise<void> => {
    const key = getLocalStorageKey(userId, childId, tableName);
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error);
        throw new Error(`Failed to save data for ${tableName}.`);
    }
};


// --- Feeding Logs ---
export const getFeedingLogs = (userId: string, childId: string): Promise<FeedingLogEntry[]> => genericGet<FeedingLogEntry>(userId, childId, 'baby_feeding_logs');
export const saveFeedingLogs = (userId: string, childId: string, logs: FeedingLogEntry[]): Promise<void> => genericSave<FeedingLogEntry>(userId, childId, 'baby_feeding_logs', logs);

// --- Diaper Logs ---
export const getDiaperLogs = (userId: string, childId: string): Promise<DiaperLogEntry[]> => genericGet<DiaperLogEntry>(userId, childId, 'baby_diaper_logs');
export const saveDiaperLogs = (userId: string, childId: string, logs: DiaperLogEntry[]): Promise<void> => genericSave<DiaperLogEntry>(userId, childId, 'baby_diaper_logs', logs);

// --- Baby Sleep Logs ---
export const getBabySleepLogs = (userId: string, childId: string): Promise<BabySleepLogEntry[]> => genericGet<BabySleepLogEntry>(userId, childId, 'baby_sleep_logs');
export const saveBabySleepLogs = (userId: string, childId: string, logs: BabySleepLogEntry[]): Promise<void> => genericSave<BabySleepLogEntry>(userId, childId, 'baby_sleep_logs', logs);

// --- Growth Records ---
export const getGrowthRecords = (userId: string, childId: string): Promise<GrowthRecordEntry[]> => genericGet<GrowthRecordEntry>(userId, childId, 'baby_growth_records');
export const saveGrowthRecords = (userId: string, childId: string, records: GrowthRecordEntry[]): Promise<void> => genericSave<GrowthRecordEntry>(userId, childId, 'baby_growth_records', records);

// --- Milestones ---
export const getMilestones = (userId: string, childId: string): Promise<MilestoneEntry[]> => genericGet<MilestoneEntry>(userId, childId, 'baby_milestones');
export const saveMilestones = (userId: string, childId: string, milestones: MilestoneEntry[]): Promise<void> => genericSave<MilestoneEntry>(userId, childId, 'baby_milestones', milestones);

// --- Vaccinations ---
export const getVaccinations = (userId: string, childId: string): Promise<VaccinationEntry[]> => genericGet<VaccinationEntry>(userId, childId, 'baby_vaccinations');
export const saveVaccinations = (userId: string, childId: string, vaccinations: VaccinationEntry[]): Promise<void> => genericSave<VaccinationEntry>(userId, childId, 'baby_vaccinations', vaccinations);

// --- Food Logs (Baby Nutrition) ---
export const getFoodLogs = (userId: string, childId: string): Promise<FoodLogEntry[]> => genericGet<FoodLogEntry>(userId, childId, 'baby_food_logs');
export const saveFoodLogs = (userId: string, childId: string, logs: FoodLogEntry[]): Promise<void> => genericSave<FoodLogEntry>(userId, childId, 'baby_food_logs', logs);