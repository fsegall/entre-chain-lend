
import { useWalletConnection } from "@/hooks/useWalletConnection";
import ConnectedWallet from "./wallet/ConnectedWallet";
import NoWalletButton from "./wallet/NoWalletButton";
import ConnectWalletButton from "./wallet/ConnectWalletButton";
import NetworkSwitchDialog from "./wallet/NetworkSwitchDialog";
import { useEffect } from "react";
import { toast } from "sonner";

const WalletConnect = () => {
  const {
    walletStatus,
    walletAddress,
    showNetworkDialog,
    isWeb3Available,
    connectWeb3Wallet,
    disconnectWallet,
    handleSwitchNetwork,
    handleCancelNetworkSwitch,
    formatWalletAddress,
    selectedNetwork,
    setSelectedNetwork,
    refreshWalletAddress,
    error
  } = useWalletConnection();
  
  // Show error if there's an error
  useEffect(() => {
    if (error) {
      console.error("Error in wallet connection:", error);
      toast.error(error);
    }
  }, [error]);

  // Log component state for debugging
  useEffect(() => {
    console.log("WalletConnect component state:", { 
      walletStatus,
      walletAddress,
      isWeb3Available,
      showNetworkDialog
    });
  }, [walletStatus, walletAddress, isWeb3Available, showNetworkDialog]);

  // Ensure wallet address is always up to date
  useEffect(() => {
    if (walletStatus === 'connected') {
      // Refresh wallet address when component mounts
      refreshWalletAddress();
      
      // Set up periodic refresh - more frequent to catch address changes quickly
      const refreshInterval = setInterval(() => {
        refreshWalletAddress();
      }, 1000); // Check every second for address changes
      
      return () => clearInterval(refreshInterval);
    }
  }, [walletStatus, refreshWalletAddress]);
  
  const handleConnect = async () => {
    try {
      // Clear any existing errors from previous attempts
      toast.dismiss();
      
      // Show connecting toast
      const toastId = toast.loading("Connecting to wallet...");
      
      // Force a check of the current MetaMask account before connecting
      if (isWeb3Available && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log("Current MetaMask accounts before connecting:", accounts);
      }
      
      await connectWeb3Wallet();
      
      // Clear the loading toast
      toast.dismiss(toastId);
    } catch (err: any) {
      console.error("Connection error in WalletConnect:", err);
      toast.error(`Failed to connect wallet: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (walletStatus === 'connected') {
    return (
      <ConnectedWallet
        address={walletAddress}
        formatAddress={formatWalletAddress}
        onDisconnect={handleDisconnect}
      />
    );
  }

  if (!isWeb3Available) {
    return <NoWalletButton />;
  }

  return (
    <>
      <ConnectWalletButton
        isConnecting={walletStatus === 'connecting'}
        onConnect={handleConnect}
      />
      
      <NetworkSwitchDialog
        open={showNetworkDialog}
        onOpenChange={(open) => !open && handleCancelNetworkSwitch()}
        onConfirm={handleSwitchNetwork}
        onCancel={handleCancelNetworkSwitch}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
      />
    </>
  );
};

export default WalletConnect;
