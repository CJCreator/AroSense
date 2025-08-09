import { supabase } from '../src/integrations/supabase/client';
import { validateUserId } from '../utils/securityUtils';

// Pregnancy Profile
export const getPregnancyProfile = async (userId: string) => {
    if (!validateUserId(userId)) return null;
    
    const { data, error } = await supabase
        .from('pregnancy_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

export const createPregnancyProfile = async (userId: string, profileData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('pregnancy_profiles')
        .insert({ ...profileData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Pregnancy Symptoms
export const getPregnancySymptoms = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('pregnancy_symptoms')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const addPregnancySymptom = async (userId: string, symptomData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('pregnancy_symptoms')
        .insert({ ...symptomData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Kick Count Sessions
export const getKickCountSessions = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('kick_count_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const addKickCountSession = async (userId: string, sessionData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('kick_count_sessions')
        .insert({ ...sessionData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Prenatal Appointments
export const getPrenatalAppointments = async (userId: string) => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('prenatal_appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
};

export const addPrenatalAppointment = async (userId: string, appointmentData: any) => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { data, error } = await supabase
        .from('prenatal_appointments')
        .insert({ ...appointmentData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};