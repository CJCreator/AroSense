import { supabase } from '../src/integrations/supabase/client';
import { 
  MenstrualCycle, MenstrualCycleInput,
  FertilityWindow, FertilityWindowInput,
  SymptomsDiary, SymptomsDiaryInput,
  ScreeningReminder, ScreeningReminderInput
} from '../types/phase2Types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// =============================================
// MENSTRUAL CYCLE TRACKING
// =============================================

export const getMenstrualCycles = async (userId: string): Promise<MenstrualCycle[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', validatedUserId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get menstrual cycles:', sanitizeForLog(error));
    throw new Error('Failed to get menstrual cycles');
  }
};

export const addMenstrualCycle = async (userId: string, cycleData: MenstrualCycleInput): Promise<MenstrualCycle> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .insert({ ...cycleData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add menstrual cycle:', sanitizeForLog(error));
    throw new Error('Failed to add menstrual cycle');
  }
};

export const updateMenstrualCycle = async (userId: string, cycleId: string, cycleData: Partial<MenstrualCycleInput>): Promise<MenstrualCycle> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedCycleId = validateId(cycleId);
    
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .update(cycleData)
      .eq('id', validatedCycleId)
      .eq('user_id', validatedUserId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No menstrual cycle found to update');
    return data;
  } catch (error) {
    console.error('Failed to update menstrual cycle:', sanitizeForLog(error));
    throw new Error('Failed to update menstrual cycle');
  }
};

// =============================================
// FERTILITY TRACKING
// =============================================

export const getFertilityWindows = async (userId: string): Promise<FertilityWindow[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('fertility_windows')
      .select('*')
      .eq('user_id', validatedUserId)
      .order('fertile_start', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get fertility windows:', sanitizeForLog(error));
    throw new Error('Failed to get fertility windows');
  }
};

export const addFertilityWindow = async (userId: string, windowData: FertilityWindowInput): Promise<FertilityWindow> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('fertility_windows')
      .insert({ ...windowData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add fertility window:', sanitizeForLog(error));
    throw new Error('Failed to add fertility window');
  }
};

// =============================================
// SYMPTOMS DIARY
// =============================================

export const getSymptomsDiary = async (userId: string, startDate?: string, endDate?: string): Promise<SymptomsDiary[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    let query = supabase
      .from('symptoms_diary')
      .select('*')
      .eq('user_id', validatedUserId);
    
    if (startDate) query = query.gte('log_date', startDate);
    if (endDate) query = query.lte('log_date', endDate);
    
    const { data, error } = await query.order('log_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get symptoms diary:', sanitizeForLog(error));
    throw new Error('Failed to get symptoms diary');
  }
};

export const addSymptomsDiary = async (userId: string, symptomData: SymptomsDiaryInput): Promise<SymptomsDiary> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('symptoms_diary')
      .insert({ ...symptomData, user_id: validatedUserId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add symptoms diary:', sanitizeForLog(error));
    throw new Error('Failed to add symptoms diary');
  }
};

// =============================================
// SCREENING REMINDERS
// =============================================

export const getScreeningReminders = async (userId: string): Promise<ScreeningReminder[]> => {
  try {
    const validatedUserId = validateUserId(userId);
    
    const { data, error } = await supabase
      .from('screening_reminders')
      .select('*')
      .eq('user_id', validatedUserId)
      .order('next_due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get screening reminders:', sanitizeForLog(error));
    throw new Error('Failed to get screening reminders');
  }
};

export const addScreeningReminder = async (userId: string, reminderData: ScreeningReminderInput): Promise<ScreeningReminder> => {
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

export const updateScreeningReminder = async (userId: string, reminderId: string, reminderData: Partial<ScreeningReminderInput>): Promise<ScreeningReminder> => {
  try {
    const validatedUserId = validateUserId(userId);
    const validatedReminderId = validateId(reminderId);
    
    const { data, error } = await supabase
      .from('screening_reminders')
      .update(reminderData)
      .eq('id', validatedReminderId)
      .eq('user_id', validatedUserId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No screening reminder found to update');
    return data;
  } catch (error) {
    console.error('Failed to update screening reminder:', sanitizeForLog(error));
    throw new Error('Failed to update screening reminder');
  }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const predictNextPeriod = (cycles: MenstrualCycle[]): { predictedStart: string; averageCycle: number } | null => {
  if (cycles.length < 2) return null;
  
  const completedCycles = cycles.filter(c => c.cycle_length);
  if (completedCycles.length === 0) return null;
  
  const averageCycle = Math.round(
    completedCycles.reduce((sum, c) => sum + (c.cycle_length || 0), 0) / completedCycles.length
  );
  
  const lastCycle = cycles[0];
  const predictedStart = new Date(lastCycle.start_date);
  predictedStart.setDate(predictedStart.getDate() + averageCycle);
  
  return {
    predictedStart: predictedStart.toISOString().split('T')[0],
    averageCycle
  };
};

export const calculateFertileWindow = (lastPeriodStart: string, cycleLength: number = 28): FertilityWindowInput => {
  const startDate = new Date(lastPeriodStart);
  const ovulationDay = cycleLength - 14;
  
  const ovulationDate = new Date(startDate);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
  
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  return {
    user_id: '',
    cycle_id: '',
    fertile_start: fertileStart.toISOString().split('T')[0],
    fertile_end: fertileEnd.toISOString().split('T')[0],
    ovulation_date: ovulationDate.toISOString().split('T')[0],
    is_predicted: true
  };
};