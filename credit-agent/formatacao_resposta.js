// Recebe o resultado do cálculo do score
const scoreResult = $input.item.json;

// Formata a resposta para o webhook de saída
const webhookResponse = {
  score: scoreResult.score,
  threshold: scoreResult.threshold,
  passed: scoreResult.passed
};

// Formata a resposta para integração com zk-credit
const zkCreditInput = {
  score: String(scoreResult.score),
  threshold: String(scoreResult.threshold)
};

// Retorna ambos os formatos
return {
  webhookResponse: webhookResponse,
  zkCreditInput: zkCreditInput
};