import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Add a type definition for the window.ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnect = () => {
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { user, connectWallet } = useAuth();
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{
    address: string;
    currentChainId: string;
  } | null>(null);
  
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
      
      console.log("Connected to wallet address:", address);
      
      // Check if we're connected to Ephemery testnet (chainId 0x53a)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current chain ID:", chainId);
      
      // Ephemery testnet chainId is 0x53a in hex (1338 in decimal)
      if (chainId !== '0x53a') {
        // Instead of automatically switching, save the pending connection and show dialog
        setPendingConnection({
          address,
          currentChainId: chainId
        });
        setShowNetworkDialog(true);
        return; // Stop execution here until user responds to dialog
      }
      
      // If we're already on the right network, proceed with wallet connection
      await completeWalletConnection(address);
      
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setError(error.message);
      setWalletStatus('disconnected');
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Function to handle network switching after user confirms
  const handleSwitchNetwork = async () => {
    if (!pendingConnection) return;
    
    try {
      setShowNetworkDialog(false);
      const { address } = pendingConnection;
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x53a' }], // Ephemery testnet chainId in hex
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x53a',
                chainName: 'Ephemery Testnet',
                nativeCurrency: {
                  name: 'Ephemery ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://ephemery.dev/'],
                blockExplorerUrls: ['https://explorer.ephemery.dev/'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
      
      // Now that we've switched networks, complete the connection
      await completeWalletConnection(address);
      
    } catch (error: any) {
      console.error("Failed to switch network:", error);
      setError(error.message);
      setWalletStatus('disconnected');
      toast.error(error.message || "Failed to switch network");
    }
  };

  // Function to handle the case when user cancels network switch
  const handleCancelNetworkSwitch = () => {
    setShowNetworkDialog(false);
    setPendingConnection(null);
    setWalletStatus('disconnected');
    toast.info("Connection cancelled. Ephemery network is required for this application.");
  };

  // Function to handle the actual wallet connection after network issues are resolved
  const completeWalletConnection = async (address: string) => {
    try {
      // Get a nonce from our edge function
      const { data: nonceData, error: nonceError } = await supabase.functions.invoke('wallet-auth', {
        body: { action: 'get_nonce' }
      });
      
      if (nonceError) {
        throw new Error(`Failed to get nonce: ${nonceError.message}`);
      }
      
      console.log("Received nonce message to sign:", nonceData.message);
      
      // Ask user to sign the message
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonceData.message);
      
      console.log("Message signed:", signature);
      
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
      
      console.log("Verification successful:", verifyData);
      
      // If successful, update the user's profile
      if (user) {
        await connectWallet(address);
      }
      
      // Update local state
      setWalletAddress(address);
      setWalletStatus('connected');
      setPendingConnection(null);
      toast.success("Wallet connected successfully!");
      
    } catch (error: any) {
      console.error("Failed to complete wallet connection:", error);
      setError(error.message);
      setWalletStatus('disconnected');
      setPendingConnection(null);
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
    <>
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
      
      <AlertDialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Network Switch Required</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires the Ephemery test network. 
              Would you like to switch your wallet to the Ephemery network now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNetworkSwitch}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwitchNetwork}>Switch to Ephemery</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WalletConnect;
