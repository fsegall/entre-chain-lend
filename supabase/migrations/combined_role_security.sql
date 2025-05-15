-- Start a transaction to ensure all changes are applied atomically
BEGIN;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
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

-- Create a function to check if a role is privileged
CREATE OR REPLACE FUNCTION is_privileged_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN role_name IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger function
CREATE OR REPLACE FUNCTION check_role_assignment()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  is_current_user_admin BOOLEAN;
BEGIN
  -- Get the current user's ID from auth.uid()
  current_user_id := auth.uid();
  
  -- Check if the current user is an admin
  is_current_user_admin := is_admin(current_user_id);
  
  -- If trying to assign a privileged role and user is not an admin, prevent the operation
  IF is_privileged_role(NEW.role) AND NOT is_current_user_admin THEN
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
DROP TRIGGER IF EXISTS role_assignment_trigger ON user_roles;
CREATE TRIGGER role_assignment_trigger
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION check_role_assignment();

-- Add a comment to explain the trigger
COMMENT ON TRIGGER role_assignment_trigger ON user_roles IS 
'Prevents non-admin users from assigning privileged roles and modifying other users'' roles';

-- Create an index to speed up admin checks
CREATE INDEX IF NOT EXISTS idx_user_roles_admin ON user_roles(user_id) WHERE role = 'admin';

-- Create a function to safely assign the first admin
CREATE OR REPLACE FUNCTION assign_initial_admin(admin_user_id UUID)
RETURNS VOID AS $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  -- Check if any admin exists
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE role = 'admin'
  ) INTO admin_exists;
  
  -- Only proceed if no admin exists
  IF NOT admin_exists THEN
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

-- Commit the transaction
COMMIT; 