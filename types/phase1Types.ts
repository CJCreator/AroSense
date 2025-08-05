// =============================================
// AroSense Phase 1: TypeScript Type Definitions
// =============================================

// Base interface for all database entities
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// USER PROFILES & FAMILY MANAGEMENT
// =============================================

export interface Profile extends BaseEntity {
  user_id: string;
  email?: string;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height_cm?: number;
  phone_number?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_notes?: string;
}

export interface FamilyMember extends BaseEntity {
  user_id: string;
  name: string;
  relationship: 'child' | 'spouse' | 'parent' | 'sibling' | 'other';
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height_cm?: number;
  medical_notes?: string;
  is_active: boolean;
}

export interface EmergencyContact extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
}

// =============================================
// MEDICAL DATA
// =============================================

export interface MedicalCondition extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  condition_name: string;
  condition_type: 'chronic' | 'acute' | 'allergy' | 'medication_allergy';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  diagnosed_date?: string;
  notes?: string;
  is_active: boolean;
}

export interface Prescription extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribing_doctor?: string;
  pharmacy?: string;
  start_date?: string;
  end_date?: string;
  refills_remaining: number;
  instructions?: string;
  is_active: boolean;
}

export interface Document extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  title: string;
  document_type: 'lab_report' | 'insurance_card' | 'referral' | 'prescription' | 'vaccination_record' | 'other';
  file_path: string;
  file_size?: number;
  mime_type?: string;
  upload_date: string;
  tags?: string[];
  is_encrypted: boolean;
}

export interface Appointment extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  appointment_type: string;
  doctor_name?: string;
  clinic_name?: string;
  appointment_date: string;
  duration_minutes: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reminder_sent: boolean;
}

// =============================================
// WELLNESS TRACKING
// =============================================

export interface VitalsLog extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  vital_type: 'blood_pressure' | 'heart_rate' | 'blood_glucose' | 'temperature' | 'oxygen_saturation';
  value_numeric?: number;
  value_text?: string;
  systolic?: number; // for blood pressure
  diastolic?: number; // for blood pressure
  unit?: string;
  measured_at: string;
  notes?: string;
}

export interface WeightLog extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  weight_kg: number;
  bmi?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  measured_at: string;
  notes?: string;
}

export interface ActivityLog extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  activity_type: string;
  duration_minutes?: number;
  calories_burned?: number;
  distance_km?: number;
  steps?: number;
  intensity?: 'low' | 'moderate' | 'high';
  activity_date: string;
  notes?: string;
}

export interface WellnessLog extends BaseEntity {
  user_id: string;
  family_member_id?: string;
  log_type: 'hydration' | 'sleep' | 'mood' | 'stress' | 'energy';
  value_numeric?: number;
  value_text?: string;
  scale_rating?: number; // 1-10 scale
  log_date: string;
  notes?: string;
}

// =============================================
// API REQUEST/RESPONSE TYPES
// =============================================

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter and sort options
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  familyMemberId?: string;
}

// =============================================
// FORM INPUT TYPES
// =============================================

export type ProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type FamilyMemberInput = Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>;
export type EmergencyContactInput = Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>;
export type MedicalConditionInput = Omit<MedicalCondition, 'id' | 'created_at' | 'updated_at'>;
export type PrescriptionInput = Omit<Prescription, 'id' | 'created_at' | 'updated_at'>;
export type DocumentInput = Omit<Document, 'id' | 'created_at' | 'updated_at' | 'upload_date'>;
export type AppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'reminder_sent'>;
export type VitalsLogInput = Omit<VitalsLog, 'id' | 'created_at' | 'updated_at'>;
export type WeightLogInput = Omit<WeightLog, 'id' | 'created_at' | 'updated_at'>;
export type ActivityLogInput = Omit<ActivityLog, 'id' | 'created_at' | 'updated_at'>;
export type WellnessLogInput = Omit<WellnessLog, 'id' | 'created_at' | 'updated_at'>;

// =============================================
// DASHBOARD & ANALYTICS TYPES
// =============================================

export interface DashboardStats {
  totalFamilyMembers: number;
  upcomingAppointments: number;
  activePrescriptions: number;
  recentVitals: number;
  weeklyActivity: {
    date: string;
    value: number;
  }[];
  healthScore: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface HealthMetrics {
  vitals: {
    bloodPressure: TrendData[];
    heartRate: TrendData[];
    weight: TrendData[];
  };
  activity: {
    steps: TrendData[];
    calories: TrendData[];
    duration: TrendData[];
  };
  wellness: {
    sleep: TrendData[];
    mood: TrendData[];
    hydration: TrendData[];
  };
}