
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WalletConnect = () => {
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { user, connectWallet } = useAuth();
  
  // Check if MetaMask or another web3 provider is available
  const isWeb3Available = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  const connectWeb3Wallet = async () => {
    try {
      setWalletStatus('connecting');
      setError(null);
      
      if (!isWeb3Available) {
        throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Get a nonce from our edge function
      const { data: nonceData, error: nonceError } = await supabase.functions.invoke('wallet-auth', {
        body: { action: 'get_nonce' }
      });
      
      if (nonceError) {
        throw new Error(`Failed to get nonce: ${nonceError.message}`);
      }
      
      // Ask user to sign the message
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonceData.message);
      
      // Verify the signature with our edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('wallet-auth', {
        body: { 
          action: 'verify_signature',
          address,
          signature,
          nonce: nonceData.nonce
        }
      });
      
      if (verifyError) {
        throw new Error(`Verification failed: ${verifyError.message}`);
      }
      
      // If successful, update the user's profile
      if (user) {
        await connectWallet(address);
      }
      
      // Update local state
      setWalletAddress(address);
      setWalletStatus('connected');
      toast.success("Wallet connected successfully!");
      
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setError(error.message);
      setWalletStatus('disconnected');
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setWalletStatus('disconnected');
    setWalletAddress('');
    toast.info("Wallet disconnected");
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
                <span className="font-mono text-xs md:text-sm">{walletAddress && 
                  `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                }</span>
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

  if (!isWeb3Available) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
              disabled={true}
            >
              <AlertCircle className="h-4 w-4" />
              <span>No Web3 Wallet</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Please install MetaMask or another Web3 wallet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={connectWeb3Wallet}
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
