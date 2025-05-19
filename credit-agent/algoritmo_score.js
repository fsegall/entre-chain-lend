// Recebe os dados do usuário do nó anterior
let userData = $input.item.json[0];

// Verificação de segurança: se userData for undefined, cria um objeto vazio
if (!userData) {
  userData = {};
  console.log('Aviso: Dados do usuário não encontrados. Usando valores padrão.');
}

// Implementação do algoritmo de cálculo de score com verificações de segurança
function calculateCreditScore(userData) {
  let score = 500; // Score base
  
  // Fatores que podem aumentar o score (com verificações de segurança)
  if (userData.income && userData.income > 5000) score += 100;
  if (userData.employment_years && userData.employment_years > 2) score += 50;
  if (userData.has_property === true) score += 70;
  
  // Fatores que podem diminuir o score (com verificações de segurança)
  if (userData.has_debt === true) score -= 80;
  if (userData.payment_defaults && userData.payment_defaults > 0) score -= 100;
  
  // Garantir que o score esteja dentro dos limites (300-850)
  return Math.max(300, Math.min(850, score));
}

// Definir o threshold (limite mínimo para aprovação)
const threshold = 650;

// Calcular o score
const score = calculateCreditScore(userData);

// Verificar se passou no threshold
const passed = score >= threshold;

// Registrar informações para debug
console.log('Dados do usuário:', JSON.stringify(userData));
console.log('Score calculado:', score);
console.log('Threshold:', threshold);
console.log('Passou:', passed);

// Retornar o resultado
return {
  score: score,
  threshold: threshold,
  passed: passed
};
