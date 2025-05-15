
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { ethers } from "https://esm.sh/ethers@6.11.1/dist/ethers.js";

// Set up CORS headers for the edge function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a single supabase client for the edge function
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Map to store nonces - using a global variable for this demo
// In production, you would use a database or Redis to store nonces
const nonceStore = new Map<string, { nonce: string, createdAt: number }>();

// Handle wallet authentication requests
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, address, signature, nonce } = await req.json();
    console.log(`Received request with action: ${action}`);

    if (action === 'get_nonce') {
      // Generate a random nonce
      const newNonce = crypto.randomUUID();
      const message = `Sign this message to verify your wallet address: ${newNonce}`;
      
      // Store the nonce with a timestamp
      nonceStore.set(newNonce, { 
        nonce: newNonce, 
        createdAt: Date.now() 
      });
      
      console.log(`Generated nonce: ${newNonce}`);
      console.log(`Active nonces: ${nonceStore.size}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message,
          nonce: newNonce 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'verify_signature') {
      console.log(`Verifying signature for address: ${address} and nonce: ${nonce}`);
      
      // Verify the signature
      if (!address || !signature || !nonce) {
        console.error('Missing parameters', { address, signature, nonce });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Debug: log all active nonces
      console.log(`Checking nonce: ${nonce}`);
      console.log(`Available nonces: ${Array.from(nonceStore.keys()).join(', ')}`);

      // Check if the nonce exists and is valid
      const nonceData = nonceStore.get(nonce);
      if (!nonceData) {
        console.error(`Invalid or expired nonce: ${nonce}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired nonce' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Construct the message that was signed
      const message = `Sign this message to verify your wallet address: ${nonce}`;
      
      try {
        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        console.log('Verification attempt', { 
          providedAddress: address.toLowerCase(), 
          recoveredAddress: recoveredAddress.toLowerCase() 
        });
        
        // Check if the recovered address matches the provided address
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          console.error('Signature verification failed - address mismatch');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Signature verification failed - address mismatch' 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Delete the nonce after successful verification
        nonceStore.delete(nonce);
        
        console.log('Signature verification successful for address', address);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Wallet verified successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Signature verification error', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Signature verification failed: ${error.message}` 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid action' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error processing request: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
