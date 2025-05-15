
// Define types for network information
export type EthereumNetwork = {
  chainId: string;
  chainIdDecimal: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

// Define the Ephemery network configuration
export const EPHEMERY_NETWORK: EthereumNetwork = {
  chainId: '0x53a',
  chainIdDecimal: 1338,
  chainName: 'Ephemery Testnet',
  nativeCurrency: {
    name: 'Ephemery ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://ephemery.dev/'],
  blockExplorerUrls: ['https://explorer.ephemery.dev/'],
};

// Define all supported chain IDs for Ephemery
// Support multiple formats that wallets might return
export const EPHEMERY_CHAIN_IDS = [
  '0x53a',           // Hex format (0x53a)
  '0x000053a',       // Padded hex format
  '0x0000053a',      // Alternative padding
  '1338',            // Decimal string
  1338,              // Decimal number
  '0x259c741',       // Alternative ID
];

// Check if the current chain ID is one of our supported chain IDs
export const isEphemeryNetwork = (chainId: string | number): boolean => {
  // Convert number to string for comparison
  const chainIdStr = chainId.toString().toLowerCase();
  
  // If the chainId is a numeric string without 0x prefix, try both formats
  if (!chainIdStr.startsWith('0x') && !isNaN(Number(chainIdStr))) {
    // Check both decimal and hex equivalent
    const decimalValue = Number(chainIdStr);
    const hexValue = `0x${decimalValue.toString(16)}`;
    return EPHEMERY_CHAIN_IDS.some(id => 
      id.toString().toLowerCase() === chainIdStr || 
      id.toString().toLowerCase() === hexValue
    );
  }
  
  return EPHEMERY_CHAIN_IDS.some(id => 
    id.toString().toLowerCase() === chainIdStr
  );
};
