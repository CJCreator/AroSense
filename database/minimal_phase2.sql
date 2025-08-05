-- First check what exists
SELECT column_name FROM information_schema.columns WHERE table_name = 'family_members';

-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'is_active') THEN
        ALTER TABLE family_members ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create Phase 2 tables without any indexes that reference is_active
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

-- Enable RLS
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "menstrual_policy" ON menstrual_cycles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pregnancy_policy" ON pregnancy_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "vaccine_policy" ON vaccination_schedules FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON menstrual_cycles TO authenticated;
GRANT ALL ON pregnancy_profiles TO authenticated;
GRANT ALL ON vaccination_schedules TO authenticated;