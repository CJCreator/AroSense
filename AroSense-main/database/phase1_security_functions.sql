-- =============================================
-- AroSense Phase 1: Security Validation Functions
-- =============================================

-- Input validation function for UUIDs
CREATE OR REPLACE FUNCTION validate_uuid(input_uuid TEXT)
RETURNS UUID AS $$
BEGIN
    -- Check if input is a valid UUID format
    IF input_uuid IS NULL OR input_uuid = '' THEN
        RAISE EXCEPTION 'UUID cannot be null or empty';
    END IF;
    
    -- Try to cast to UUID (will raise exception if invalid)
    RETURN input_uuid::UUID;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid UUID format: %', input_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Input validation for text fields
CREATE OR REPLACE FUNCTION validate_text_input(input_text TEXT, field_name TEXT, max_length INTEGER DEFAULT 255)
RETURNS TEXT AS $$
BEGIN
    -- Check for null or empty
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Trim whitespace
    input_text := TRIM(input_text);
    
    -- Check length
    IF LENGTH(input_text) > max_length THEN
        RAISE EXCEPTION '% exceeds maximum length of % characters', field_name, max_length;
    END IF;
    
    -- Basic XSS prevention - remove potentially dangerous characters
    input_text := REGEXP_REPLACE(input_text, '[<>"\''&]', '', 'g');
    
    RETURN input_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate email format
CREATE OR REPLACE FUNCTION validate_email(email_input TEXT)
RETURNS TEXT AS $$
BEGIN
    IF email_input IS NULL THEN
        RETURN NULL;
    END IF;
    
    email_input := LOWER(TRIM(email_input));
    
    -- Basic email validation regex
    IF NOT email_input ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', email_input;
    END IF;
    
    RETURN email_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate phone number
CREATE OR REPLACE FUNCTION validate_phone(phone_input TEXT)
RETURNS TEXT AS $$
BEGIN
    IF phone_input IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove all non-digit characters except + and -
    phone_input := REGEXP_REPLACE(phone_input, '[^0-9+\-\s()]', '', 'g');
    phone_input := TRIM(phone_input);
    
    -- Check minimum length (at least 10 digits)
    IF LENGTH(REGEXP_REPLACE(phone_input, '[^0-9]', '', 'g')) < 10 THEN
        RAISE EXCEPTION 'Phone number must contain at least 10 digits';
    END IF;
    
    RETURN phone_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate numeric ranges
CREATE OR REPLACE FUNCTION validate_numeric_range(
    input_value DECIMAL,
    field_name TEXT,
    min_value DECIMAL DEFAULT NULL,
    max_value DECIMAL DEFAULT NULL
)
RETURNS DECIMAL AS $$
BEGIN
    IF input_value IS NULL THEN
        RETURN NULL;
    END IF;
    
    IF min_value IS NOT NULL AND input_value < min_value THEN
        RAISE EXCEPTION '% must be at least %', field_name, min_value;
    END IF;
    
    IF max_value IS NOT NULL AND input_value > max_value THEN
        RAISE EXCEPTION '% must not exceed %', field_name, max_value;
    END IF;
    
    RETURN input_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    table_name TEXT,
    record_id UUID,
    user_id UUID,
    details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO security_audit_log (
        event_type,
        table_name,
        record_id,
        user_id,
        details,
        created_at
    ) VALUES (
        event_type,
        table_name,
        record_id,
        user_id,
        details,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    user_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_time ON security_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_table_time ON security_audit_log(table_name, created_at DESC);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow viewing own audit logs (admin can override)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_log' AND policyname = 'Users can view own audit logs') THEN
        CREATE POLICY "Users can view own audit logs" ON security_audit_log
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Function to check if user owns a family member record
CREATE OR REPLACE FUNCTION user_owns_family_member(family_member_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    member_user_id UUID;
BEGIN
    SELECT user_id INTO member_user_id 
    FROM family_members 
    WHERE id = family_member_uuid;
    
    RETURN member_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sanitize JSONB input
CREATE OR REPLACE FUNCTION sanitize_jsonb(input_json JSONB)
RETURNS JSONB AS $$
DECLARE
    sanitized_json JSONB;
    key TEXT;
    value TEXT;
BEGIN
    IF input_json IS NULL THEN
        RETURN NULL;
    END IF;
    
    sanitized_json := '{}'::JSONB;
    
    -- Iterate through each key-value pair
    FOR key, value IN SELECT * FROM jsonb_each_text(input_json)
    LOOP
        -- Sanitize the value
        value := validate_text_input(value, key, 1000);
        sanitized_json := sanitized_json || jsonb_build_object(key, value);
    END LOOP;
    
    RETURN sanitized_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;