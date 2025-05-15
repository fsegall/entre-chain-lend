
# ZK Credit Score Verification

This directory contains the implementation for zero-knowledge credit score verification.

The system allows users to prove they meet certain credit score thresholds without revealing their exact score.

## Structure

- `circuits/`: Contains the circom circuits for ZK proofs
- `scripts/`: Utility scripts for building and testing
- `input/`: Sample input data for testing the circuits
- `zk-mock/`: Mock implementation for development

## Development

For local development, you can use the mock implementation:
```javascript
import mockVerify from '../zk-mock/mock-verify';

// Test the verification
const result = mockVerify({ score: 750 });
console.log(result); // { success: true, verified: true, score: 750, message: "Mock verification successful" }
```

## Production

In production, replace the mock with actual ZK proof verification using the Supabase Edge Function.
