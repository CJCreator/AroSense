-- AroSense Database Schema
-- This schema supports all features outlined in the README

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Family Members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    blood_type TEXT,
    allergies TEXT[],
    medical_conditions TEXT[],
    medications TEXT[],
    emergency_contacts JSONB,
    profile_image_url TEXT,
    relationship_to_user TEXT NOT NULL,
    primary_care_physician JSONB,
    insurance_info JSONB,
    emergency_notes TEXT,
    height_cm NUMERIC,
    birth_weight_kg NUMERIC,
    birth_height_cm NUMERIC,
    birth_head_circumference_cm NUMERIC,
    is_premature BOOLEAN DEFAULT FALSE,
    gestational_age_weeks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    prescribing_doctor TEXT NOT NULL,
    pharmacy TEXT,
    refill_date DATE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_url TEXT NOT NULL,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness tables
CREATE TABLE IF NOT EXISTS wellness_vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME,
    type TEXT NOT NULL,
    value JSONB NOT NULL,
    notes TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight NUMERIC NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    notes TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    custom_activity_type TEXT,
    duration_minutes INTEGER NOT NULL,
    effort_level TEXT,
    steps INTEGER,
    distance NUMERIC,
    distance_unit TEXT,
    notes TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bed_time TIME NOT NULL,
    wake_time TIME NOT NULL,
    duration_hours NUMERIC,
    quality TEXT,
    notes TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_hydration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    unit TEXT NOT NULL DEFAULT 'ml',
    notes TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood_rating INTEGER,
    selected_moods TEXT[],
    journal TEXT,
    notes TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_goal JSONB,
    activity_goal JSONB,
    hydration_goal JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Baby Care tables
CREATE TABLE IF NOT EXISTS baby_feeding_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    feed_type TEXT NOT NULL,
    amount_ml NUMERIC,
    duration_minutes INTEGER,
    breast_side TEXT,
    food_details TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baby_diaper_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    diaper_type TEXT NOT NULL,
    consistency TEXT,
    color TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baby_sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours NUMERIC,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baby_growth_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    head_circumference_cm NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baby_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    category TEXT NOT NULL,
    achieved_date DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    expected_date_range JSONB,
    tips TEXT,
    notes TEXT,
    photo_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baby_vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    dose_number INTEGER,
    administered_date DATE NOT NULL,
    administered_by TEXT,
    brand_and_batch_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baby_food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    meal_type TEXT NOT NULL,
    items JSONB NOT NULL,
    notes TEXT,
    is_new_food_introduction BOOLEAN DEFAULT FALSE,
    new_food_reaction TEXT,
    new_food_reaction_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Women's Health tables
CREATE TABLE IF NOT EXISTS period_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    symptoms TEXT[] NOT NULL,
    moods TEXT[],
    custom_symptom TEXT,
    severity TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screening_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    screening_type TEXT NOT NULL,
    last_screening_date DATE,
    frequency_years INTEGER,
    reminder_date DATE,
    next_due_date DATE,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pregnancy tables
CREATE TABLE IF NOT EXISTS pregnancy_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lmp DATE,
    edd DATE,
    conception_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pregnancy_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    symptoms TEXT[] NOT NULL,
    moods TEXT[],
    custom_symptom TEXT,
    severity TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kick_count_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    kick_count INTEGER NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prenatal_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    doctor_or_clinic TEXT,
    purpose TEXT,
    questions_to_ask TEXT,
    summary_or_notes TEXT,
    weight_kg NUMERIC,
    blood_pressure TEXT,
    fundal_height_cm NUMERIC,
    fetal_heart_rate_bpm INTEGER,
    tests_recommended TEXT[],
    next_appointment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification tables
CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    last_daily_login_award_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS earned_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS activity_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_log_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_type)
);

-- Row Level Security (RLS) policies
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_feeding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_diaper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE kick_count_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prenatal_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data access
CREATE POLICY "Users can access their own family members" ON family_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own prescriptions" ON prescriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own wellness data" ON wellness_vitals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own weight logs" ON wellness_weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own activity logs" ON wellness_activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own sleep logs" ON wellness_sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own hydration logs" ON wellness_hydration_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own mood logs" ON wellness_mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own wellness goals" ON wellness_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby feeding logs" ON baby_feeding_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby diaper logs" ON baby_diaper_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby sleep logs" ON baby_sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby growth records" ON baby_growth_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby milestones" ON baby_milestones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby vaccinations" ON baby_vaccinations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own baby food logs" ON baby_food_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own period entries" ON period_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own symptom logs" ON symptom_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own screening reminders" ON screening_reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own pregnancy profiles" ON pregnancy_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own pregnancy symptoms" ON pregnancy_symptoms FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own kick count sessions" ON kick_count_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own prenatal appointments" ON prenatal_appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own points" ON user_points FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own badges" ON earned_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own streaks" ON activity_streaks FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_wellness_vitals_user_id_date ON wellness_vitals(user_id, date);
CREATE INDEX idx_baby_feeding_logs_child_id ON baby_feeding_logs(child_id);
CREATE INDEX idx_baby_diaper_logs_child_id ON baby_diaper_logs(child_id);
CREATE INDEX idx_baby_sleep_logs_child_id ON baby_sleep_logs(child_id);
CREATE INDEX idx_period_entries_user_id_date ON period_entries(user_id, start_date);
CREATE INDEX idx_pregnancy_profiles_user_id ON pregnancy_profiles(user_id);