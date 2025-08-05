-- =============================================
-- AroSense Phase 1: Core Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USER PROFILES & FAMILY MANAGEMENT
-- =============================================

-- Enhanced user profiles with emergency info
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    height_cm DECIMAL(5,2),
    phone_number TEXT,
    address JSONB,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members (children, spouse, parents)
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL CHECK (relationship IN ('child', 'spouse', 'parent', 'sibling', 'other')),
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    height_cm DECIMAL(5,2),
    medical_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. MEDICAL DATA TABLES
-- =============================================

-- Medical conditions and allergies
CREATE TABLE IF NOT EXISTS medical_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    condition_name TEXT NOT NULL,
    condition_type TEXT CHECK (condition_type IN ('chronic', 'acute', 'allergy', 'medication_allergy')),
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    diagnosed_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription tracking
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    prescribing_doctor TEXT,
    pharmacy TEXT,
    start_date DATE,
    end_date DATE,
    refills_remaining INTEGER DEFAULT 0,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document storage metadata
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT CHECK (document_type IN ('lab_report', 'insurance_card', 'referral', 'prescription', 'vaccination_record', 'other')),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[],
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    appointment_type TEXT NOT NULL,
    doctor_name TEXT,
    clinic_name TEXT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    notes TEXT,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. WELLNESS TRACKING TABLES
-- =============================================

-- Vitals tracking (BP, heart rate, glucose)
CREATE TABLE IF NOT EXISTS vitals_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    vital_type TEXT NOT NULL CHECK (vital_type IN ('blood_pressure', 'heart_rate', 'blood_glucose', 'temperature', 'oxygen_saturation')),
    value_numeric DECIMAL(10,2),
    value_text TEXT,
    systolic INTEGER, -- for blood pressure
    diastolic INTEGER, -- for blood pressure
    unit TEXT,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight and BMI tracking
CREATE TABLE IF NOT EXISTS weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(4,1),
    body_fat_percentage DECIMAL(4,1),
    muscle_mass_kg DECIMAL(5,2),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity tracking
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    distance_km DECIMAL(6,2),
    steps INTEGER,
    intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')),
    activity_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- General wellness logs (hydration, sleep, mood)
CREATE TABLE IF NOT EXISTS wellness_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL CHECK (log_type IN ('hydration', 'sleep', 'mood', 'stress', 'energy')),
    value_numeric DECIMAL(10,2),
    value_text TEXT,
    scale_rating INTEGER CHECK (scale_rating BETWEEN 1 AND 10),
    log_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

-- User-based indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_id ON medical_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Time-based indexes for logs
CREATE INDEX IF NOT EXISTS idx_vitals_logs_user_measured ON vitals_logs(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_measured ON weight_logs(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_logs_user_date ON wellness_logs(user_id, log_date DESC);

-- Family member indexes
CREATE INDEX IF NOT EXISTS idx_vitals_logs_family_member ON vitals_logs(family_member_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_family_member ON weight_logs(family_member_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_family_member ON activity_logs(family_member_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_logs_family_member ON wellness_logs(family_member_id, log_date DESC);

-- Appointment status and date indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, appointment_date);

-- Conditional index for prescriptions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prescriptions' AND table_schema = 'public') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'is_active' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(user_id, is_active) WHERE is_active = TRUE;
        END IF;
    END IF;
END $$;

-- =============================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_conditions_updated_at BEFORE UPDATE ON medical_conditions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vitals_logs_updated_at BEFORE UPDATE ON vitals_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weight_logs_updated_at BEFORE UPDATE ON weight_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_logs_updated_at BEFORE UPDATE ON activity_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wellness_logs_updated_at BEFORE UPDATE ON wellness_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();