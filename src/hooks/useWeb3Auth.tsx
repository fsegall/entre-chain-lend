import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Define the Web3Auth context type
interface Web3AuthContextType {
  provider: ethers.BrowserProvider | null;
  address: string;
  isConnected: boolean;
  isInitializing: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  formatAddress: (address: string) => string;
  configError: string | null;
  domainError: boolean;
}

// Create the context with undefined default value
const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const Web3AuthProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<boolean>(false);
  const { connectWallet, user } = useAuth();

  // Check if MetaMask is installed
  const checkMetaMask = () => {
    if (typeof window.ethereum === 'undefined') {
      setConfigError('MetaMask is not installed. Please install MetaMask to use this feature.');
      return false;
    }
    return true;
  };

  // Initialize and check connection
  useEffect(() => {
    const init = async () => {
      try {
        if (!checkMetaMask()) {
          setIsInitializing(false);
          return;
        }

        // Check if already connected
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setProvider(provider);
          setAddress(accounts[0].address);
          setIsConnected(true);
          
          // Update Supabase profile if user is authenticated
          if (user) {
            await connectWallet(accounts[0].address);
          }
        }
      } catch (error: any) {
        console.error("Error initializing wallet:", error);
        setConfigError(error.message || "Failed to initialize wallet");
      } finally {
        setIsInitializing(false);
      }
    };

    init();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Update Supabase profile if user is authenticated
          if (user) {
            await connectWallet(accounts[0]);
          }
        } else {
          setProvider(null);
          setAddress('');
          setIsConnected(false);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [connectWallet, user]);

  // Connect wallet
  const connect = async () => {
    if (!checkMetaMask()) return;

    try {
      toast.loading("Connecting to wallet...");
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      if (accounts.length > 0) {
        setProvider(provider);
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Update Supabase profile if user is authenticated
        if (user) {
          await connectWallet(accounts[0]);
        }
        
        toast.dismiss();
        toast.success("Wallet connected successfully");
      }
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    setProvider(null);
    setAddress('');
    setIsConnected(false);
    toast.success("Wallet disconnected");
  };

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Web3AuthContext.Provider
      value={{
        provider,
        address,
        isConnected,
        isInitializing,
        connect,
        disconnect,
        formatAddress,
        configError,
        domainError
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
