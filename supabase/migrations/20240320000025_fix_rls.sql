-- Start a transaction
BEGIN;

-- First, disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    policy_name text;
BEGIN
    -- Drop policies from profiles
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_name);
    END LOOP;

    -- Drop policies from user_roles
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_roles', policy_name);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create a single policy that allows all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
    ON profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users"
    ON user_roles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a trigger to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the profile if it doesn't exist
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
    ON CONFLICT (id) DO NOTHING;

    -- Insert visitor role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'visitor')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Commit the transaction
COMMIT; 