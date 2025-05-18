import { groth16 } from "npm:snarkjs";
import { poseidon } from "npm:circomlibjs";

export async function generateProofAndHash(input: { score: string; threshold: string }) {
  const inputJson = input;

  const wasmPath = "zk-credit/build/credit_score_js/credit_score.wasm";
  const zkeyPath = "zk-credit/build/credit_score.zkey";

  const wasm = await Deno.readFile(wasmPath);
  const zkey = await Deno.readFile(zkeyPath);

  const { proof, publicSignals } = await groth16.fullProve(inputJson, wasm, zkey);

  const hash = poseidon([BigInt(publicSignals[0])]);
  const zkCommitmentHash = "0x" + BigInt(hash).toString(16);

  return {
    zkCommitmentHash,
    proof,
    publicSignals,
  };
}