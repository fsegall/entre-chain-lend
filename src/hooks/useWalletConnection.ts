
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  isWeb3Available, 
  requestAccounts, 
  getCurrentChainId, 
  switchToEphemeryNetwork, 
  completeWalletConnection,
  formatWalletAddress
} from "@/services/walletService";
import { isEphemeryNetwork } from "@/utils/ethereumNetworks";

type WalletStatus = 'disconnected' | 'connecting' | 'connected';

type PendingConnection = {
  address: string;
  currentChainId: string;
} | null;

export function useWalletConnection() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection>(null);
  const { user, connectWallet } = useAuth();

  // Listen for chain changes
  useEffect(() => {
    if (!isWeb3Available()) return;

    const handleChainChanged = async (chainId: string) => {
      console.log("Chain changed to:", chainId);
      
      // If connected and chain was changed to something other than Ephemery
      if (walletStatus === 'connected' && !isEphemeryNetwork(chainId)) {
        toast.warning("Please switch back to Ephemery network to use this application");
        setShowNetworkDialog(true);
      } else if (walletStatus === 'connected' && isEphemeryNetwork(chainId)) {
        // If switched back to Ephemery, hide the dialog
        setShowNetworkDialog(false);
        toast.success("Connected to Ephemery network");
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [walletStatus]);

  const connectWeb3Wallet = async () => {
    try {
      setWalletStatus('connecting');
      setError(null);
      
      if (!isWeb3Available()) {
        throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
      }
      
      // Request account access
      const accounts = await requestAccounts();
      const address = accounts[0];
      
      console.log("Connected to wallet address:", address);
      
      // Check if we're connected to the right network
      const chainId = await getCurrentChainId();
      console.log("Current chain ID:", chainId);
      
      // Check if the current chain ID is in our list of supported Ephemery chain IDs
      if (!isEphemeryNetwork(chainId)) {
        console.log("Not on Ephemery network. Current chain:", chainId);
        // Instead of automatically switching, save the pending connection and show dialog
        setPendingConnection({
          address,
          currentChainId: chainId
        });
        setShowNetworkDialog(true);
        return; // Stop execution here until user responds to dialog
      }
      
      console.log("Already on Ephemery network. Proceeding with connection.");
      // If we're already on the right network, proceed with wallet connection
      await handleCompleteConnection(address);
      
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
      
      console.log("Attempting to switch to Ephemery network...");
      await switchToEphemeryNetwork();
      console.log("Network switch successful");
      
      // Now that we've switched networks, complete the connection
      await handleCompleteConnection(address);
      
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
  const handleCompleteConnection = async (address: string) => {
    try {
      await completeWalletConnection(address);
      
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

  return {
    walletStatus,
    walletAddress,
    error,
    showNetworkDialog,
    isWeb3Available: isWeb3Available(),
    connectWeb3Wallet,
    disconnectWallet,
    handleSwitchNetwork,
    handleCancelNetworkSwitch,
    formatWalletAddress
  };
}
