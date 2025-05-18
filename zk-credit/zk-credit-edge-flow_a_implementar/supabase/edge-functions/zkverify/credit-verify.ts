import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { generateProofAndHash } from "./generateProofAndHash.ts";

serve(async (req) => {
  try {
    const { score, threshold } = await req.json();

    if (!score || !threshold) {
      return new Response(JSON.stringify({ error: "Parâmetros ausentes" }), {
        status: 400,
      });
    }

    const result = await generateProofAndHash({ score, threshold });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Erro na função de prova:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
    });
  }
});