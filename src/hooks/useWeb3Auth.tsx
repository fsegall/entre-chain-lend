
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3AuthModalPack, Web3AuthConfig } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Define the Web3Auth context type
interface Web3AuthContextType {
  web3AuthPack: Web3AuthModalPack | null;
  provider: IProvider | null;
  address: string;
  isConnected: boolean;
  isInitializing: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  formatAddress: (address: string) => string;
}

// Create the context with undefined default value
const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

// Web3Auth configuration
const web3AuthConfig: Web3AuthConfig = {
  clientId: 'BEXt8ZqSKGKUINb_xaUK3GFGjm7CJqWoUjD5zHl8iiztYgXXcK6-pqyIMaIy9QXQ95LJK1wtXBGXlHO4BIWKJO0', // Public Auth0 client ID
  web3AuthNetwork: 'sapphire_devnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x1', // Ethereum mainnet
    rpcTarget: 'https://rpc.ankr.com/eth',
  },
  uiConfig: {
    theme: 'light',
    loginMethodsOrder: ['google', 'facebook', 'twitter', 'discord', 'github', 'email_passwordless'],
    appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
    defaultLanguage: 'en',
    modalZIndex: '2147483647',
    primaryButton: 'socialLogin',
  },
};

export const Web3AuthProvider = ({ children }: { children: ReactNode }) => {
  const [web3AuthPack, setWeb3AuthPack] = useState<Web3AuthModalPack | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const { connectWallet, user } = useAuth();

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig: web3AuthConfig.chainConfig },
        });

        const web3AuthModalPack = new Web3AuthModalPack({
          web3AuthConfig,
          privateKeyProvider,
        });

        await web3AuthModalPack.init();
        setWeb3AuthPack(web3AuthModalPack);

        // Check if user is already logged in
        if (web3AuthModalPack.provider) {
          const ethersProvider = new ethers.BrowserProvider(web3AuthModalPack.provider as any);
          const signer = await ethersProvider.getSigner();
          const userAddress = await signer.getAddress();
          
          setAddress(userAddress);
          setProvider(web3AuthModalPack.provider);
          setIsConnected(true);
          
          // Update Supabase profile if user is authenticated
          if (user) {
            await connectWallet(userAddress);
          }
        }
        
        setIsInitializing(false);
      } catch (error: any) {
        console.error("Error initializing Web3Auth:", error);
        toast.error("Failed to initialize wallet connection");
        setIsInitializing(false);
      }
    };

    init();
  }, [connectWallet, user]);

  // Connect wallet
  const connect = async () => {
    if (!web3AuthPack) {
      toast.error("Web3Auth not initialized");
      return;
    }

    try {
      toast.loading("Connecting to wallet...");
      
      // Open the Web3Auth modal for authentication
      await web3AuthPack.connectToWallet();
      
      // Get provider and user info after successful authentication
      const ethersProvider = new ethers.BrowserProvider(web3AuthPack.provider as any);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();
      
      setAddress(userAddress);
      setProvider(web3AuthPack.provider);
      setIsConnected(true);
      
      // Update Supabase profile if user is authenticated
      if (user) {
        await connectWallet(userAddress);
      }
      
      toast.dismiss();
      toast.success("Wallet connected successfully");
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    if (!web3AuthPack) {
      return;
    }

    try {
      await web3AuthPack.disconnectWallet();
      setProvider(null);
      setAddress('');
      setIsConnected(false);
      toast.success("Wallet disconnected");
    } catch (error: any) {
      console.error("Error disconnecting wallet:", error);
      toast.error(error.message || "Failed to disconnect wallet");
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Web3AuthContext.Provider
      value={{
        web3AuthPack,
        provider,
        address,
        isConnected,
        isInitializing,
        connect,
        disconnect,
        formatAddress
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};

// Hook to use the Web3Auth context
export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider");
  }
  return context;
};
