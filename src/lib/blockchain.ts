
import { supabase } from '@/integrations/supabase/client';

export type BlockchainLoanDetails = {
  creator: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  funded: number;
  isActive: boolean;
};

export async function getBlockchainLoan(loanId: string): Promise<BlockchainLoanDetails> {
  try {
    const { data, error } = await supabase.functions.invoke('blockchain/get-loan', {
      body: { loanId }
    });
    
    if (error) throw new Error(error.message);
    return data.blockchain_data;
  } catch (error) {
    console.error('Error fetching blockchain loan:', error);
    throw error;
  }
}

export async function syncBlockchainLoans(): Promise<{ synced_loans: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('blockchain/sync-loans', {
      body: {}
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error syncing blockchain loans:', error);
    throw error;
  }
}

// This function would be expanded to handle creating loans on the blockchain
export async function createBlockchainLoan(loanDetails: {
  amount: number;
  interestRate: number;
  termMonths: number;
}): Promise<{ loanId: string }> {
  // In a real implementation, this would interact with the blockchain
  // For now, we'll just mock the response
  console.log('Creating blockchain loan with details:', loanDetails);
  return { loanId: 'mock-blockchain-loan-id' };
}
