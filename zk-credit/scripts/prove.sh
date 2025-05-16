#!/bin/bash
cd build
snarkjs groth16 prove credit_score.zkey ../input/input.json proof.json public.json
