
# Supabase Resources

This directory contains Supabase-related files:

- `config.toml`: Configuration for Supabase Edge Functions
- `functions/`: Edge Functions implementation
- `migrations/`: SQL migrations for database schema changes
- `edge-functions/`: Additional serverless functions

## Edge Functions

### wallet-auth

The `wallet-auth` edge function handles Web3 wallet authentication:

- `get_nonce`: Generates a nonce for wallet signature verification
- `verify_signature`: Verifies a wallet signature and associates it with a user

## Usage

To interact with the edge functions from the frontend:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Example: Get nonce for wallet signature
const { data, error } = await supabase.functions.invoke('wallet-auth', {
  body: { action: 'get_nonce' }
});

// Example: Verify wallet signature
const { data, error } = await supabase.functions.invoke('wallet-auth', {
  body: { 
    action: 'verify_signature',
    address: '0x...',
    signature: '0x...',
    nonce: 'uuid'
  }
});
```
