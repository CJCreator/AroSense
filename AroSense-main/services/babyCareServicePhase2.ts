import { supabase } from '../src/integrations/supabase/client';
import { 
  VaccinationSchedule, VaccinationScheduleInput,
  PediatricAppointment, PediatricAppointmentInput,
  VACCINE_SCHEDULE
} from '../types/phase2Types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// =============================================
// VACCINATION MANAGEMENT
// =============================================

export const getVaccinationSchedule = async (userId: string, childId: string): Promise<VaccinationSchedule[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedChildId = validateId(childId);
    
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .select('*')
      .eq('user_id', validatedUserId)
      .eq('child_id', validatedChildId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get vaccination schedule:', sanitizeForLog(error));
    throw new Error('Failed to get vaccination schedule');
  }
};

export const addVaccination = async (userId: string, vaccinationData: VaccinationScheduleInput): Promise<VaccinationSchedule> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .insert({ ...vaccinationData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add vaccination:', sanitizeForLog(error));
    throw new Error('Failed to add vaccination');
  }
};

export const updateVaccination = async (userId: string, vaccinationId: string, vaccinationData: Partial<VaccinationScheduleInput>): Promise<VaccinationSchedule> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedVaccinationId = validateId(vaccinationId);
    
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .update(vaccinationData)
      .eq('id', validatedVaccinationId)
      .eq('user_id', validatedUserId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No vaccination found to update');
    return data;
  } catch (error) {
    console.error('Failed to update vaccination:', sanitizeForLog(error));
    throw new Error('Failed to update vaccination');
  }
};

export const markVaccinationComplete = async (userId: string, vaccinationId: string, administeredData: {
  administered_date: string;
  administered_by?: string;
  batch_number?: string;
  notes?: string;
}): Promise<VaccinationSchedule> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedVaccinationId = validateId(vaccinationId);
    
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .update({
        ...administeredData,
        is_completed: true
      })
      .eq('id', validatedVaccinationId)
      .eq('user_id', validatedUserId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No vaccination found to update');
    return data;
  } catch (error) {
    console.error('Failed to mark vaccination complete:', sanitizeForLog(error));
    throw new Error('Failed to mark vaccination complete');
  }
};

// =============================================
// PEDIATRIC APPOINTMENTS
// =============================================

export const getPediatricAppointments = async (userId: string, childId?: string): Promise<PediatricAppointment[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('pediatric_appointments')
      .select('*')
      .eq('user_id', validatedUserId);
    
    if (childId) {
      const validatedChildId = validateId(childId);
      query = query.eq('child_id', validatedChildId);
    }
    
    const { data, error } = await query.order('appointment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get pediatric appointments:', sanitizeForLog(error));
    throw new Error('Failed to get pediatric appointments');
  }
};

export const addPediatricAppointment = async (userId: string, appointmentData: PediatricAppointmentInput): Promise<PediatricAppointment> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('pediatric_appointments')
      .insert({ ...appointmentData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add pediatric appointment:', sanitizeForLog(error));
    throw new Error('Failed to add pediatric appointment');
  }
};

export const updatePediatricAppointment = async (userId: string, appointmentId: string, appointmentData: Partial<PediatricAppointmentInput>): Promise<PediatricAppointment> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedAppointmentId = validateId(appointmentId);
    
    const { data, error } = await supabase
      .from('pediatric_appointments')
      .update(appointmentData)
      .eq('id', validatedAppointmentId)
      .eq('user_id', validatedUserId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No pediatric appointment found to update');
    return data;
  } catch (error) {
    console.error('Failed to update pediatric appointment:', sanitizeForLog(error));
    throw new Error('Failed to update pediatric appointment');
  }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const generateVaccinationSchedule = async (userId: string, childId: string, birthDate: string): Promise<VaccinationSchedule[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedChildId = validateId(childId);
    
    const birth = new Date(birthDate);
    const scheduleData: VaccinationScheduleInput[] = VACCINE_SCHEDULE.map(vaccine => {
      const dueDate = new Date(birth);
      dueDate.setDate(dueDate.getDate() + (vaccine.due_weeks * 7));
      
      return {
        user_id: validatedUserId,
        child_id: validatedChildId,
        vaccine_name: vaccine.name,
        due_date: dueDate.toISOString().split('T')[0],
        is_completed: false
      };
    });
    
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .insert(scheduleData)
      .select();
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to generate vaccination schedule:', sanitizeForLog(error));
    throw new Error('Failed to generate vaccination schedule');
  }
};

export const getUpcomingVaccinations = async (userId: string, childId?: string): Promise<VaccinationSchedule[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('vaccination_schedules')
      .select('*')
      .eq('user_id', validatedUserId)
      .eq('is_completed', false)
      .gte('due_date', new Date().toISOString().split('T')[0]);
    
    if (childId) {
      const validatedChildId = validateId(childId);
      query = query.eq('child_id', validatedChildId);
    }
    
    const { data, error } = await query
      .order('due_date', { ascending: true })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get upcoming vaccinations:', sanitizeForLog(error));
    throw new Error('Failed to get upcoming vaccinations');
  }
};

export const getOverdueVaccinations = async (userId: string, childId?: string): Promise<VaccinationSchedule[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('vaccination_schedules')
      .select('*')
      .eq('user_id', validatedUserId)
      .eq('is_completed', false)
      .lt('due_date', new Date().toISOString().split('T')[0]);
    
    if (childId) {
      const validatedChildId = validateId(childId);
      query = query.eq('child_id', validatedChildId);
    }
    
    const { data, error } = await query.order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get overdue vaccinations:', sanitizeForLog(error));
    throw new Error('Failed to get overdue vaccinations');
  }
};

export const calculateGrowthPercentiles = (measurements: {weight_kg?: number, height_cm?: number, age_months: number, gender: 'male' | 'female'}): {
  weight_percentile?: number;
  height_percentile?: number;
} => {
  // Simplified percentile calculation - in production, use WHO growth charts
  const { weight_kg, height_cm, age_months, gender } = measurements;
  
  // Mock percentile calculation (replace with actual WHO chart data)
  const result: {weight_percentile?: number, height_percentile?: number} = {};
  
  if (weight_kg) {
    // Simplified calculation - replace with actual percentile charts
    result.weight_percentile = Math.min(95, Math.max(5, 50 + (Math.random() - 0.5) * 40));
  }
  
  if (height_cm) {
    // Simplified calculation - replace with actual percentile charts
    result.height_percentile = Math.min(95, Math.max(5, 50 + (Math.random() - 0.5) * 40));
  }
  
  return result;
};