import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthProvider';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const WalletConnect = React.memo(({ onConnect, onDisconnect, onError }: WalletConnectProps) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestTime = useRef<number>(0);
  const COOLDOWN_PERIOD = 2000; // 2 seconds cooldown

  const handleConnect = useCallback(async () => {
    try {
      // Check if we're in cooldown period
      const now = Date.now();
      if (now - lastRequestTime.current < COOLDOWN_PERIOD) {
        setError('Please wait a moment before trying again.');
        return;
      }

      setIsConnecting(true);
      setError(null);
      lastRequestTime.current = now;

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      onConnect?.(address);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        setError('Connection request was rejected. Please try again.');
      } else if (error.code === -32002) {
        setError('Please check your MetaMask extension to approve the connection.');
        // Add a longer cooldown for pending requests
        lastRequestTime.current = Date.now() + 5000; // 5 seconds cooldown
      } else {
        setError(error.message || 'Failed to connect wallet');
      }
      
      onError?.(error);
    } finally {
      setIsConnecting(false);
    }
  }, [onConnect, onError]);

  const handleDisconnect = useCallback(() => {
    try {
      onDisconnect?.();
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error);
      setError(error.message || 'Failed to disconnect wallet');
    }
  }, [onDisconnect]);

  const isConnected = !!user?.wallet_address;

  return (
    <div className="flex flex-col items-center">
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          variant="default"
          className="min-w-[120px]"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-gray-600">
            Connected: {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="min-w-[120px]"
          >
            Disconnect
          </Button>
        </div>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
});
