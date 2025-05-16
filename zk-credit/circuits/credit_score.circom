pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";

template CreditScoreCheck() {
    signal input score;      // privado
    signal input threshold;  // público
    signal output passed;    // público

    component isGreaterEq = GreaterEqThan(16);
    isGreaterEq.in[0] <== score;
    isGreaterEq.in[1] <== threshold;
    passed <== isGreaterEq.out;
}

component main = CreditScoreCheck();