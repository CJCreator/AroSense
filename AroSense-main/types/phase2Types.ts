// =============================================
// AroSense Phase 2: Specialized Health Modules Types
// =============================================

import { BaseEntity } from './phase1Types';

// =============================================
// WOMEN'S HEALTH TYPES
// =============================================

export interface MenstrualCycle extends BaseEntity {
  user_id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  flow_intensity?: 'light' | 'moderate' | 'heavy';
  notes?: string;
}

export interface FertilityWindow extends BaseEntity {
  user_id: string;
  cycle_id: string;
  fertile_start: string;
  fertile_end: string;
  ovulation_date?: string;
  is_predicted: boolean;
}

export interface SymptomsDiary extends BaseEntity {
  user_id: string;
  log_date: string;
  symptoms: string[];
  mood?: string;
  energy_level?: number; // 1-5 scale
  notes?: string;
}

export interface ScreeningReminder extends BaseEntity {
  user_id: string;
  screening_type: string;
  last_screening_date?: string;
  next_due_date?: string;
  frequency_months: number;
  is_completed: boolean;
  reminder_sent: boolean;
  notes?: string;
}

// =============================================
// PREGNANCY TYPES
// =============================================

export interface PregnancyProfile extends BaseEntity {
  user_id: string;
  last_menstrual_period: string;
  estimated_due_date: string;
  conception_date?: string;
  current_week?: number;
  is_active: boolean;
  pregnancy_notes?: string;
}

export interface PrenatalAppointment extends BaseEntity {
  user_id: string;
  pregnancy_id: string;
  appointment_date: string;
  doctor_name?: string;
  clinic_name?: string;
  appointment_type?: string;
  weight_kg?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  fundal_height_cm?: number;
  fetal_heart_rate_bpm?: number;
  notes?: string;
  next_appointment_date?: string;
}

export interface PregnancySymptom extends BaseEntity {
  user_id: string;
  pregnancy_id: string;
  log_date: string;
  week_number?: number;
  symptoms: string[];
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface KickCount extends BaseEntity {
  user_id: string;
  pregnancy_id: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  kick_count: number;
  duration_minutes?: number;
  notes?: string;
}

// =============================================
// BABY CARE TYPES
// =============================================

export interface VaccinationSchedule extends BaseEntity {
  user_id: string;
  child_id: string;
  vaccine_name: string;
  due_date: string;
  administered_date?: string;
  administered_by?: string;
  batch_number?: string;
  is_completed: boolean;
  notes?: string;
}

export interface PediatricAppointment extends BaseEntity {
  user_id: string;
  child_id: string;
  appointment_date: string;
  doctor_name?: string;
  clinic_name?: string;
  appointment_type?: string;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  notes?: string;
  next_appointment_date?: string;
}

// =============================================
// INPUT TYPES
// =============================================

export type MenstrualCycleInput = Omit<MenstrualCycle, 'id' | 'created_at' | 'updated_at'>;
export type FertilityWindowInput = Omit<FertilityWindow, 'id' | 'created_at' | 'updated_at'>;
export type SymptomsDiaryInput = Omit<SymptomsDiary, 'id' | 'created_at' | 'updated_at'>;
export type ScreeningReminderInput = Omit<ScreeningReminder, 'id' | 'created_at' | 'updated_at' | 'reminder_sent'>;
export type PregnancyProfileInput = Omit<PregnancyProfile, 'id' | 'created_at' | 'updated_at'>;
export type PrenatalAppointmentInput = Omit<PrenatalAppointment, 'id' | 'created_at' | 'updated_at'>;
export type PregnancySymptomInput = Omit<PregnancySymptom, 'id' | 'created_at' | 'updated_at'>;
export type KickCountInput = Omit<KickCount, 'id' | 'created_at' | 'updated_at'>;
export type VaccinationScheduleInput = Omit<VaccinationSchedule, 'id' | 'created_at' | 'updated_at'>;
export type PediatricAppointmentInput = Omit<PediatricAppointment, 'id' | 'created_at' | 'updated_at'>;

// =============================================
// CONSTANTS
// =============================================

export const COMMON_SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Mood Swings', 'Fatigue', 
  'Tender Breasts', 'Acne', 'Nausea', 'Dizziness', 'Backache'
];

export const PREGNANCY_SYMPTOMS = [
  'Nausea', 'Vomiting', 'Fatigue', 'Breast Tenderness', 'Frequent Urination',
  'Food Cravings', 'Food Aversions', 'Mood Swings', 'Heartburn', 'Constipation'
];

export const SCREENING_TYPES = [
  'Pap Smear', 'Mammogram', 'HPV Test', 'Bone Density Scan',
  'Pelvic Exam', 'Breast Exam', 'Well-Woman Visit'
];

export const VACCINE_SCHEDULE = [
  { name: 'BCG', due_weeks: 0 },
  { name: 'Hepatitis B', due_weeks: 0 },
  { name: 'DTaP', due_weeks: 6 },
  { name: 'IPV', due_weeks: 6 },
  { name: 'Hib', due_weeks: 6 },
  { name: 'PCV', due_weeks: 6 },
  { name: 'MMR', due_weeks: 36 }
];