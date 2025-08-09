-- =============================================
-- AroSense Phase 2: RLS Policies for Specialized Modules
-- =============================================

-- Enable RLS on all Phase 2 tables
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

-- =============================================
-- WOMEN'S HEALTH POLICIES
-- =============================================

-- Menstrual cycles policies
CREATE POLICY "Users can view own menstrual cycles" ON menstrual_cycles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own menstrual cycles" ON menstrual_cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own menstrual cycles" ON menstrual_cycles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own menstrual cycles" ON menstrual_cycles
    FOR DELETE USING (auth.uid() = user_id);

-- Fertility windows policies
CREATE POLICY "Users can view own fertility windows" ON fertility_windows
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fertility windows" ON fertility_windows
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fertility windows" ON fertility_windows
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fertility windows" ON fertility_windows
    FOR DELETE USING (auth.uid() = user_id);

-- Symptoms diary policies
CREATE POLICY "Users can view own symptoms diary" ON symptoms_diary
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptoms diary" ON symptoms_diary
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptoms diary" ON symptoms_diary
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own symptoms diary" ON symptoms_diary
    FOR DELETE USING (auth.uid() = user_id);

-- Screening reminders policies
CREATE POLICY "Users can view own screening reminders" ON screening_reminders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screening reminders" ON screening_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own screening reminders" ON screening_reminders
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own screening reminders" ON screening_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PREGNANCY POLICIES
-- =============================================

-- Pregnancy profiles policies
CREATE POLICY "Users can view own pregnancy profiles" ON pregnancy_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pregnancy profiles" ON pregnancy_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pregnancy profiles" ON pregnancy_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pregnancy profiles" ON pregnancy_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Prenatal appointments policies
CREATE POLICY "Users can view own prenatal appointments" ON prenatal_appointments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prenatal appointments" ON prenatal_appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prenatal appointments" ON prenatal_appointments
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prenatal appointments" ON prenatal_appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Pregnancy symptoms policies
CREATE POLICY "Users can view own pregnancy symptoms" ON pregnancy_symptoms
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pregnancy symptoms" ON pregnancy_symptoms
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pregnancy symptoms" ON pregnancy_symptoms
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pregnancy symptoms" ON pregnancy_symptoms
    FOR DELETE USING (auth.uid() = user_id);

-- Kick counts policies
CREATE POLICY "Users can view own kick counts" ON kick_counts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kick counts" ON kick_counts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kick counts" ON kick_counts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own kick counts" ON kick_counts
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- BABY CARE POLICIES
-- =============================================

-- Vaccination schedules policies
CREATE POLICY "Users can view own vaccination schedules" ON vaccination_schedules
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaccination schedules" ON vaccination_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaccination schedules" ON vaccination_schedules
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vaccination schedules" ON vaccination_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- Pediatric appointments policies
CREATE POLICY "Users can view own pediatric appointments" ON pediatric_appointments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pediatric appointments" ON pediatric_appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pediatric appointments" ON pediatric_appointments
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pediatric appointments" ON pediatric_appointments
    FOR DELETE USING (auth.uid() = user_id);