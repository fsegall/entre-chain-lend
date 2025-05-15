#!/bin/bash
set -e

cd "$(dirname "$0")/.."

circom circuits/credit_score.circom --r1cs --wasm --sym -o build

snarkjs groth16 setup build/credit_score.r1cs powersOfTau28_hez_final_10.ptau build/credit_score.zkey

snarkjs zkey export verificationkey build/credit_score.zkey build/verification_key.json

snarkjs groth16 prove build/credit_score.zkey input/input.json build/proof.json build/public.json
