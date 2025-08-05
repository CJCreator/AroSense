// Re-export all types from main types file and Phase 1 types
export * from '../types';
export * from './phase1Types';

// Additional Phase 1 integration types
export interface UserProfile {
  id: string;
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
  created_at: string;
  updated_at: string;
}

// Medical condition from Phase 1 schema
export interface MedicalCondition {
  id: string;
  user_id: string;
  family_member_id?: string;
  condition_name: string;
  condition_type: 'chronic' | 'acute' | 'allergy' | 'medication_allergy';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  diagnosed_date?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Appointment from Phase 1 schema
export interface Appointment {
  id: string;
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
  created_at: string;
  updated_at: string;
}