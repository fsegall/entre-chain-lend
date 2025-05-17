import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAddress(null);
      setIsConnected(false);
    } else {
      // Update the address
      setAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Add event listener for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch(console.error);

      // Cleanup
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatAddress(address)}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="border-blockloan-teal text-blockloan-teal dark:border-blockloan-gold dark:text-blockloan-gold"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-blockloan-teal text-blockloan-teal dark:border-blockloan-gold dark:text-blockloan-gold"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect; 