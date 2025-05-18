# 🔐 Módulo `zk-credit/` — Provas ZK para Análise de Crédito

Este módulo contém os circuitos Circom, scripts e ferramentas para gerar, provar e verificar provas ZK (Zero-Knowledge Proofs) usadas no processo de análise de crédito. Ele permite comprovar que um score privado atende a um critério mínimo **sem revelar o valor real**.

---

## 🎯 Objetivo

Provar que um usuário possui `score >= threshold` usando provas Groth16 via Circom e SnarkJS, com saída pública `passed = 1`, validada pela plataforma (localmente ou via ZKVerify).

---

## ⚙️ Stack

- [Circom](https://docs.circom.io/)
- [SnarkJS](https://github.com/iden3/snarkjs)
- [ZKVerify](https://zkverify.io/)
- Supabase (via Edge Function)
- Web3 Frontend (importação .wasm e .zkey)

---

## 📁 Estrutura

```
zk-credit/
├── circuits/
│   └── credit_score.circom
├── input/
│   └── input.json
├── build/
│   ├── credit_score.r1cs
│   ├── credit_score.zkey
│   ├── verification_key.json
│   ├── proof.json
│   ├── public.json
│   ├── witness.wtns
│   └── credit_score_js/
│       ├── credit_score.wasm
│       └── generate_witness.js
├── scripts/
│   ├── setup.sh
│   └── prove.sh
├── zk-mock/
│   └── mock-verify.js
└── README.md
```

---

## 🧩 Circuito ZK: `credit_score.circom`

```circom
include "circomlib/circuits/comparators.circom";

template CreditScoreCheck() {
    signal input score;
    signal input threshold;
    signal output passed;

    component cmp = GreaterEqThan(16);
    cmp.in[0] <== score;
    cmp.in[1] <== threshold;
    passed <== cmp.out;
}
component main = CreditScoreCheck();
```

---

## 🛠️ Como usar

### 1. Setup completo

```bash
./scripts/setup.sh
```

### 2. Gerar prova

```bash
./scripts/prove.sh
```

### 3. Verificar localmente (snarkjs)

```bash
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
```

### 4. Verificação via código

```bash
node zk-mock/mock-verify.js
```

---

## ⚙️ Scripts Disponíveis

### 🔧 Setup inicial

```bash
npm run setup
```

> Executa o Powers of Tau e gera os arquivos de chave de verificação.

---

### ⚙️ Compilar circuito

```bash
npm run compile
```

> Gera os arquivos `.wasm`, `.r1cs` e `.sym` a partir do `.circom`.


> Executa `scripts/generateProofAndHash.js` para gerar:
>
> - Prova (`proof.json`)

### 🧪 Gerar prova ZK com hash de commitment

```bash
npm run generate
```

> Executa `scripts/generateProofAndHash.js` para gerar:
>
> - Prova (`proof.json`)
> - Sinais públicos (`public.json`)
> - Witness (`witness.wtns`)
> - Hash do commitment ZK

---

### ✅ Verificar prova localmente (mock ZKVerify)

```bash
npm run verify
```

> Executa `zk-mock/mock-verify.js` usando o `verification_key.json`.

---

## 🧪 Teste com entrada

```json
{
  "score": "720",
  "threshold": "650"
}
```

- Prova: `proof.json`
- Entrada pública: `["650", "1"]` → passou

---

## 📤 Integração com Frontend

O frontend:
- Gera prova via `snarkjs.groth16.fullProve(...)`
- Envia a prova e os publicSignals para Supabase
- Recebe `{ valid: true/false }` da Edge Function

---

## 🔒 Privacidade

- `score` é privado e não revelado
- Apenas `threshold` e `passed` são públicos

---

> Desenvolvido como parte do MVP entre-chain-lend por Felipe Segall