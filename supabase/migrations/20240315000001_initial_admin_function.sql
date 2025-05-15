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