
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ConnectedWalletProps {
  address: string;
  formatAddress: (address: string) => string;
  onDisconnect: () => void;
}

const ConnectedWallet = ({ 
  address, 
  formatAddress, 
  onDisconnect 
}: ConnectedWalletProps) => {
  const [formattedAddress, setFormattedAddress] = useState<string>("");
  
  // Re-format the address whenever it changes
  useEffect(() => {
    const updateAddress = () => {
      if (address) {
        console.log("ConnectedWallet: Address updated to:", address);
        const formatted = formatAddress(address);
        console.log("ConnectedWallet: Formatted as:", formatted);
        setFormattedAddress(formatted);
      }
    };
    
    // Call immediately
    updateAddress();
    
    // Set up a small interval to catch MetaMask account changes
    // This helps ensure UI is in sync with the current wallet state
    const checkInterval = setInterval(updateAddress, 1000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [address, formatAddress]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            onClick={onDisconnect}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
              <span className="font-mono text-xs md:text-sm">
                {formattedAddress}
              </span>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected! Click to disconnect</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectedWallet;
