# 🗄️ Módulo `supabase/` — Backend com Postgres, Auth e Edge Functions 

Este módulo representa o backend completo da aplicação, utilizando a stack do Supabase com PostgreSQL, autenticação Web3, políticas RLS e funções serverless.

---

## 🧱 Estrutura

```
supabase/
├── config.toml                    # Configurações do projeto Supabase CLI
├── edge-functions/               # Funções serverless com suporte a blockchain/ZK
│   └── blockchain/
│       ├── evm/
│       │   └── loan.ts           # Futuro: validação de empréstimos
│       └── zkverify/
│           └── verifyCreditProof.ts
├── functions/                    # Funções Supabase Functions (Auth, JWT, etc)
│   └── wallet-auth/
│       └── index.ts
├── migrations/                   # Scripts SQL para estrutura, roles e RLS
│   ├── 20240315000000_role_security_trigger.sql
│   ├── 20240315000000_user_roles_setup.sql
│   ├── 20240315000001_initial_admin_function.sql
│   ├── 20240315000002_profiles_rls.sql
│   └── combined_role_security.sql
└── README.md
```

---

## 🔐 Autenticação Web3

A função `wallet-auth/index.ts` permite que usuários se autentiquem conectando sua carteira. Ela gera JWTs e insere o perfil na tabela `profiles` com papel (`role`) adequado:

- `empreendedor`
- `financiador`
- `admin`

A role define permissões nas views e ações via RLS.

---

## 🧮 Tabelas principais (com base nos schemas fornecidos)

### `profiles`
| Campo        | Tipo      | Notas                |
|--------------|-----------|----------------------|
| id           | uuid      | Primary key (user_id)|
| wallet       | text      | Endereço da carteira |
| role         | text      | empreendedor, etc.   |
| created_at   | timestamp |                      |

### `loan_requests`
| Campo        | Tipo      | Notas                  |
|--------------|-----------|------------------------|
| id           | uuid      | Primary key            |
| profile_id   | uuid      | FK para `profiles.id`  |
| amount       | numeric   |                        |
| reason       | text      |                        |
| status       | text      | pending, funded, etc   |

---

## 🧪 Edge Function: Verificação ZK

**`verifyCreditProof.ts`**:
- Recebe JSON com `{ proof, publicSignals }`
- Usa API do ZKVerify com chave secreta
- Retorna `{ valid: true/false }`

Configuração:

```ts
headers: {
  "x-api-key": Deno.env.get("ZKVERIFY_API_KEY")
}
```

Essa função é consumida pelo frontend após gerar a prova com `zk-credit`.

---

## 🔐 RLS e Migrations

O diretório `migrations/` contém:

- Criação de roles
- Triggers para segurança
- Configuração de RLS nas tabelas sensíveis (`profiles`, `loan_requests`)
- Garantia de acesso apenas ao próprio perfil

---

## 📥 Integração com `credit-agent`

O agente N8N pode:
- Ler dados da tabela `profiles`
- Consultar histórico do usuário
- Inserir score calculado em uma tabela `credit_scores` (ou retornar via webhook)
- Acionar uma função HTTP para gerar prova ZK automaticamente

---

## 📦 Supabase CLI

Comandos úteis:

```bash
supabase login
supabase start
supabase link --project-ref <ref>
supabase functions deploy verifyCreditProof
```

---

## 🧠 Observações

- As funções edge usam Deno, não Node.js
- As secrets (chaves de API) são gerenciadas no painel do Supabase
- Os dados do usuário são protegidos por políticas RLS personalizadas

---

> Desenvolvido como parte do MVP entre-chain-lend por Felipe Segall
