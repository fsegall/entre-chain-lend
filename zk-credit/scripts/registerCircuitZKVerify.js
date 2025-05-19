// zk-credit/scripts/registerCircuitZKVerify.js
const fs = require("fs");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.ZKVERIFY_API_KEY || "23b1af4eb571412495b91970eef7201c";
const ZKVERIFY_URL = "https://testnet.api.zkverify.com/circuits";

const verificationKey = JSON.parse(fs.readFileSync("build/verification_key.json", "utf-8"));

const payload = {
  name: "credit_score_v1",
  protocol: "groth16",
  curve: "bn128",
  verificationKey
};

async function registerCircuit() {
  try {
    const res = await fetch(ZKVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log("✅ Circuito registrado:", result);
  } catch (error) {
    console.error("❌ Erro ao registrar circuito:", error);
  }
}

registerCircuit();