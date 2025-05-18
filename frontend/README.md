# 🖥️ Módulo `frontend/` — Interface React + Viem

Este módulo é a interface principal do usuário para a plataforma `entre-chain-lend`. Ele permite que empreendedores solicitem empréstimos, investidores visualizem oportunidades e todos interajam com contratos inteligentes de forma integrada com Supabase e provas ZK.

---

## ⚙️ Tecnologias Utilizadas

- [React](https://reactjs.org/) com TypeScript
- [Viem](https://viem.sh/) para interações Web3 (smart contracts)
- [ShadCN/UI](https://ui.shadcn.dev/) para design system
- [Supabase JS SDK](https://supabase.com/docs/guides/api) para autenticação, banco e edge functions
- [TailwindCSS](https://tailwindcss.com/) para estilização
- Integração futura com `ZKVerify` via edge function
- Recepção de score do agente `N8N`

---

## 📁 Estrutura

```
src/
├── components/          # Componentes UI e páginas funcionais
├── hooks/               # Lógica de conexão, auth e Web3
├── integrations/        # Conexão com Supabase
├── lib/                 # Funções auxiliares (blockchain, utils)
├── pages/               # Rotas principais (Signup, Dashboard, etc)
├── services/            # Serviços específicos (wallet, auth)
└── utils/               # Helpers globais
```

---

## 🧠 Fluxos Principais

### Cadastro e Autenticação
- Usuário conecta sua carteira com `ConnectWalletButton.tsx`
- Autenticação é feita via Supabase Auth + Wallet Auth
- Perfil é salvo na tabela `profiles` (Supabase)

### Solicitação de Empréstimo
- Empreendedor preenche formulário na UI
- Os dados são enviados para o banco Supabase
- Em paralelo, o score de crédito será gerado (via N8N) e enviado de volta ao front

### Análise com Prova ZK
- O score recebido é usado para gerar uma prova com `zk-credit` (wasm + zkey)
- A prova é enviada via fetch para a Edge Function `verifyCreditProof`
- O resultado (válido ou não) determina a exibição do botão "Solicitar financiamento"

### Financiamento (Viem)
- Usuário investidor visualiza oportunidades
- Ao clicar em financiar, é feita uma chamada Viem para o contrato inteligente

---

## 🔗 Integrações

| Serviço         | Descrição |
|----------------|-----------|
| Supabase        | Auth, banco, edge functions |
| zk-credit       | Geração de provas ZK (local) |
| ZKVerify        | Verificação via API externa |
| N8N             | Análise e envio de score para o front |
| Viem + contrato | Interação com smart contract via Ethereum testnet |

---

## 📦 Scripts úteis

```bash
npm run dev         # Inicia app localmente
npm run build       # Build para produção
npm run lint        # Lint com eslint
```

---

## 📌 Observações

- Os arquivos `.wasm` e `.zkey` devem ser hospedados em local acessível (ou incluídos via import dinâmico)
- O `threshold` é configurável por contrato ou fixado no frontend
- A UI está preparada para alternar entre `empreendedor` e `financiador` com `RoleSwitcher`

---

## 🔒 Privacidade

O frontend nunca exibe o score real do usuário. Apenas mostra se a prova ZK foi considerada válida (`passed = 1`) pelo verificador.

---

> Desenvolvido como parte do MVP entre-chain-lend por Felipe Segall