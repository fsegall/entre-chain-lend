
// This file contains mock implementation for ZK verification
// It can be used during development to test the UI
const mockVerify = (input) => {
  return {
    success: true,
    verified: true,
    score: 750,
    message: "Mock verification successful"
  };
};

export default mockVerify;
