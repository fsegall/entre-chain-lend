# Análise Detalhada dos Requisitos do Fluxo de IA

## Objetivo Principal do Módulo Credit-Agent
- Calcular e entregar um score de crédito do usuário para a aplicação
- Automatizar o processo de análise de crédito usando n8n como plataforma de orquestração
- Facilitar a integração entre frontend/backend e o sistema de prova ZK

## Stack Tecnológico
- **n8n**: Plataforma de automação open-source para orquestração de fluxos
- **Supabase REST API**: Para acesso aos dados do usuário
- **Webhooks HTTP**: Para entrada e saída de dados
- **APIs externas**: (Opcional) Para consulta de score de crédito
- **Integração com IA/ML**: (Futuro) Para cálculo avançado do score

## Fluxo de Dados Esperado
1. Usuário cria perfil na plataforma ou solicita empréstimo
2. Supabase armazena os dados do perfil
3. N8N detecta novo perfil ou requisição via webhook
4. N8N busca dados do usuário (perfil, histórico, etc.) via Supabase
5. N8N calcula o score de crédito
6. N8N retorna JSON com resultado para frontend ou backend
7. O resultado aciona a geração da prova ZK
8. A prova ZK é verificada via Supabase

## Formato de Entrada/Saída JSON
- **Entrada**: Webhook com `user_id` ou dados do perfil
- **Saída**: JSON no formato:
  ```json
  {
    "score": 720,
    "threshold": 650,
    "passed": true
  }
  ```
- **Integração com zk-credit**: O output será usado como `input.json` para gerar prova ZK:
  ```json
  {
    "score": "720",
    "threshold": "650"
  }
  ```

## Requisitos de Privacidade e Segurança
- O `score` deve ser tratado como **variável temporária**
- Nunca deve ser salvo em campos públicos
- A única saída pública permitida é `passed = 1` dentro da prova ZK
- Dados sensíveis não devem ser expostos no fluxo

## Integração com Supabase
- Usar webhook para acionar o N8N com o `user_id`
- Consultar a tabela `profiles` diretamente via HTTP
- Opção de inserir score calculado em uma tabela `credit_scores` com FK para `profiles`

## Estrutura de Arquivos Esperada
```
credit-agent/
├── flows/
│   └── calculate_credit_score.json     # Export do fluxo N8N
├── docs/
│   └── fluxo-anotado.png               # Fluxograma explicativo
└── README.md
```

## Requisitos para Teste Local
1. Iniciar o N8N via Docker ou CLI
2. Importar o fluxo `calculate_credit_score.json` no editor visual
3. Testar o webhook via Postman ou diretamente do frontend

## Considerações para o Fluxo n8n
- Deve ser modular e facilmente configurável
- Precisa lidar com erros e exceções
- Deve ser documentado para facilitar manutenção
- Deve seguir boas práticas de segurança
- Deve ser otimizado para performance
