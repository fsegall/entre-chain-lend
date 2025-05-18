
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NoWalletButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
            disabled={true}
          >
            <AlertCircle className="h-4 w-4" />
            <span>No Web3 Wallet</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Please install MetaMask or another Web3 wallet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NoWalletButton;
