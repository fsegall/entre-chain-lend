
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.11.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get Supabase URL and anon key from environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  
  try {
    const { action } = await req.json();
    
    // Create Supabase client using the Authorization header from the request
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && action !== 'get_nonce') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'get_nonce': {
        // Generate a random nonce for the wallet to sign
        const nonce = crypto.randomUUID();
        const message = `Sign this message to verify wallet ownership: ${nonce}`;
        
        return new Response(JSON.stringify({ message, nonce }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'verify_signature': {
        const { address, signature, nonce } = await req.json();
        
        // Recreate the message that was signed
        const message = `Sign this message to verify wallet ownership: ${nonce}`;
        
        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // If the user is authenticated, update their profile with the wallet address
        if (session) {
          // Update the user's profile with the wallet address
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ wallet_address: address })
            .eq('id', session.user.id);
          
          if (profileError) {
            console.error('Error updating profile:', profileError);
            return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          return new Response(JSON.stringify({ 
            success: true,
            message: 'Wallet connected successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // For unauthenticated use cases, just return the verified address
          return new Response(JSON.stringify({ 
            success: true,
            address: recoveredAddress,
            message: 'Signature verified successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Wallet auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
