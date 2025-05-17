-- Start a transaction
BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "user_roles_policy" ON user_roles;

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

-- Create a trigger to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
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