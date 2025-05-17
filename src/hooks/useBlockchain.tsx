import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBlockchainLoan, syncBlockchainLoans, createBlockchainLoan, BlockchainLoanDetails } from '@/lib/blockchain';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';

export function useBlockchain() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Query for getting a blockchain loan by ID
  const getLoan = (loanId: string) => {
    return useQuery({
      queryKey: ['blockchainLoan', loanId],
      queryFn: () => getBlockchainLoan(loanId),
      enabled: !!user && !!loanId,
    });
  };

  // Mutation for syncing blockchain data with database
  const syncMutation = useMutation({
    mutationFn: syncBlockchainLoans,
    onSuccess: (data) => {
      toast.success(`Successfully synchronized ${data.synced_loans} loans from blockchain`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync blockchain data: ${error.message}`);
    },
  });

  // Mutation for creating a new blockchain loan
  const createLoanMutation = useMutation({
    mutationFn: createBlockchainLoan,
    onSuccess: () => {
      toast.success('Loan created on blockchain successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create blockchain loan: ${error.message}`);
    },
  });

  return {
    getLoan,
    syncBlockchainData: syncMutation.mutate,
    createBlockchainLoan: createLoanMutation.mutate,
    isLoading: isLoading || syncMutation.isPending || createLoanMutation.isPending,
  };
}
