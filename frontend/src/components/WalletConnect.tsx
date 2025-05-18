import { useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const WalletConnect = memo(() => {
  const { user, connectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      await connectWallet(address);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle user rejection specifically
      if (error.code === 4001) {
        setError('Connection request was rejected. Please try again.');
      } else if (error.code === -32002) {
        setError('Please check your MetaMask extension to approve the connection.');
      } else {
        setError(error.message || 'Failed to connect wallet');
      }
      
      // Handle user rejection specifically
      if (error.code === 4001) {
        setError('Connection request was rejected. Please try again.');
      } else if (error.code === -32002) {
        setError('Please check your MetaMask extension to approve the connection.');
      } else {
        setError(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [connectWallet]);

  const handleDisconnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await connectWallet(""); // Clear the wallet address
    } catch (error: any) {
      console.error("Wallet disconnection error:", error);
      toast.error(error.message || "Failed to disconnect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [connectWallet]);

  if (!user) return null;

  const isConnected = Boolean(user.wallet_address);

  return (
    <div className="flex flex-col items-center">
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          variant="default"
          className="min-w-[120px]"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-gray-600">
            Connected: {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="min-w-[120px]"
          >
            Disconnect
          </Button>
        </div>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
});

WalletConnect.displayName = 'WalletConnect';

export default WalletConnect;
