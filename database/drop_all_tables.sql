-- Drop all existing tables to clean database
DROP TABLE IF EXISTS pediatric_appointments CASCADE;
DROP TABLE IF EXISTS vaccination_schedules CASCADE;
DROP TABLE IF EXISTS kick_counts CASCADE;
DROP TABLE IF EXISTS pregnancy_symptoms CASCADE;
DROP TABLE IF EXISTS prenatal_appointments CASCADE;
DROP TABLE IF EXISTS pregnancy_profiles CASCADE;
DROP TABLE IF EXISTS screening_reminders CASCADE;
DROP TABLE IF EXISTS symptoms_diary CASCADE;
DROP TABLE IF EXISTS fertility_windows CASCADE;
DROP TABLE IF EXISTS menstrual_cycles CASCADE;
DROP TABLE IF EXISTS wellness_logs CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS weight_logs CASCADE;
DROP TABLE IF EXISTS vitals_logs CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_conditions CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

SELECT 'All tables dropped successfully!' as result;