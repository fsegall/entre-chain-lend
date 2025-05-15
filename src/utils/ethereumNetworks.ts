
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
// Some wallets might show different chain IDs for the same network
export const EPHEMERY_CHAIN_IDS = ['0x53a', '0x259c741']; // 1338 in decimal and alternative ID

// Check if the current chain ID is one of our supported chain IDs
export const isEphemeryNetwork = (chainId: string): boolean => {
  return EPHEMERY_CHAIN_IDS.includes(chainId);
};
