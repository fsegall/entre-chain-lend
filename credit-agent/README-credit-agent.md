# 🤖 credit-agent

Este módulo representa o agente automatizado de análise de crédito do MVP, implementado com o [n8n](https://n8n.io/). Ele é responsável por calcular o score de crédito do cliente com base nos dados do Supabase e emitir uma resposta que será usada para gerar provas de conhecimento zero no módulo `zk-credit`.

---

## 🧠 Visão Geral

```mermaid
graph TD
  A[Webhook de Entrada] --> B[Consulta Supabase (tabela: profiles)]
  B --> C[Cálculo do Score]
  C --> D[Formatação da Resposta]
  D --> E[Webhook de Saída]
  D --> F[Webhook para zk-credit]
```

---

## 📌 Webhook

- **Método**: `GET`
- **Endpoint**: `/webhook/credit-analysis`
- **Hospedagem**: `https://webhook.n8n.alifa.com.br/webhook/credit-analysis`
- **Exemplo de chamada**:

```bash
curl https://webhook.n8n.alifa.com.br/webhook/credit-analysis
```

---

## 📊 Lógica de Score

A lógica implementada no fluxo considera:

- `+100` se renda > 5000
- `+50` se tempo de emprego > 2 anos
- `+70` se possui imóvel
- `-80` se possui dívidas
- `-100` por inadimplências
- Score é normalizado entre 300 e 850
- Threshold mínimo: `650`

---

## 📤 Saídas

### 1. Resposta ao cliente

```json
{
  "score": 720,
  "threshold": 650,
  "passed": true
}
```

### 2. Payload para o módulo zk-credit

```json
{
  "score": "720",
  "threshold": "650"
}
```

---

## 📁 Conteúdo

- `workflow_hackathon.json`: arquivo do fluxo exportado do n8n

> Pode ser importado diretamente no painel do n8n para reuso ou edição.

---

## 🔗 Integração com zk-credit

O frontend do projeto consome a resposta deste agente, e então encaminha os dados recebidos para a função edge `credit-verify`, que gera a prova ZK e envia o commitment para a blockchain.

---

## ✅ Status

- [x] Workflow funcional hospedado
- [x] Conexão com Supabase
- [x] Envio de score para zk-credit
- [x] Testado com frontend + edge function