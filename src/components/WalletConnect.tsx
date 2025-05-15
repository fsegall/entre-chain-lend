
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
  
  const handleConnect = async () => {
    try {
      // Clear any existing errors from previous attempts
      toast.dismiss();
      
      // Show connecting toast
      const toastId = toast.loading("Connecting to wallet...");
      
      await connectWeb3Wallet();
      
      // Clear the loading toast
      toast.dismiss(toastId);
    } catch (err: any) {
      console.error("Connection error in WalletConnect:", err);
      toast.error(`Failed to connect wallet: ${err.message}`);
    }
  };

  if (walletStatus === 'connected') {
    return (
      <ConnectedWallet
        address={walletAddress}
        formatAddress={formatWalletAddress}
        onDisconnect={disconnectWallet}
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
