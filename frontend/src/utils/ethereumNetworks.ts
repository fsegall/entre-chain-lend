
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

// Define the Sepolia network configuration
export const SEPOLIA_NETWORK: EthereumNetwork = {
  chainId: '0xaa36a7',
  chainIdDecimal: 11155111,
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Default network for the application
export const DEFAULT_NETWORK = EPHEMERY_NETWORK;

// Define all supported networks
export const SUPPORTED_NETWORKS = [
  EPHEMERY_NETWORK,
  SEPOLIA_NETWORK
];

// Define all supported chain IDs for Ephemery
export const EPHEMERY_CHAIN_IDS = [
  '0x53a',           // Hex format (0x53a)
  '0x000053a',       // Padded hex format
  '0x0000053a',      // Alternative padding
  '1338',            // Decimal string
  1338,              // Decimal number
  '0x259c741',       // Alternative ID
];

// Define all supported chain IDs for Sepolia
export const SEPOLIA_CHAIN_IDS = [
  '0xaa36a7',        // Hex format
  '0x00aa36a7',      // Padded hex format
  '11155111',        // Decimal string
  11155111,          // Decimal number
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

// Check if the current chain ID is Sepolia network
export const isSepoliaNetwork = (chainId: string | number): boolean => {
  const chainIdStr = chainId.toString().toLowerCase();
  
  if (!chainIdStr.startsWith('0x') && !isNaN(Number(chainIdStr))) {
    const decimalValue = Number(chainIdStr);
    const hexValue = `0x${decimalValue.toString(16)}`;
    return SEPOLIA_CHAIN_IDS.some(id => 
      id.toString().toLowerCase() === chainIdStr || 
      id.toString().toLowerCase() === hexValue
    );
  }
  
  return SEPOLIA_CHAIN_IDS.some(id => 
    id.toString().toLowerCase() === chainIdStr
  );
};

// Check if the current chain ID is any supported network
export const isSupportedNetwork = (chainId: string | number): boolean => {
  return isEphemeryNetwork(chainId) || isSepoliaNetwork(chainId);
};

// Get network configuration from chain ID
export const getNetworkFromChainId = (chainId: string | number): EthereumNetwork | null => {
  if (isEphemeryNetwork(chainId)) {
    return EPHEMERY_NETWORK;
  } else if (isSepoliaNetwork(chainId)) {
    return SEPOLIA_NETWORK;
  }
  return null;
};
