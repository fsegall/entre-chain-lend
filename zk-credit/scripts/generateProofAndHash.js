const snarkjs = require("snarkjs");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const inputFile = path.join(__dirname, "../input/input.json");
const wasmPath = path.join(__dirname, "../build/credit_score_js/credit_score.wasm");
const zkeyPath = path.join(__dirname, "../build/credit_score.zkey");
const witnessPath = path.join(__dirname, "../build/witness.wtns");
const proofPath = path.join(__dirname, "../build/proof.json");
const publicPath = path.join(__dirname, "../build/public.json");

async function main() {
  // 1. Carregar input
  const input = JSON.parse(fs.readFileSync(inputFile));
  console.log("⏳ Gerando prova para:", input);

  // 2. Gerar witness
  const wc = require("../build/credit_score_js/witness_calculator.js");
  const wasmBuffer = fs.readFileSync(wasmPath);
  const witnessCalculatorBuilder = await wc;
  const witnessCalculator = await witnessCalculatorBuilder(wasmBuffer);
  const witness = await witnessCalculator.calculateWTNSBin(input, 0);
  fs.writeFileSync(witnessPath, witness);

  // 3. Gerar prova
  const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyPath, witnessPath);
  fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
  fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

  // 4. Calcular commitment hash (SHA-256)
  const publicString = publicSignals.join(",");
  const hash = crypto.createHash("sha256").update(publicString).digest("hex");
  const commitment = "0x" + hash;

  console.log("\n✅ Prova gerada com sucesso!");
  console.log("📄 zkCommitmentHash:", commitment);
}

main().catch((err) => {
  console.error("Erro ao gerar prova:", err);
});