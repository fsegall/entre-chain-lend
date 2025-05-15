// File: supabase/functions/verifyCreditProof.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  try {
    const { proof, publicSignals } = await req.json();

    const response = await fetch("https://api.zkverify.com/api/v1/proof/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ZKVERIFY_API_KEY") // configure in Supabase dashboard
      },
      body: JSON.stringify({
        backend: "groth16",
        proof,
        publicSignals,
        verificationKey: {
          source: "url",
          url: "https://<your-public-url>/verification_key.json"
        }
      })
    });

    const result = await response.json();

    return new Response(JSON.stringify({
      valid: result?.valid,
      details: result
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Erro ao verificar prova",
      details: error.message
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});