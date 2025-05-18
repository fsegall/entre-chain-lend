import { useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const WalletConnect = memo(() => {
  const { user, connectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to connect your wallet");
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        await connectWallet(address);
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
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
    <Button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isConnecting}
      variant={isConnected ? "outline" : "default"}
      className="min-w-[120px]"
    >
      {isConnecting ? (
        "Connecting..."
      ) : isConnected ? (
        "Disconnect"
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
});

WalletConnect.displayName = 'WalletConnect';

export default WalletConnect;
