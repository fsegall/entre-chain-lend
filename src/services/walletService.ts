
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { EPHEMERY_NETWORK, isEphemeryNetwork } from "@/utils/ethereumNetworks";
import { toast } from "sonner";

// Add a type definition for the window.ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Check if MetaMask or another web3 provider is available
export const isWeb3Available = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Request user accounts from the wallet
export const requestAccounts = async (): Promise<string[]> => {
  if (!isWeb3Available()) {
    throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
  }
  
  return await window.ethereum.request({ method: 'eth_requestAccounts' });
};

// Get the current chain ID from the wallet
export const getCurrentChainId = async (): Promise<string> => {
  return await window.ethereum.request({ method: 'eth_chainId' });
};

// Switch the network in user's wallet
export const switchToEphemeryNetwork = async (): Promise<void> => {
  try {
    console.log("Requesting network switch to chainId:", EPHEMERY_NETWORK.chainId);
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: EPHEMERY_NETWORK.chainId }],
    });

    // Verify the switch was successful
    const newChainId = await getCurrentChainId();
    console.log("After switch, new chainId:", newChainId);

    if (!isEphemeryNetwork(newChainId)) {
      throw new Error("Network switch failed: Chain ID mismatch");
    }

  } catch (switchError: any) {
    console.error("Network switch error:", switchError);
    
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError.message?.includes("wallet_addEthereumChain")) {
      console.log("Network not found, attempting to add Ephemery network...");
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: EPHEMERY_NETWORK.chainId,
            chainName: EPHEMERY_NETWORK.chainName,
            nativeCurrency: EPHEMERY_NETWORK.nativeCurrency,
            rpcUrls: EPHEMERY_NETWORK.rpcUrls,
            blockExplorerUrls: EPHEMERY_NETWORK.blockExplorerUrls,
          },
        ],
      });
      
      // Verify the network was added and switched to
      const verifyChainId = await getCurrentChainId();
      if (!isEphemeryNetwork(verifyChainId)) {
        throw new Error("Failed to add and switch to Ephemery network");
      }
    } else {
      throw switchError;
    }
  }
};

// Complete the wallet connection with signature verification
export const completeWalletConnection = async (address: string): Promise<void> => {
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
  
  return verifyData;
};

// Format wallet address for display
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
