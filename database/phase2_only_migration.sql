-- =============================================
-- AroSense Phase 2 Only Migration
-- Run this if Phase 1 tables already exist
-- =============================================

-- Women's Health Tables
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

-- Pregnancy Tables
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

-- Baby Care Tables
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

-- Enable RLS
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertility_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prenatal_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE kick_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pediatric_appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
    -- Women's Health Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menstrual_cycles' AND policyname = 'Users can manage own menstrual cycles') THEN
        CREATE POLICY "Users can manage own menstrual cycles" ON menstrual_cycles FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fertility_windows' AND policyname = 'Users can manage own fertility windows') THEN
        CREATE POLICY "Users can manage own fertility windows" ON fertility_windows FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'symptoms_diary' AND policyname = 'Users can manage own symptoms diary') THEN
        CREATE POLICY "Users can manage own symptoms diary" ON symptoms_diary FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'screening_reminders' AND policyname = 'Users can manage own screening reminders') THEN
        CREATE POLICY "Users can manage own screening reminders" ON screening_reminders FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- Pregnancy Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pregnancy_profiles' AND policyname = 'Users can manage own pregnancy profiles') THEN
        CREATE POLICY "Users can manage own pregnancy profiles" ON pregnancy_profiles FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prenatal_appointments' AND policyname = 'Users can manage own prenatal appointments') THEN
        CREATE POLICY "Users can manage own prenatal appointments" ON prenatal_appointments FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pregnancy_symptoms' AND policyname = 'Users can manage own pregnancy symptoms') THEN
        CREATE POLICY "Users can manage own pregnancy symptoms" ON pregnancy_symptoms FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kick_counts' AND policyname = 'Users can manage own kick counts') THEN
        CREATE POLICY "Users can manage own kick counts" ON kick_counts FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- Baby Care Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vaccination_schedules' AND policyname = 'Users can manage own vaccination schedules') THEN
        CREATE POLICY "Users can manage own vaccination schedules" ON vaccination_schedules FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pediatric_appointments' AND policyname = 'Users can manage own pediatric appointments') THEN
        CREATE POLICY "Users can manage own pediatric appointments" ON pediatric_appointments FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Triggers (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at_column') THEN
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
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Phase 2 migration completed successfully!';
END $$;