
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_NETWORKS, EthereumNetwork } from "@/utils/ethereumNetworks";
import { useState, useEffect } from "react";

interface NetworkSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedNetwork?: EthereumNetwork) => void;
  onCancel: () => void;
  selectedNetwork: EthereumNetwork;
  setSelectedNetwork: (network: EthereumNetwork) => void;
}

const NetworkSwitchDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  selectedNetwork,
  setSelectedNetwork,
}: NetworkSwitchDialogProps) => {
  const handleNetworkChange = (networkChainId: string) => {
    const network = SUPPORTED_NETWORKS.find(n => n.chainId === networkChainId);
    if (network) {
      setSelectedNetwork(network);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Network Switch Required</AlertDialogTitle>
          <AlertDialogDescription>
            This application requires a supported test network. 
            Please select a network and switch your wallet.
            
            <div className="my-4">
              <label className="block text-sm font-medium mb-1">Select Network:</label>
              <Select 
                value={selectedNetwork.chainId} 
                onValueChange={handleNetworkChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a network" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_NETWORKS.map((network) => (
                    <SelectItem key={network.chainId} value={network.chainId}>
                      {network.chainName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <p className="mt-2 text-xs font-medium text-amber-600">
              Note: You may see a warning from your wallet about this network. This is normal for newer testnets.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(selectedNetwork)}>
            Switch to {selectedNetwork.chainName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkSwitchDialog;
