
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  isWeb3Available, 
  requestAccounts, 
  getCurrentChainId, 
  switchToNetwork, 
  completeWalletConnection,
  formatWalletAddress
} from "@/services/walletService";
import { 
  DEFAULT_NETWORK,
  isSupportedNetwork,
  getNetworkFromChainId
} from "@/utils/ethereumNetworks";

type WalletStatus = 'disconnected' | 'connecting' | 'connected';

type PendingConnection = {
  address: string;
  currentChainId: string;
} | null;

export function useWalletConnection() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection>(null);
  const [selectedNetwork, setSelectedNetwork] = useState(DEFAULT_NETWORK);
  const { user, connectWallet } = useAuth();

  // Listen for chain changes
  useEffect(() => {
    if (!isWeb3Available()) return;

    const handleChainChanged = async (chainId: string) => {
      console.log("Chain changed to:", chainId);
      setCurrentChainId(chainId);
      
      // If connected and chain was changed to something other than a supported network
      if (walletStatus === 'connected' && !isSupportedNetwork(chainId)) {
        toast.warning(`Please switch to a supported network to use this application`);
        setShowNetworkDialog(true);
      } else if (walletStatus === 'connected' && isSupportedNetwork(chainId)) {
        // If switched back to a supported network, hide the dialog
        setShowNetworkDialog(false);
        const network = getNetworkFromChainId(chainId);
        toast.success(`Connected to ${network?.chainName || 'supported network'}`);
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Get the current chain ID on mount
    getCurrentChainId().then(chainId => {
      setCurrentChainId(chainId);
    }).catch(console.error);
    
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [walletStatus]);

  // Listen for account changes
  useEffect(() => {
    if (!isWeb3Available()) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      
      if (accounts.length === 0) {
        // User disconnected their wallet
        setWalletStatus('disconnected');
        setWalletAddress('');
        toast.info("Wallet disconnected");
      } else {
        const newAddress = accounts[0];
        console.log("New address from accountsChanged:", newAddress);
        
        if (walletStatus === 'connected') {
          // If already connected, handle as an account switch
          if (newAddress !== walletAddress) {
            // IMPORTANT: Update the address BEFORE verification
            setWalletAddress(newAddress);
            toast.info("Wallet account changed, verifying new account...");
            
            try {
              // Verify the new account
              await handleCompleteConnection(newAddress);
              toast.success(`Switched to account: ${formatWalletAddress(newAddress)}`);
            } catch (error: any) {
              console.error("Failed to verify new wallet account:", error);
              setError(error.message);
              toast.error(`Failed to verify new account: ${error.message}`);
            }
          }
        }
        // If not connected yet, the regular connect flow will handle it
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [walletStatus, walletAddress]);

  const connectWeb3Wallet = async (networkToUse = selectedNetwork) => {
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
      setCurrentChainId(chainId);
      console.log("Current chain ID:", chainId);
      
      // Check if the current chain ID is in our list of supported chain IDs
      if (!isSupportedNetwork(chainId)) {
        console.log("Not on a supported network. Current chain:", chainId);
        // Save the pending connection and show dialog
        setPendingConnection({
          address,
          currentChainId: chainId
        });
        setSelectedNetwork(networkToUse);
        setShowNetworkDialog(true);
        return; // Stop execution here until user responds to dialog
      }
      
      console.log("Already on a supported network. Proceeding with connection.");
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
  const handleSwitchNetwork = async (networkToUse = selectedNetwork) => {
    if (!pendingConnection) return;
    
    try {
      setShowNetworkDialog(false);
      const { address } = pendingConnection;
      
      console.log(`Attempting to switch to ${networkToUse.chainName} network...`);
      await switchToNetwork(networkToUse);
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
    toast.info("Connection cancelled. A supported network is required for this application.");
  };

  // Function to handle the actual wallet connection after network issues are resolved
  const handleCompleteConnection = async (address: string) => {
    try {
      const result = await completeWalletConnection(address);
      console.log("Wallet connection complete:", result);
      
      // If successful, update the user's profile
      if (user) {
        await connectWallet(address);
      }
      
      // Update local state
      setWalletAddress(address);
      setWalletStatus('connected');
      setPendingConnection(null);
      
    } catch (error: any) {
      console.error("Failed to complete wallet connection:", error);
      setError(error.message);
      setWalletStatus('disconnected');
      setPendingConnection(null);
      throw error; // Re-throw to allow handling by the caller
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
    currentChainId,
    error,
    showNetworkDialog,
    isWeb3Available: isWeb3Available(),
    connectWeb3Wallet,
    disconnectWallet,
    handleSwitchNetwork,
    handleCancelNetworkSwitch,
    formatWalletAddress,
    setSelectedNetwork,
    selectedNetwork
  };
}
