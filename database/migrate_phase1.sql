-- =============================================
-- AroSense Phase 1: Final Setup Script
-- Run AFTER executing the other 3 files in order:
-- 1. phase1_core_schema.sql
-- 2. phase1_security_functions.sql  
-- 3. phase1_rls_policies.sql
-- =============================================

-- =============================================
-- ADDITIONAL SETUP COMMANDS
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create storage bucket for documents (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical documents (conditional creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload own documents') THEN
        CREATE POLICY "Users can upload own documents" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view own documents') THEN
        CREATE POLICY "Users can view own documents" ON storage.objects
            FOR SELECT USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own documents') THEN
        CREATE POLICY "Users can update own documents" ON storage.objects
            FOR UPDATE USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own documents') THEN
        CREATE POLICY "Users can delete own documents" ON storage.objects
            FOR DELETE USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- =============================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- =============================================

-- Insert sample profile (replace with actual user ID)
-- INSERT INTO profiles (user_id, full_name, email, blood_type) 
-- VALUES ('your-user-id-here', 'John Doe', 'john@example.com', 'O+');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'family_members', 'emergency_contacts', 
    'medical_conditions', 'prescriptions', 'documents', 
    'appointments', 'vitals_logs', 'weight_logs', 
    'activity_logs', 'wellness_logs', 'security_audit_log'
);

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'family_members', 'emergency_contacts', 
    'medical_conditions', 'prescriptions', 'documents', 
    'appointments', 'vitals_logs', 'weight_logs', 
    'activity_logs', 'wellness_logs'
);

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Verify functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'validate_uuid', 'validate_text_input', 'validate_email', 
    'validate_phone', 'validate_numeric_range', 'log_security_event',
    'user_owns_family_member', 'sanitize_jsonb', 'update_updated_at_column'
);

-- =============================================
-- PERFORMANCE OPTIMIZATION
-- =============================================

-- Analyze tables for query optimization
ANALYZE profiles;
ANALYZE family_members;
ANALYZE emergency_contacts;
ANALYZE medical_conditions;
ANALYZE prescriptions;
ANALYZE documents;
ANALYZE appointments;
ANALYZE vitals_logs;
ANALYZE weight_logs;
ANALYZE activity_logs;
ANALYZE wellness_logs;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Phase 1 migration completed successfully!';
    RAISE NOTICE 'Tables created, RLS enabled, Security functions installed';
    RAISE NOTICE 'Next steps: Update your frontend services to use the new schema';
END $$;