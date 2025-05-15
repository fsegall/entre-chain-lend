
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, AlertTriangle } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useEffect } from "react";

const WalletConnect = () => {
  const {
    isConnected,
    address,
    isInitializing,
    connect,
    disconnect,
    formatAddress,
    configError
  } = useWeb3Auth();
  
  // Log component state for debugging
  useEffect(() => {
    console.log("WalletConnect component state:", { 
      isConnected,
      address,
      isInitializing,
      configError
    });
  }, [isConnected, address, isInitializing, configError]);

  if (configError) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-amber-50 border-amber-200 text-amber-700"
              disabled
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Configuration Error</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{configError}</p>
            <p className="mt-1 text-xs">Update your Web3Auth Client ID in useWeb3Auth.tsx</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isInitializing) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2"
        disabled={true}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Initializing...</span>
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={disconnect}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
                <span className="font-mono text-xs md:text-sm">
                  {formatAddress(address)}
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
  }

  // Standard connect button
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={connect}
      disabled={isInitializing}
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  );
};

export default WalletConnect;
