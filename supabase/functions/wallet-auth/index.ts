
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
    const body = await req.json();
    const { action } = body;
    console.log("Received wallet-auth request with action:", action);
    
    // Create Supabase client using the Authorization header from the request
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    switch (action) {
      case 'get_nonce': {
        // Generate a random nonce for the wallet to sign
        const nonce = crypto.randomUUID();
        const message = `Sign this message to verify wallet ownership: ${nonce}`;
        
        console.log("Generated nonce:", nonce);
        
        return new Response(JSON.stringify({ message, nonce }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'verify_signature': {
        const { address, signature, nonce } = body;
        
        // Log incoming verification data
        console.log("Verifying signature with:", { 
          address: address?.toLowerCase(),
          signatureLength: signature?.length,
          nonceProvided: !!nonce
        });
        
        if (!address || !signature || !nonce) {
          console.error("Missing required parameters:", { address, signature: !!signature, nonce });
          return new Response(JSON.stringify({ 
            error: 'Missing required parameters: address, signature, or nonce' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Recreate the message that was signed
        const message = `Sign this message to verify wallet ownership: ${nonce}`;
        
        try {
          // Verify the signature
          console.log("Verifying message:", message);
          const recoveredAddress = ethers.verifyMessage(message, signature);
          console.log("Recovered address:", recoveredAddress);
          console.log("Provided address:", address);
          
          // Case-insensitive address comparison
          if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            console.error("Address mismatch:", {
              recovered: recoveredAddress.toLowerCase(),
              provided: address.toLowerCase()
            });
            
            return new Response(JSON.stringify({ 
              error: 'Invalid signature: recovered address does not match provided address',
              recoveredAddress,
              providedAddress: address
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          // If the user is authenticated, update their profile with the wallet address
          if (session) {
            console.log("Updating wallet address for user:", session.user.id);
            
            // Update the user's profile with the wallet address
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .update({ wallet_address: address })
              .eq('id', session.user.id)
              .select();
            
            if (profileError) {
              console.error('Error updating profile:', profileError);
              return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            
            return new Response(JSON.stringify({ 
              success: true,
              message: 'Wallet connected successfully',
              profile: profileData
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
        } catch (verifyError) {
          console.error("Signature verification error:", verifyError);
          return new Response(JSON.stringify({ 
            error: `Signature verification failed: ${verifyError.message}`,
            details: String(verifyError)
          }), {
            status: 400,
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
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: String(error.stack)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
