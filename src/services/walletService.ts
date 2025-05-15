
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { 
  DEFAULT_NETWORK, 
  SUPPORTED_NETWORKS,
  isSupportedNetwork, 
  getNetworkFromChainId 
} from "@/utils/ethereumNetworks";
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
export const switchToNetwork = async (networkConfig = DEFAULT_NETWORK): Promise<void> => {
  try {
    console.log(`Requesting network switch to chainId: ${networkConfig.chainId}`);
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainId }],
    });

    // Verify the switch was successful
    const newChainId = await getCurrentChainId();
    console.log("After switch, new chainId:", newChainId);

    if (!isSupportedNetwork(newChainId)) {
      throw new Error(`Network switch failed: Chain ID ${newChainId} is not a supported network`);
    }

  } catch (switchError: any) {
    console.error("Network switch error:", switchError);
    
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 || 
        switchError.message?.includes("wallet_addEthereumChain") || 
        switchError.message?.includes("Unrecognized chain")) {
      console.log(`Network not found, attempting to add ${networkConfig.chainName}...`);
      
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: networkConfig.chainId,
              chainName: networkConfig.chainName,
              nativeCurrency: networkConfig.nativeCurrency,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
            },
          ],
        });
        
        // Wait a moment before verifying - MetaMask can take a moment to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the network was added and switched to
        const verifyChainId = await getCurrentChainId();
        console.log("After adding network, chainId:", verifyChainId);
        
        if (!isSupportedNetwork(verifyChainId)) {
          console.warn(`User did not switch to ${networkConfig.chainName}. Current chain: ${verifyChainId}`);
          throw new Error(`Failed to switch to ${networkConfig.chainName}. Please try manually adding the network.`);
        }
      } catch (addError: any) {
        console.error("Failed to add network:", addError);
        throw new Error(`Failed to add ${networkConfig.chainName}: ${addError.message || "Unknown error"}`);
      }
    } else {
      throw switchError;
    }
  }
};

// Complete the wallet connection with signature verification
export const completeWalletConnection = async (address: string): Promise<any> => {
  try {
    // Get a nonce from our edge function
    const { data: nonceData, error: nonceError } = await supabase.functions.invoke('wallet-auth', {
      body: { action: 'get_nonce' }
    });
    
    if (nonceError) {
      console.error("Nonce request error:", nonceError);
      throw new Error(`Failed to get nonce: ${nonceError.message}`);
    }
    
    if (!nonceData || !nonceData.message || !nonceData.nonce) {
      console.error("Invalid nonce response:", nonceData);
      throw new Error("Invalid nonce response from server");
    }
    
    console.log("Received nonce message to sign:", nonceData.message);
    
    // Ask user to sign the message
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    try {
      const signature = await signer.signMessage(nonceData.message);
      console.log("Message signed:", signature);
      
      // Add a small delay to ensure the edge function has processed the nonce
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        console.error("Signature verification error:", verifyError);
        throw new Error(`Verification failed: ${verifyError.message}`);
      }
      
      if (!verifyData || !verifyData.success) {
        console.error("Invalid verification response:", verifyData);
        throw new Error(verifyData?.error || "Verification failed");
      }
      
      console.log("Verification successful:", verifyData);
      
      return verifyData;
    } catch (signError: any) {
      console.error("Signature error:", signError);
      // Check if user rejected the signature request
      if (signError.code === 4001 || signError.message?.includes("rejected")) {
        throw new Error("You must sign the message to verify wallet ownership");
      }
      throw new Error(`Failed to sign message: ${signError.message}`);
    }
  } catch (error: any) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};

// Format wallet address for display
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
