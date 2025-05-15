
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createPublicClient, http, parseAbi } from "https://esm.sh/viem@latest";
import { mainnet } from "https://esm.sh/viem@latest/chains";

// Define a simple loan contract ABI (this would be replaced with your actual contract ABI)
const loanContractABI = parseAbi([
  'event LoanCreated(address indexed creator, uint256 indexed loanId, uint256 amount, uint256 interestRate, uint256 termMonths)',
  'event LoanFunded(address indexed funder, uint256 indexed loanId, uint256 amount)',
  'event LoanRepaid(address indexed borrower, uint256 indexed loanId, uint256 amount)',
  'function createLoan(uint256 amount, uint256 interestRate, uint256 termMonths) returns (uint256)',
  'function fundLoan(uint256 loanId) payable',
  'function repayLoan(uint256 loanId) payable',
  'function getLoanDetails(uint256 loanId) view returns (address creator, uint256 amount, uint256 interestRate, uint256 termMonths, uint256 funded, bool isActive)'
]);

// This would be replaced with your actual contract address
const LOAN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// Initialize the viem public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }});
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Check if user is authenticated
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle different blockchain operations based on path
    switch (path) {
      case 'get-loan': {
        const { loanId } = await req.json();
        
        // Get loan details from the blockchain (in a real app, this would interact with your actual contract)
        try {
          // This is a mock function - in a real app you'd use the actual contract
          const loanDetails = { 
            creator: '0x123...', 
            amount: 1000, 
            interestRate: 5, 
            termMonths: 12, 
            funded: 500, 
            isActive: true 
          };
          
          return new Response(JSON.stringify({ 
            blockchain_data: loanDetails, 
            message: "Retrieved loan data from blockchain" 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: `Blockchain error: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      case 'sync-loans': {
        // This endpoint would sync blockchain data with our database
        // For demo purposes, we'll just return a mock response
        return new Response(JSON.stringify({ 
          message: "Loan data synchronized between blockchain and database",
          synced_loans: 5
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Route not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
