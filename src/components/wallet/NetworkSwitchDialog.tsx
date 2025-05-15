
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

interface NetworkSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const NetworkSwitchDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: NetworkSwitchDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Network Switch Required</AlertDialogTitle>
          <AlertDialogDescription>
            This application requires the Ephemery test network. 
            Would you like to switch your wallet to the Ephemery network now?
            <p className="mt-2 text-xs font-medium text-amber-600">
              Note: You may see a warning from your wallet about this network. This is normal for newer testnets.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Switch to Ephemery</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkSwitchDialog;
