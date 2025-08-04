import {
    PregnancyProfile, PregnancySymptomEntry, WeightLogEntry, BloodPressureLogEntry,
    KickCountSession, PrenatalAppointment
} from '../types';

// A generic helper to reduce repetition, assuming no childId is needed here.
const getLocalStorageKey = (userId: string, dataType: string): string => {
    // Using a consistent key structure across services
    return `${userId}_pregnancy_${dataType}`;
};

const genericGet = async <T>(userId: string, dataType: string, defaultValue: T[] = []): Promise<T[]> => {
    if (!userId) return defaultValue;
    const key = getLocalStorageKey(userId, dataType);
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

const genericSave = async <T>(userId: string, dataType: string, items: T[]): Promise<void> => {
    if (!userId) return;
    const key = getLocalStorageKey(userId, dataType);
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error);
        throw new Error(`Failed to save data for ${dataType}.`);
    }
};

// --- Profile ---
export const getPregnancyProfile = async (userId: string): Promise<PregnancyProfile | null> => {
    const key = getLocalStorageKey(userId, 'profile');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};
export const savePregnancyProfile = async (userId: string, profile: PregnancyProfile): Promise<void> => {
    const key = getLocalStorageKey(userId, 'profile');
    localStorage.setItem(key, JSON.stringify(profile));
};

// --- Log Entries (using the generic helpers) ---
export const getSymptomLogs = (userId: string): Promise<PregnancySymptomEntry[]> => genericGet<PregnancySymptomEntry>(userId, 'symptomsLog');
export const saveSymptomLogs = (userId: string, logs: PregnancySymptomEntry[]): Promise<void> => genericSave<PregnancySymptomEntry>(userId, 'symptomsLog', logs);

export const getWeightLogs = (userId: string): Promise<WeightLogEntry[]> => genericGet<WeightLogEntry>(userId, 'weightLogs');
export const saveWeightLogs = (userId: string, logs: WeightLogEntry[]): Promise<void> => genericSave<WeightLogEntry>(userId, 'weightLogs', logs);

export const getBloodPressureLogs = (userId: string): Promise<BloodPressureLogEntry[]> => genericGet<BloodPressureLogEntry>(userId, 'bpLogs');
export const saveBloodPressureLogs = (userId: string, logs: BloodPressureLogEntry[]): Promise<void> => genericSave<BloodPressureLogEntry>(userId, 'bpLogs', logs);

export const getKickSessions = (userId: string): Promise<KickCountSession[]> => genericGet<KickCountSession>(userId, 'kickSessions');
export const saveKickSessions = (userId: string, sessions: KickCountSession[]): Promise<void> => genericSave<KickCountSession>(userId, 'kickSessions', sessions);

export const getAppointments = (userId: string): Promise<PrenatalAppointment[]> => genericGet<PrenatalAppointment>(userId, 'appointments');
export const saveAppointments = (userId: string, appointments: PrenatalAppointment[]): Promise<void> => genericSave<PrenatalAppointment>(userId, 'appointments', appointments);