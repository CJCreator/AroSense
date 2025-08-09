-- Check if Phase 1 tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'family_members', 'emergency_contacts', 
    'medical_conditions', 'prescriptions', 'documents', 
    'appointments', 'vitals_logs', 'weight_logs', 
    'activity_logs', 'wellness_logs'
);

-- Check if update_updated_at_column function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_updated_at_column';