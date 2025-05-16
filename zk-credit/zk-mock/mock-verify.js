const snarkjs = require("snarkjs");
const fs = require("fs");

async function main() {
  try {
    const vk = JSON.parse(fs.readFileSync("build/verification_key.json", "utf8"));
    const proof = JSON.parse(fs.readFileSync("build/proof.json", "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync("build/public.json", "utf8"));

    if (!proof || !vk || !publicSignals) {
      throw new Error("Arquivo JSON inválido ou vazio");
    }

    const result = await snarkjs.groth16.verify(vk, publicSignals, proof);

    console.log("Verificação (mock ZKVerify):", result ? "✅ válida" : "❌ inválida");
  } catch (err) {
    console.error("❌ Erro ao executar verificação local:", err.message);
  }
}

main();


