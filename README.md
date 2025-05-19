# 🤝 entre-chain-lend — MVP de Plataforma Descentralizada de Empréstimos com ZK Proofs ###[`Ler no GitHub Pages`](https://fsegall.github.io/the_lenders/)

Este projeto é um MVP para uma plataforma que conecta pequenos empreendedores a financiadores, utilizando contratos inteligentes, provas ZK de análise de crédito e verificação de elegibilidade com preservação de privacidade. 

---

## 🧱 [`Arquitetura Modular`](Arquitetura.png)

| Módulo             | Descrição |
|--------------------|-----------|
| [`frontend/`](README-frontend.md) | Aplicação React que permite criação de pedidos e visualização de oportunidades de empréstimo. Integra com contratos e Supabase. |
| [`zk-credit/`](README-zk-credit.md)      | Circuitos Circom e provas ZK para comprovar score de crédito ≥ threshold sem revelar o valor. |
| [`supabase/`](README-supabase.md)        | Backend com banco de dados PostgreSQL, autenticação Web3 e edge functions para verificação (incluindo ZKVerify). |
| [`foundry/`](README-foundry.md)         | Contrato inteligente de empréstimo. Desenvolvimento, testes e deploy com Foundry. |
| [`credit-agent/`](README-credit-agent.md)    | (A ser adicionado) Agente de análise de crédito usando N8N, responsável por calcular o score a partir de dados e retornar ao app. |

---

## 🔁 Fluxo da Plataforma

1. O empreendedor se cadastra e solicita um empréstimo.
2. O agente `credit-agent` calcula o `score` e envia ao frontend.
3. O frontend gera a prova ZK (`zk-credit`) localmente.
4. A prova é enviada para a `Edge Function` no Supabase.
5. A Edge Function usa o `ZKVerify` para verificar a validade da prova.
6. Empréstimos são registrados no contrato (via módulo `foundry`).
7. Supabase registra todas as ações e estados da aplicação.

---

## 🧪 Módulo ZK: zk-credit

Veja a [documentação do módulo zk-credit](README-zk-credit.md) para:

- Compilação de circuitos
- Geração de provas
- Verificação local e mock de ZKVerify

---

## ⚙️ [`Supabase`](er_diagram.png)

A estrutura de banco de dados inclui:

- Tabela `profiles` com controle de papeis
- Autenticação com carteiras Web3
- Regras RLS configuradas via `migrations/`

Scripts de funções e edge functions estão em:
```
supabase/
├── functions/         # Funções autenticadas
├── edge-functions/    # Funções blockchain + ZKVerify
├── migrations/        # SQL das estruturas e RLS
```

---

## 🤖 credit-agent (análise de crédito com N8N)

Este módulo será responsável por:

- Acessar dados relevantes (KYC, transações, perfil)
- Calcular o `score` de forma automatizada
- Enviar o score para a interface do app ou backend
- Integrar com webhook ou Supabase REST para persistência

---

## 📦 Contrato Inteligente (Foundry)

O módulo a ser incluído em `foundry/` conterá:

- Contrato para registro e fluxo de empréstimo
- Verificação de elegibilidade via ZK
- Controle de reembolso e juros
- Testes automatizados com forge

---

## 🛠️ Stack Utilizada

- React + Viem
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Circom + snarkjs
- ZKVerify (via API externa)
- Foundry (Solidity)
- N8N (automação com agentes)

---

## [`🧪 Como contribuir`](roadmap.md)

Clone o projeto, instale as dependências em cada módulo, e siga os respectivos READMEs. Cada módulo é autônomo, mas se comunica com os demais via APIs, contratos e banco.

---

## 🧠 Autores

Desenvolvido por **Felipe Segall**, **Fêlix Rock Rodrigues**, **Paulo Marinato** para o ZK Hackathon com foco em soluções de impacto social e privacidade.
