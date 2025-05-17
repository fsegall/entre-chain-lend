-- Start a transaction
BEGIN;

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Allow all authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users" ON user_roles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create role-specific policies
CREATE POLICY "Enable read for authenticated users"
    ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable read for authenticated users"
    ON user_roles
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
    ON user_roles
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create a more robust trigger function
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
    INSERT INTO public.profiles (id, full_name, is_onboarded, role_selection)
    VALUES (NEW.id, full_name, false, null)
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

-- Create role management functions
CREATE OR REPLACE FUNCTION get_user_roles(_user_id UUID)
RETURNS app_role[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT role
        FROM user_roles
        WHERE user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_any_role(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commit the transaction
COMMIT; 