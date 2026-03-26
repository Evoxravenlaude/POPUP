import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

// RPC endpoints - use reliable public endpoints
const BASE_RPC = import.meta.env.VITE_BASE_RPC_URL || "https://mainnet.base.org";
const BASE_SEPOLIA_RPC = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

if (!import.meta.env.VITE_BASE_RPC_URL || !import.meta.env.VITE_BASE_SEPOLIA_RPC_URL) {
  console.warn(
    "⚠️  Using public RPC endpoints which are rate-limited in production. \n" +
    "To use dedicated endpoints, set VITE_BASE_RPC_URL and VITE_BASE_SEPOLIA_RPC_URL in .env.local"
  );
}

// Get WalletConnect project ID from environment
const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "PopUp" }),
    metaMask({ appName: "PopUp" }),
    // Only include WalletConnect if a valid project ID is provided
    ...(wcProjectId && wcProjectId !== "demo-project-id" ? [
      walletConnect({
        projectId: wcProjectId,
        showQrModal: true,
      })
    ] : []),
  ],
  transports: {
    [base.id]: http(BASE_RPC, {
      timeout: 30_000,
      retryCount: 3,
      retryDelay: 1_000,
    }),
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC, {
      timeout: 30_000,
      retryCount: 3,
      retryDelay: 1_000,
    }),
  },
});

// Switch between networks based on environment or manually
// For development/testing: use baseSepolia
// For production: use base
// Currently set to: Base Sepolia (testnet)
export const ACTIVE_CHAIN = baseSepolia;
