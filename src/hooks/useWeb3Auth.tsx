
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Ensure Buffer is available globally
import { Buffer as BufferPolyfill } from 'buffer';
// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || BufferPolyfill;
}

// Define the Web3Auth context type
interface Web3AuthContextType {
  web3Auth: Web3Auth | null;
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
const web3AuthOptions = {
  clientId: 'BEXt8ZqSKGKUINb_xaUK3GFGjm7CJqWoUjD5zHl8iiztYgXXcK6-pqyIMaIy9QXQ95LJK1wtXBGXlHO4BIWKJO0', // Public Auth0 client ID
  // Using string literal for network since OPENLOGIN_NETWORK is not exported
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
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const { connectWallet, user } = useAuth();

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing Web3Auth...");
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig: web3AuthOptions.chainConfig },
        });

        const web3AuthInstance = new Web3Auth({
          clientId: web3AuthOptions.clientId,
          web3AuthNetwork: web3AuthOptions.web3AuthNetwork as any,
          chainConfig: web3AuthOptions.chainConfig,
          uiConfig: web3AuthOptions.uiConfig as any,
          privateKeyProvider: privateKeyProvider,
        });

        // Using a simplified modalConfig that matches the expected type
        await web3AuthInstance.initModal({
          modalConfig: {
            [web3AuthOptions.web3AuthNetwork]: {
              displayName: "Web3Auth Network",
              buildEnv: "production",
            }
          } as any // Use type assertion to bypass the type checking issues
        });
        
        console.log("Web3Auth initialized successfully");
        setWeb3Auth(web3AuthInstance);

        // Check if user is already logged in
        if (web3AuthInstance.provider) {
          console.log("Provider already exists, user might be logged in");
          const ethersProvider = new ethers.BrowserProvider(web3AuthInstance.provider as any);
          const signer = await ethersProvider.getSigner();
          const userAddress = await signer.getAddress();
          
          console.log("User is logged in with address:", userAddress);
          setAddress(userAddress);
          setProvider(web3AuthInstance.provider as any);
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
    if (!web3Auth) {
      toast.error("Web3Auth not initialized");
      return;
    }

    try {
      toast.loading("Connecting to wallet...");
      
      // Open the Web3Auth modal for authentication
      const web3authProvider = await web3Auth.connect();
      
      // Get provider and user info after successful authentication
      if (web3authProvider) {
        const ethersProvider = new ethers.BrowserProvider(web3authProvider as any);
        const signer = await ethersProvider.getSigner();
        const userAddress = await signer.getAddress();
        
        setAddress(userAddress);
        setProvider(web3authProvider as any);
        setIsConnected(true);
        
        // Update Supabase profile if user is authenticated
        if (user) {
          await connectWallet(userAddress);
        }
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
    if (!web3Auth) {
      return;
    }

    try {
      await web3Auth.logout();
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
        web3Auth,
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
