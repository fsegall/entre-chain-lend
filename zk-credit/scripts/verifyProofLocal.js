// zk-credit/scripts/verifyProofLocal.js

const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function main() {
  const vkPath = path.join(__dirname, "../build/verification_key.json");
  const proofPath = path.join(__dirname, "../build/proof.json");
  const publicPath = path.join(__dirname, "../build/public.json");

  const vk = JSON.parse(fs.readFileSync(vkPath));
  const proof = JSON.parse(fs.readFileSync(proofPath));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath));

  const res = await snarkjs.groth16.verify(vk, publicSignals, proof);

  console.log("\n🔎 Verificação local da prova:", res ? "✅ válida" : "❌ inválida");
}

main().catch((err) => {
  console.error("Erro ao verificar a prova:", err);
});