
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Wallet } from "lucide-react";

const WalletConnect = () => {
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const connectWallet = async () => {
    try {
      setWalletStatus('connecting');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock wallet connection
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 14) + "...";
      setWalletAddress(mockAddress);
      setWalletStatus('connected');
      
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWalletStatus('disconnected');
    }
  };

  const disconnectWallet = () => {
    setWalletStatus('disconnected');
    setWalletAddress('');
  };

  if (walletStatus === 'connected') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={disconnectWallet}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
                <span className="font-mono text-xs md:text-sm">{walletAddress}</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connected! Click to disconnect</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={connectWallet}
      disabled={walletStatus === 'connecting'}
    >
      {walletStatus === 'connecting' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </Button>
  );
};

export default WalletConnect;
