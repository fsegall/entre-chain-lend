
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

interface ConnectWalletButtonProps {
  isConnecting: boolean;
  onConnect: () => void;
}

const ConnectWalletButton = ({ 
  isConnecting, 
  onConnect 
}: ConnectWalletButtonProps) => {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={onConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </Button>
  );
};

export default ConnectWalletButton;
