import { supabase } from '../src/integrations/supabase/client';
import { 
  PregnancyProfile, PregnancyProfileInput,
  PrenatalAppointment, PrenatalAppointmentInput,
  PregnancySymptom, PregnancySymptomInput,
  KickCount, KickCountInput
} from '../types/phase2Types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// =============================================
// PREGNANCY PROFILE MANAGEMENT
// =============================================

export const getPregnancyProfiles = async (userId: string): Promise<PregnancyProfile[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .select('*')
      .eq('user_id', validatedUserId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get pregnancy profiles:', sanitizeForLog(error));
    throw new Error('Failed to get pregnancy profiles');
  }
};

export const getActivePregnancy = async (userId: string): Promise<PregnancyProfile | null> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .select('*')
      .eq('user_id', validatedUserId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Failed to get active pregnancy:', sanitizeForLog(error));
    throw new Error('Failed to get active pregnancy');
  }
};

export const createPregnancyProfile = async (userId: string, profileData: PregnancyProfileInput): Promise<PregnancyProfile> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    // Calculate current week
    const lmpDate = new Date(profileData.last_menstrual_period);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(daysDiff / 7);
    
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .insert({ 
        ...profileData, 
        user_id: validatedUserId,
        current_week: currentWeek
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create pregnancy profile:', sanitizeForLog(error));
    throw new Error('Failed to create pregnancy profile');
  }
};

export const updatePregnancyProfile = async (userId: string, profileId: string, profileData: Partial<PregnancyProfileInput>): Promise<PregnancyProfile> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedProfileId = validateId(profileId);
    
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .update(profileData)
      .eq('id', validatedProfileId)
      .eq('user_id', validatedUserId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No pregnancy profile found to update');
    return data;
  } catch (error) {
    console.error('Failed to update pregnancy profile:', sanitizeForLog(error));
    throw new Error('Failed to update pregnancy profile');
  }
};

// =============================================
// PRENATAL APPOINTMENTS
// =============================================

export const getPrenatalAppointments = async (userId: string, pregnancyId?: string): Promise<PrenatalAppointment[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('prenatal_appointments')
      .select('*')
      .eq('user_id', validatedUserId);
    
    if (pregnancyId) {
      const validatedPregnancyId = validateId(pregnancyId);
      query = query.eq('pregnancy_id', validatedPregnancyId);
    }
    
    const { data, error } = await query.order('appointment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get prenatal appointments:', sanitizeForLog(error));
    throw new Error('Failed to get prenatal appointments');
  }
};

export const addPrenatalAppointment = async (userId: string, appointmentData: PrenatalAppointmentInput): Promise<PrenatalAppointment> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('prenatal_appointments')
      .insert({ ...appointmentData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add prenatal appointment:', sanitizeForLog(error));
    throw new Error('Failed to add prenatal appointment');
  }
};

// =============================================
// PREGNANCY SYMPTOMS
// =============================================

export const getPregnancySymptoms = async (userId: string, pregnancyId?: string): Promise<PregnancySymptom[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('pregnancy_symptoms')
      .select('*')
      .eq('user_id', validatedUserId);
    
    if (pregnancyId) {
      const validatedPregnancyId = validateId(pregnancyId);
      query = query.eq('pregnancy_id', validatedPregnancyId);
    }
    
    const { data, error } = await query.order('log_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get pregnancy symptoms:', sanitizeForLog(error));
    throw new Error('Failed to get pregnancy symptoms');
  }
};

export const addPregnancySymptom = async (userId: string, symptomData: PregnancySymptomInput): Promise<PregnancySymptom> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('pregnancy_symptoms')
      .insert({ ...symptomData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add pregnancy symptom:', sanitizeForLog(error));
    throw new Error('Failed to add pregnancy symptom');
  }
};

// =============================================
// KICK COUNTS
// =============================================

export const getKickCounts = async (userId: string, pregnancyId?: string): Promise<KickCount[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('kick_counts')
      .select('*')
      .eq('user_id', validatedUserId);
    
    if (pregnancyId) {
      const validatedPregnancyId = validateId(pregnancyId);
      query = query.eq('pregnancy_id', validatedPregnancyId);
    }
    
    const { data, error } = await query.order('session_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get kick counts:', sanitizeForLog(error));
    throw new Error('Failed to get kick counts');
  }
};

export const addKickCount = async (userId: string, kickData: KickCountInput): Promise<KickCount> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    // Calculate duration if end_time is provided
    let duration_minutes;
    if (kickData.end_time) {
      const start = new Date(`2000-01-01T${kickData.start_time}`);
      const end = new Date(`2000-01-01T${kickData.end_time}`);
      duration_minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }
    
    const { data, error } = await supabase
      .from('kick_counts')
      .insert({ 
        ...kickData, 
        user_id: validatedUserId,
        duration_minutes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add kick count:', sanitizeForLog(error));
    throw new Error('Failed to add kick count');
  }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const calculatePregnancyWeek = (lmpDate: string): number => {
  const lmp = new Date(lmpDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7);
};

export const calculateDueDate = (lmpDate: string): string => {
  const lmp = new Date(lmpDate);
  lmp.setDate(lmp.getDate() + 280); // 40 weeks
  return lmp.toISOString().split('T')[0];
};

export const getPregnancyMilestones = (currentWeek: number): Array<{week: number, milestone: string}> => {
  const milestones = [
    { week: 4, milestone: 'Heart begins to beat' },
    { week: 8, milestone: 'All major organs formed' },
    { week: 12, milestone: 'End of first trimester' },
    { week: 16, milestone: 'You might feel first movements' },
    { week: 20, milestone: 'Anatomy scan - halfway point!' },
    { week: 24, milestone: 'Viability milestone reached' },
    { week: 28, milestone: 'Third trimester begins' },
    { week: 32, milestone: 'Rapid brain development' },
    { week: 36, milestone: 'Baby is considered full-term soon' },
    { week: 40, milestone: 'Due date!' }
  ];
  
  return milestones.filter(m => m.week <= currentWeek + 4 && m.week >= currentWeek - 2);
};