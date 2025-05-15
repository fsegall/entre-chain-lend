-- Start a transaction to ensure all changes are applied atomically
BEGIN;

-- Create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'lender', 'borrower')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS if not already enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can manage roles" ON user_roles;

-- Create a function to check if a user is an admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_roles.user_id = $1
        AND user_roles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if any admin exists (bypasses RLS)
CREATE OR REPLACE FUNCTION admin_exists()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple policy for viewing roles
CREATE POLICY "Users can view their own roles"
    ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create a simple policy for managing roles
CREATE POLICY "Users can manage roles"
    ON user_roles
    FOR ALL
    USING (
        -- Allow users to manage their own non-privileged roles
        (auth.uid() = user_id AND role NOT IN ('admin', 'moderator'))
        OR
        -- Allow the first admin to be created
        (NOT admin_exists() AND role = 'admin')
        OR
        -- Allow existing admins to manage all roles
        (is_user_admin(auth.uid()))
    );

-- Drop existing functions first to avoid type conflicts
DROP FUNCTION IF EXISTS is_privileged_role(TEXT);
DROP FUNCTION IF EXISTS is_privileged_role(app_role);

-- Create the function with explicit TEXT type
CREATE OR REPLACE FUNCTION is_privileged_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS role_assignment_trigger ON user_roles;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;

-- Drop existing trigger functions
DROP FUNCTION IF EXISTS check_role_assignment() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create the trigger function with explicit type casting
CREATE OR REPLACE FUNCTION check_role_assignment()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    is_current_user_admin BOOLEAN;
BEGIN
    -- Get the current user's ID from auth.uid()
    current_user_id := auth.uid();
    
    -- Check if the current user is an admin
    is_current_user_admin := is_user_admin(current_user_id);
    
    -- If trying to assign a privileged role and user is not an admin, prevent the operation
    IF is_privileged_role(NEW.role::TEXT) AND NOT is_current_user_admin THEN
        RAISE EXCEPTION 'Only administrators can assign privileged roles';
    END IF;
    
    -- If trying to modify someone else's role and user is not an admin, prevent the operation
    IF NEW.user_id != current_user_id AND NOT is_current_user_admin THEN
        RAISE EXCEPTION 'You can only modify your own roles';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER role_assignment_trigger
    BEFORE INSERT OR UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION check_role_assignment();

-- Add a comment to explain the trigger
COMMENT ON TRIGGER role_assignment_trigger ON user_roles IS 
'Prevents non-admin users from assigning privileged roles and modifying other users'' roles';

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_roles_admin ON user_roles(user_id) WHERE role = 'admin';

-- Drop existing admin function to avoid type conflicts
DROP FUNCTION IF EXISTS assign_initial_admin(UUID) CASCADE;

-- Create or replace the initial admin function
CREATE OR REPLACE FUNCTION assign_initial_admin(admin_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Only proceed if no admin exists
    IF NOT admin_exists() THEN
        -- Insert the admin role
        INSERT INTO user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
        
        -- Update the user's profile
        UPDATE profiles
        SET role_selection = 'admin',
            is_onboarded = true
        WHERE id = admin_user_id;
    ELSE
        RAISE EXCEPTION 'An admin user already exists';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to explain the function
COMMENT ON FUNCTION assign_initial_admin IS 
'Assigns the first admin user. Can only be used when no admin exists.';

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the updated_at trigger
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commit the transaction
COMMIT; 