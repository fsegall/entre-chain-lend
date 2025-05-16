#!/bin/bash
mkdir -p build

# Baixar ptau se ainda não existir
if [ ! -f build/powersOfTau28_hez_final_10.ptau ]; then
  wget -O build/powersOfTau28_hez_final_10.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

# Compilar circuito
circom circuits/credit_score.circom --r1cs --wasm --sym -o build

# Setup da prova
snarkjs groth16 setup build/credit_score.r1cs build/powersOfTau28_hez_final_10.ptau build/credit_score.zkey
snarkjs zkey export verificationkey build/credit_score.zkey build/verification_key.json
