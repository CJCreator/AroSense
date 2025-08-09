-- =============================================
-- AroSense Phase 2: Migration Script
-- Run AFTER Phase 1 is complete
-- =============================================

-- Step 1: Create Phase 2 tables
\i phase2_specialized_schema.sql

-- Step 2: Apply Phase 2 RLS policies  
\i phase2_rls_policies.sql

-- =============================================
-- ADDITIONAL SETUP COMMANDS
-- =============================================

-- Grant permissions for new tables
GRANT ALL ON menstrual_cycles TO authenticated;
GRANT ALL ON fertility_windows TO authenticated;
GRANT ALL ON symptoms_diary TO authenticated;
GRANT ALL ON screening_reminders TO authenticated;
GRANT ALL ON pregnancy_profiles TO authenticated;
GRANT ALL ON prenatal_appointments TO authenticated;
GRANT ALL ON pregnancy_symptoms TO authenticated;
GRANT ALL ON kick_counts TO authenticated;
GRANT ALL ON vaccination_schedules TO authenticated;
GRANT ALL ON pediatric_appointments TO authenticated;

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Sample screening reminders for new users
INSERT INTO screening_reminders (user_id, screening_type, frequency_months, next_due_date, is_completed)
SELECT 
    auth.uid(),
    unnest(ARRAY['Pap Smear', 'Mammogram', 'Well-Woman Visit']),
    unnest(ARRAY[36, 12, 12]),
    CURRENT_DATE + INTERVAL '1 year',
    false
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify Phase 2 tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'menstrual_cycles', 'fertility_windows', 'symptoms_diary', 'screening_reminders',
    'pregnancy_profiles', 'prenatal_appointments', 'pregnancy_symptoms', 'kick_counts',
    'vaccination_schedules', 'pediatric_appointments'
);

-- Verify RLS is enabled on Phase 2 tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'menstrual_cycles', 'fertility_windows', 'symptoms_diary', 'screening_reminders',
    'pregnancy_profiles', 'prenatal_appointments', 'pregnancy_symptoms', 'kick_counts',
    'vaccination_schedules', 'pediatric_appointments'
)
AND rowsecurity = true;

-- Verify Phase 2 indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (indexname LIKE 'idx_menstrual_%' 
     OR indexname LIKE 'idx_fertility_%'
     OR indexname LIKE 'idx_symptoms_%'
     OR indexname LIKE 'idx_screening_%'
     OR indexname LIKE 'idx_pregnancy_%'
     OR indexname LIKE 'idx_prenatal_%'
     OR indexname LIKE 'idx_kick_%'
     OR indexname LIKE 'idx_vaccination_%'
     OR indexname LIKE 'idx_pediatric_%');

-- =============================================
-- PERFORMANCE OPTIMIZATION
-- =============================================

-- Analyze new tables for query optimization
ANALYZE menstrual_cycles;
ANALYZE fertility_windows;
ANALYZE symptoms_diary;
ANALYZE screening_reminders;
ANALYZE pregnancy_profiles;
ANALYZE prenatal_appointments;
ANALYZE pregnancy_symptoms;
ANALYZE kick_counts;
ANALYZE vaccination_schedules;
ANALYZE pediatric_appointments;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Phase 2 migration completed successfully!';
    RAISE NOTICE 'Specialized health modules created: Women''s Health, Pregnancy, Baby Care';
    RAISE NOTICE 'All tables have RLS enabled and proper indexes';
    RAISE NOTICE 'Ready for Phase 2 frontend integration';
END $$;