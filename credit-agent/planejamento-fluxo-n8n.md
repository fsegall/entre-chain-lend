# Planejamento do Fluxo n8n para Análise de Crédito

## Visão Geral do Fluxo

O fluxo n8n será estruturado para receber dados via webhook, processar a análise de crédito e retornar o resultado via webhook de saída. A integração com o Supabase permitirá acessar os dados do usuário necessários para o cálculo do score.

## Estrutura dos Nós do Fluxo

1. **Webhook de Entrada**
2. **Consulta ao Supabase**
3. **Processamento e Cálculo do Score**
4. **Formatação da Resposta**
5. **Webhook de Saída**

## Detalhamento dos Nós

### 1. Webhook de Entrada

Este nó será responsável por receber as solicitações de análise de crédito.

```json
{
  "name": "Webhook de Entrada",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "credit-analysis",
    "responseMode": "lastNode",
    "options": {
      "responseCode": 200
    }
  },
  "typeVersion": 1,
  "position": [
    250,
    300
  ]
}
```

**Formato de entrada esperado:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 2. Consulta ao Supabase

Este nó consultará os dados do usuário no Supabase usando o `user_id` recebido.

```json
{
  "name": "Consulta Supabase",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://[SUPABASE_PROJECT_ID].supabase.co/rest/v1/profiles",
    "method": "GET",
    "authentication": "headerAuth",
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "={{$env.SUPABASE_API_KEY}}"
        },
        {
          "name": "Authorization",
          "value": "Bearer ={{$env.SUPABASE_API_KEY}}"
        }
      ]
    },
    "queryParameters": {
      "parameters": [
        {
          "name": "id",
          "value": "={{$json.user_id}}"
        },
        {
          "name": "select",
          "value": "*"
        }
      ]
    }
  },
  "typeVersion": 1,
  "position": [
    450,
    300
  ]
}
```

### 3. Processamento e Cálculo do Score

Este nó utilizará um script JavaScript para calcular o score de crédito com base nos dados do usuário.

```json
{
  "name": "Cálculo do Score",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "// Recebe os dados do usuário do nó anterior\nconst userData = $input.item.json[0];\n\n// Implementação do algoritmo de cálculo de score\n// Este é um exemplo simplificado, deve ser adaptado conforme necessário\nfunction calculateCreditScore(userData) {\n  let score = 500; // Score base\n  \n  // Fatores que podem aumentar o score\n  if (userData.income > 5000) score += 100;\n  if (userData.employment_years > 2) score += 50;\n  if (userData.has_property) score += 70;\n  \n  // Fatores que podem diminuir o score\n  if (userData.has_debt) score -= 80;\n  if (userData.payment_defaults > 0) score -= 100;\n  \n  // Garantir que o score esteja dentro dos limites (300-850)\n  return Math.max(300, Math.min(850, score));\n}\n\n// Definir o threshold (limite mínimo para aprovação)\nconst threshold = 650;\n\n// Calcular o score\nconst score = calculateCreditScore(userData);\n\n// Verificar se passou no threshold\nconst passed = score >= threshold;\n\n// Retornar o resultado\nreturn {\n  score: score,\n  threshold: threshold,\n  passed: passed\n};"
  },
  "typeVersion": 1,
  "position": [
    650,
    300
  ]
}
```

### 4. Formatação da Resposta

Este nó garantirá que a resposta esteja no formato correto para o webhook de saída e para a integração com o zk-credit.

```json
{
  "name": "Formatação da Resposta",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "// Recebe o resultado do cálculo do score\nconst scoreResult = $input.item.json;\n\n// Formata a resposta para o webhook de saída\nconst webhookResponse = {\n  score: scoreResult.score,\n  threshold: scoreResult.threshold,\n  passed: scoreResult.passed\n};\n\n// Formata a resposta para integração com zk-credit\nconst zkCreditInput = {\n  score: String(scoreResult.score),\n  threshold: String(scoreResult.threshold)\n};\n\n// Retorna ambos os formatos\nreturn {\n  webhookResponse: webhookResponse,\n  zkCreditInput: zkCreditInput\n};"
  },
  "typeVersion": 1,
  "position": [
    850,
    300
  ]
}
```

### 5. Webhook de Saída

Este nó enviará o resultado para o endpoint especificado pelo Lovable.

```json
{
  "name": "Webhook de Saída",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "={{$env.LOVABLE_WEBHOOK_URL}}",
    "method": "POST",
    "authentication": "none",
    "jsonParameters": true,
    "bodyParametersJson": "={{ JSON.stringify($json.webhookResponse) }}"
  },
  "typeVersion": 1,
  "position": [
    1050,
    300
  ]
}
```

## Configuração de Variáveis de Ambiente

Para que o fluxo funcione corretamente, é necessário configurar as seguintes variáveis de ambiente no n8n:

- `SUPABASE_PROJECT_ID`: ID do projeto Supabase
- `SUPABASE_API_KEY`: Chave de API do Supabase
- `LOVABLE_WEBHOOK_URL`: URL do webhook de saída do Lovable

## Considerações de Segurança

1. **Proteção de Dados Sensíveis**:
   - O score de crédito é tratado como variável temporária
   - Não é armazenado em campos públicos
   - Apenas o resultado "passed" é exposto publicamente

2. **Autenticação**:
   - Utiliza autenticação via API Key para acesso ao Supabase
   - Recomenda-se adicionar autenticação ao webhook de entrada em ambiente de produção

3. **Tratamento de Erros**:
   - Adicionar nós de tratamento de erro para lidar com falhas na API do Supabase
   - Implementar validação dos dados de entrada

## Fluxo Completo em JSON

O arquivo JSON completo do fluxo estará disponível em `flows/calculate_credit_score.json` e poderá ser importado diretamente no n8n.
