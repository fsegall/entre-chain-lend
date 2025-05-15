
import { useWalletConnection } from "@/hooks/useWalletConnection";
import ConnectedWallet from "./wallet/ConnectedWallet";
import NoWalletButton from "./wallet/NoWalletButton";
import ConnectWalletButton from "./wallet/ConnectWalletButton";
import NetworkSwitchDialog from "./wallet/NetworkSwitchDialog";

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
    setSelectedNetwork
  } = useWalletConnection();
  
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
        onConnect={connectWeb3Wallet}
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
