
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
      
      // Store the nonce in a temporary table with expiration
      const { error } = await supabaseAdmin
        .from('wallet_auth_nonces')
        .insert({ 
          nonce: newNonce, 
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiration
        });
      
      if (error) {
        console.error('Error storing nonce:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to generate authentication challenge' 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log(`Generated nonce: ${newNonce}`);
      
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

      // Check if the nonce exists and is valid
      const { data: nonceData, error: nonceError } = await supabaseAdmin
        .from('wallet_auth_nonces')
        .select('nonce, created_at, expires_at, used')
        .eq('nonce', nonce)
        .single();

      console.log('Nonce lookup result:', { nonceData, nonceError });
      
      if (nonceError || !nonceData) {
        console.error(`No nonce found: ${nonce}`);
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

      // Check if the nonce has already been used
      if (nonceData.used) {
        console.error(`Nonce already used: ${nonce}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Nonce has already been used' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Check if the nonce has expired
      const expiresAt = new Date(nonceData.expires_at);
      if (expiresAt < new Date()) {
        console.error(`Nonce expired: ${nonce}, expired at ${expiresAt.toISOString()}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Nonce has expired' 
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
        
        // Mark the nonce as used
        const { error: updateError } = await supabaseAdmin
          .from('wallet_auth_nonces')
          .update({ used: true })
          .eq('nonce', nonce);
          
        if (updateError) {
          console.error('Error marking nonce as used:', updateError);
        }
        
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
