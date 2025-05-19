const fs = require("fs");
const fetch = require("node-fetch");

const ZKVERIFY_URL = "zkverify-testnet.api.subscan.io"; // Atualize se necessário
const CIRCUIT_ID = "seu-circuit-id-aqui"; // Substitua pelo ID real
const API_KEY = process.env.ZKVERIFY_API_KEY || "23b1af4eb571412495b91970eef7201c";

async function submitProof() {
  try {
    const proof = JSON.parse(fs.readFileSync("build/proof.json", "utf-8"));
    const publicSignals = JSON.parse(fs.readFileSync("build/public.json", "utf-8"));

    const payload = {
      circuitId: CIRCUIT_ID,
      proof,
      publicSignals,
    };

    const res = await fetch(ZKVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("✅ Resposta da ZKVerify:", result);
  } catch (err) {
    console.error("❌ Erro ao enviar prova:", err);
  }
}

submitProof();
