
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

// Map to store nonces
const nonces = new Map<string, { nonce: string, createdAt: number }>()

// Cleanup old nonces every 5 minutes
setInterval(() => {
  const now = Date.now()
  // Remove nonces older than 10 minutes
  for (const [key, value] of nonces.entries()) {
    if (now - value.createdAt > 10 * 60 * 1000) {
      nonces.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Handle wallet authentication requests
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, address, signature, nonce } = await req.json()

    if (action === 'get_nonce') {
      // Generate a random nonce
      const newNonce = crypto.randomUUID()
      const message = `Sign this message to verify your wallet address: ${newNonce}`
      
      // Store the nonce with a timestamp
      nonces.set(newNonce, { 
        nonce: newNonce, 
        createdAt: Date.now() 
      })
      
      console.log(`Generated nonce: ${newNonce}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message,
          nonce: newNonce 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'verify_signature') {
      // Verify the signature
      if (!address || !signature || !nonce) {
        console.error('Missing parameters', { address, signature, nonce })
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if the nonce exists and is valid
      const nonceData = nonces.get(nonce)
      if (!nonceData) {
        console.error('Invalid or expired nonce', { nonce })
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired nonce' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Construct the message that was signed
      const message = `Sign this message to verify your wallet address: ${nonce}`
      
      try {
        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature)
        
        console.log('Verification attempt', { 
          providedAddress: address.toLowerCase(), 
          recoveredAddress: recoveredAddress.toLowerCase() 
        })
        
        // Check if the recovered address matches the provided address
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          console.error('Signature verification failed - address mismatch')
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Signature verification failed - address mismatch' 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Delete the nonce after successful verification
        nonces.delete(nonce)
        
        // Here we would typically update the user's profile or session
        // For now we'll just return success
        console.log('Signature verification successful for address', address)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Wallet verified successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Signature verification error', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Signature verification failed: ${error.message}` 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
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
    )

  } catch (error) {
    console.error('Edge function error', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error processing request: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
