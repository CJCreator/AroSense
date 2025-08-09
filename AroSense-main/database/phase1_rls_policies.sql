-- =============================================
-- AroSense Phase 1: Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FAMILY MEMBERS POLICIES
-- =============================================

CREATE POLICY "Users can view own family members" ON family_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family members" ON family_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family members" ON family_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family members" ON family_members
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- EMERGENCY CONTACTS POLICIES
-- =============================================

CREATE POLICY "Users can view own emergency contacts" ON emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts" ON emergency_contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts" ON emergency_contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts" ON emergency_contacts
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- MEDICAL CONDITIONS POLICIES
-- =============================================

CREATE POLICY "Users can view own medical conditions" ON medical_conditions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical conditions" ON medical_conditions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical conditions" ON medical_conditions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical conditions" ON medical_conditions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PRESCRIPTIONS POLICIES
-- =============================================

CREATE POLICY "Users can view own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- DOCUMENTS POLICIES
-- =============================================

CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- APPOINTMENTS POLICIES
-- =============================================

CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- VITALS LOGS POLICIES
-- =============================================

CREATE POLICY "Users can view own vitals logs" ON vitals_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals logs" ON vitals_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals logs" ON vitals_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals logs" ON vitals_logs
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- WEIGHT LOGS POLICIES
-- =============================================

CREATE POLICY "Users can view own weight logs" ON weight_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs" ON weight_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs" ON weight_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs" ON weight_logs
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ACTIVITY LOGS POLICIES
-- =============================================

CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs" ON activity_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs" ON activity_logs
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- WELLNESS LOGS POLICIES
-- =============================================

CREATE POLICY "Users can view own wellness logs" ON wellness_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness logs" ON wellness_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness logs" ON wellness_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness logs" ON wellness_logs
    FOR DELETE USING (auth.uid() = user_id);