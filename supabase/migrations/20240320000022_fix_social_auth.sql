-- Start a transaction
BEGIN;

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "user_roles_policy" ON user_roles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create more permissive policies for initial setup
CREATE POLICY "Enable insert for service role"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable read for authenticated users"
    ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Create a more robust trigger function that handles both email and social auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name TEXT;
BEGIN
    -- Try to get full_name from different possible sources
    full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'user_name',
        NEW.email
    );

    -- Insert the profile if it doesn't exist
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, full_name)
    ON CONFLICT (id) DO NOTHING;

    -- Insert visitor role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'visitor')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Commit the transaction
COMMIT; 