
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
};

export default ConnectedWallet;
