
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { action, address, signature, nonce } = await req.json();
    console.log(`Wallet-auth function called with action: ${action}`);
    
    // Handle different actions
    switch (action) {
      case 'get_nonce':
        return await handleGetNonce(req);
      case 'verify_signature':
        return await handleVerifySignature(req, address, signature, nonce);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Generate a new nonce for the user and store it in the database
async function handleGetNonce(req) {
  try {
    // Generate a UUID for the nonce
    const nonce = crypto.randomUUID();
    
    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Store the nonce in the database
    const { error } = await supabase
      .from('wallet_auth_nonces')
      .insert({
        nonce,
        expires_at: expiresAt.toISOString(),
        used: false
      });
    
    if (error) {
      console.error("Error storing nonce:", error);
      throw new Error("Failed to generate authentication challenge");
    }
    
    // Create a message for the user to sign
    const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
    
    return new Response(
      JSON.stringify({ 
        message,
        nonce
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating nonce:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate nonce" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Verify the signature against the stored nonce
async function handleVerifySignature(req, address, signature, nonce) {
  try {
    if (!address || !signature || !nonce) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the nonce exists and is valid
    const { data: nonceData, error: nonceError } = await supabase
      .from('wallet_auth_nonces')
      .select('*')
      .eq('nonce', nonce)
      .eq('used', false)
      .single();
    
    if (nonceError || !nonceData) {
      console.error("Nonce validation error:", nonceError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired nonce" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the nonce has expired
    if (new Date(nonceData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Nonce has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // The message that was signed
    const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
    
    // Import ethers in Deno
    const ethers = await import("https://esm.sh/ethers@6.11.1");
    
    // Verify the signature
    let recoveredAddress;
    try {
      // Verify signature using ethers
      recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Convert to lowercase for comparison
      recoveredAddress = recoveredAddress.toLowerCase();
      address = address.toLowerCase();
      
      console.log("Recovered address:", recoveredAddress);
      console.log("Supplied address:", address);
      
      if (recoveredAddress !== address) {
        throw new Error("Signature verification failed: address mismatch");
      }
    } catch (verifyError) {
      console.error("Signature verification failed:", verifyError);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Mark the nonce as used
    const { error: updateError } = await supabase
      .from('wallet_auth_nonces')
      .update({ used: true })
      .eq('nonce', nonce);
    
    if (updateError) {
      console.error("Error updating nonce:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to process verification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Wallet verification successful",
        address: recoveredAddress
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
