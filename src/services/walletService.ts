import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { 
  DEFAULT_NETWORK, 
  SUPPORTED_NETWORKS,
  isSupportedNetwork, 
  getNetworkFromChainId 
} from "@/utils/ethereumNetworks";
import { toast } from "react-toastify";

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

// Request user accounts from the wallet - force MetaMask to show the account selector
export const requestAccounts = async (): Promise<string[]> => {
  if (!isWeb3Available()) {
    throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
  }
  
  try {
    // Use eth_requestAccounts which prompts the user and shows their current account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("Requested accounts from wallet:", accounts);
    return accounts;
  } catch (error) {
    console.error("Error requesting accounts:", error);
    throw error;
  }
};

// Get the current active accounts without prompting
export const getCurrentAccounts = async (): Promise<string[]> => {
  if (!isWeb3Available()) {
    return [];
  }
  
  try {
    // Use eth_accounts which returns the currently permitted accounts without a prompt
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log("Current accounts from wallet (no prompt):", accounts);
    return accounts;
  } catch (error) {
    console.error("Error getting current accounts:", error);
    return [];
  }
};

// Get the current chain ID from the wallet
export const getCurrentChainId = async (): Promise<string> => {
  return await window.ethereum.request({ method: 'eth_chainId' });
};

// Setup account change listeners - use this to register external callbacks
export const setupAccountChangeListeners = (callback: (accounts: string[]) => void): () => void => {
  if (!isWeb3Available()) {
    console.warn("Cannot setup account listeners - Web3 not available");
    return () => {};
  }

  const handleAccountsChanged = (accounts: string[]) => {
    console.log("Account change detected in service:", accounts);
    callback(accounts);
  };

  // Add the listener
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  
  // Return a cleanup function
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  };
};

// Get the current active account without prompting
export const getCurrentAccount = async (): Promise<string | null> => {
  const accounts = await getCurrentAccounts();
  return accounts.length > 0 ? accounts[0] : null;
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
    console.log("Starting wallet connection process for address:", address);
    
    // Get a nonce from our edge function
    console.log("Requesting nonce from wallet-auth function");
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
    
    // Double-check current account matches the address we're trying to connect
    const currentAccount = await getCurrentAccount();
    if (currentAccount && currentAccount.toLowerCase() !== address.toLowerCase()) {
      console.warn(`Address mismatch. Trying to connect to ${address} but current account is ${currentAccount}`);
      // Use the current account from MetaMask instead
      address = currentAccount;
    }
    
    // Ask user to sign the message
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    try {
      console.log("Requesting user to sign message");
      const signature = await signer.signMessage(nonceData.message);
      console.log("Message signed successfully");
      
      // Add a small delay to ensure the edge function has processed the nonce
      console.log("Waiting before verification...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the signature with our edge function
      console.log("Verifying signature with wallet-auth function");
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('wallet-auth', {
        body: { 
          action: 'verify_signature',
          address,
          signature,
          nonce: nonceData.nonce
        }
      });
      
      console.log("Verification response:", verifyData, verifyError);
      
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
