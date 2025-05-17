-- Start a transaction
BEGIN;

-- Add wallet_address column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'wallet_address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN wallet_address TEXT;
    END IF;
END $$;

-- Create wallet-related functions
CREATE OR REPLACE FUNCTION update_wallet_address(user_id UUID, address TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET wallet_address = address
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_wallet_address(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET wallet_address = NULL
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create wallet-related policies
CREATE POLICY "Enable wallet update for users based on id"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address) WHERE wallet_address IS NOT NULL;

-- Commit the transaction
COMMIT; 