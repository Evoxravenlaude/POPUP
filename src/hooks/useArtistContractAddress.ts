// ✅ CRITICAL FIX: Get contract address per artist from database
// This hook replaces hardcoded contract addresses that caused revenue routing to wrong contracts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/db';
import { useAccount } from 'wagmi';

/**
 * Get the contract address for a specific artist
 * Each artist has their own ERC-721 contract deployed by ArtDropFactory
 * @param artistWallet - The artist's wallet address
 * @returns The contract address for this artist, or null if not deployed
 */
export function useArtistContractAddress(artistWallet: string | null | undefined) {
  const { address: userAddress } = useAccount();

  return useQuery({
    queryKey: ['artistContract', artistWallet],
    queryFn: async () => {
      if (!artistWallet) return null;

      try {
        const { data, error } = await supabase
          .from('artists')
          .select('contract_address')
          .eq('wallet', artistWallet)
          .single();

        if (error) {
          console.error('Error fetching artist contract:', error);
          return null;
        }

        if (!data?.contract_address) {
          console.warn(`No contract deployed for artist ${artistWallet}`);
          return null;
        }

        return data.contract_address as string;
      } catch (err) {
        console.error('Failed to fetch artist contract address:', err);
        return null;
      }
    },
    enabled: !!artistWallet && artistWallet !== '0x0000000000000000000000000000000000000000',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Get contract addresses for multiple artists at once
 * Useful for rendering feed/list views
 */
export function useArtistContractAddresses(artistWallets: string[]) {
  return useQuery({
    queryKey: ['artistContracts', artistWallets],
    queryFn: async () => {
      if (!artistWallets || artistWallets.length === 0) return {};

      try {
        const { data, error } = await supabase
          .from('artists')
          .select('wallet, contract_address')
          .in('wallet', artistWallets);

        if (error) {
          console.error('Error fetching artist contracts:', error);
          return {};
        }

        const addressMap: Record<string, string> = {};
        data.forEach((artist) => {
          if (artist.contract_address) {
            addressMap[artist.wallet] = artist.contract_address;
          }
        });

        return addressMap;
      } catch (err) {
        console.error('Failed to fetch artist contracts:', err);
        return {};
      }
    },
    enabled: artistWallets && artistWallets.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

/**
 * Verify that a contract address is valid before using it
 */
export function isValidContractAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  // Check format: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get contract address with fallback
 * Returns the artist contract if available, otherwise throws error
 */
export function useRequireArtistContractAddress(artistWallet: string | null | undefined) {
  const { data: contractAddress, isLoading, error } = useArtistContractAddress(artistWallet);

  if (!contractAddress) {
    throw new Error(
      `Contract not found for artist ${artistWallet}. Artist may not have deployed their contract yet.`
    );
  }

  return { contractAddress, isLoading, error };
}

/**
 * Invalidate contract address cache (use after contract deployment)
 */
export function useInvalidateContractAddress() {
  const queryClient = useQueryClient();

  return (artistWallet: string) => {
    queryClient.invalidateQueries({
      queryKey: ['artistContract', artistWallet],
    });
  };
}

/**
 * Prefetch contract address for better UX
 */
export function usePrefetchContractAddress() {
  const queryClient = useQueryClient();

  return (artistWallet: string) => {
    queryClient.prefetchQuery({
      queryKey: ['artistContract', artistWallet],
      queryFn: async () => {
        const { data } = await supabase
          .from('artists')
          .select('contract_address')
          .eq('wallet', artistWallet)
          .single();
        return data?.contract_address || null;
      },
    });
  };
}
