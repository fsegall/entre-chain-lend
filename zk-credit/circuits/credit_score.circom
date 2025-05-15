template CreditScoreCheck() {
    // Entradas privadas
    signal input score;

    // Entradas públicas
    signal input threshold;
    signal output passed;

    // Lógica: passou no score?
    passed <== score >= threshold;
}

component main = CreditScoreCheck();
