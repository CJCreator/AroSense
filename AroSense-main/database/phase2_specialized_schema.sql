-- =============================================
-- AroSense Phase 2: Specialized Health Modules Schema
-- =============================================

-- =============================================
-- 1. WOMEN'S HEALTH MODULE
-- =============================================

-- Menstrual cycle tracking
CREATE TABLE IF NOT EXISTS menstrual_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    flow_intensity TEXT CHECK (flow_intensity IN ('light', 'moderate', 'heavy')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fertility window predictions
CREATE TABLE IF NOT EXISTS fertility_windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES menstrual_cycles(id) ON DELETE CASCADE,
    fertile_start DATE NOT NULL,
    fertile_end DATE NOT NULL,
    ovulation_date DATE,
    is_predicted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily symptom tracking
CREATE TABLE IF NOT EXISTS symptoms_diary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    symptoms TEXT[],
    mood TEXT,
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screening reminders
CREATE TABLE IF NOT EXISTS screening_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    screening_type TEXT NOT NULL,
    last_screening_date DATE,
    next_due_date DATE,
    frequency_months INTEGER DEFAULT 12,
    is_completed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. PREGNANCY MODULE
-- =============================================

-- Pregnancy profiles
CREATE TABLE IF NOT EXISTS pregnancy_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_menstrual_period DATE NOT NULL,
    estimated_due_date DATE NOT NULL,
    conception_date DATE,
    current_week INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    pregnancy_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prenatal appointments
CREATE TABLE IF NOT EXISTS prenatal_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pregnancy_id UUID REFERENCES pregnancy_profiles(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    doctor_name TEXT,
    clinic_name TEXT,
    appointment_type TEXT,
    weight_kg DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    fundal_height_cm DECIMAL(4,1),
    fetal_heart_rate_bpm INTEGER,
    notes TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pregnancy symptoms tracking
CREATE TABLE IF NOT EXISTS pregnancy_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pregnancy_id UUID REFERENCES pregnancy_profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    week_number INTEGER,
    symptoms TEXT[],
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kick count tracking
CREATE TABLE IF NOT EXISTS kick_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pregnancy_id UUID REFERENCES pregnancy_profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    kick_count INTEGER NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. BABY CARE MODULE ENHANCEMENTS
-- =============================================

-- Vaccination schedules
CREATE TABLE IF NOT EXISTS vaccination_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    administered_date DATE,
    administered_by TEXT,
    batch_number TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pediatric appointments
CREATE TABLE IF NOT EXISTS pediatric_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    doctor_name TEXT,
    clinic_name TEXT,
    appointment_type TEXT,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    head_circumference_cm DECIMAL(4,1),
    notes TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

-- Women's Health indexes
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_date ON menstrual_cycles(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_fertility_windows_user_date ON fertility_windows(user_id, fertile_start DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms_diary_user_date ON symptoms_diary(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_screening_reminders_user_due ON screening_reminders(user_id, next_due_date);

-- Pregnancy indexes
CREATE INDEX IF NOT EXISTS idx_pregnancy_profiles_user_active ON pregnancy_profiles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_prenatal_appointments_user_date ON prenatal_appointments(user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_pregnancy_symptoms_user_date ON pregnancy_symptoms(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_kick_counts_user_date ON kick_counts(user_id, session_date DESC);

-- Baby Care indexes
CREATE INDEX IF NOT EXISTS idx_vaccination_schedules_child_due ON vaccination_schedules(child_id, due_date);
CREATE INDEX IF NOT EXISTS idx_pediatric_appointments_child_date ON pediatric_appointments(child_id, appointment_date);

-- =============================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_menstrual_cycles_updated_at BEFORE UPDATE ON menstrual_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fertility_windows_updated_at BEFORE UPDATE ON fertility_windows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_symptoms_diary_updated_at BEFORE UPDATE ON symptoms_diary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_screening_reminders_updated_at BEFORE UPDATE ON screening_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pregnancy_profiles_updated_at BEFORE UPDATE ON pregnancy_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prenatal_appointments_updated_at BEFORE UPDATE ON prenatal_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pregnancy_symptoms_updated_at BEFORE UPDATE ON pregnancy_symptoms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kick_counts_updated_at BEFORE UPDATE ON kick_counts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaccination_schedules_updated_at BEFORE UPDATE ON vaccination_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pediatric_appointments_updated_at BEFORE UPDATE ON pediatric_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();