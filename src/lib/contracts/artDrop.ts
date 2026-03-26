// ✅ FIXED ABI for contracts/ArtDrop.sol (Master contract for all artists)
// Contract: ArtDrop — Multi-artist ERC-721 contract supporting drops and subscriptions
// Deployed once on Base Sepolia (testnet)

// NOTE: The hardcoded address below should be replaced with dynamic lookup from Supabase
// Do NOT use this address directly - fetch per-artist contract from artists.contract_address column
export const ART_DROP_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // PLACEHOLDER - REPLACE WITH ENV VAR

// ✅ UPDATED: Complete ABI with all required functions
export const ART_DROP_ABI = [
  // ─── Events ──────────────────────────────────────────────────────

  {
    type: "event",
    name: "DropCreated",
    inputs: [
      { name: "dropId", type: "uint256", indexed: true },
      { name: "artist", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "maxSupply", type: "uint256", indexed: false },
    ],
  },

  {
    type: "event",
    name: "ArtMinted",
    inputs: [
      { name: "dropId", type: "uint256", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "collector", type: "address", indexed: true },
    ],
  },

  {
    type: "event",
    name: "ArtistSubscribed",
    inputs: [
      { name: "artist", type: "address", indexed: true },
      { name: "subscriber", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "artistShare", type: "uint256", indexed: false },
      { name: "adminShare", type: "uint256", indexed: false },
      { name: "expiryTime", type: "uint256", indexed: false },
    ],
  },

  {
    type: "event",
    name: "SubscriptionRenewed",
    inputs: [
      { name: "artist", type: "address", indexed: true },
      { name: "subscriber", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "newExpiryTime", type: "uint256", indexed: false },
    ],
  },

  {
    type: "event",
    name: "SubscriptionFundsDistributed",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "recipientType", type: "string", indexed: false },
    ],
  },

  {
    type: "event",
    name: "SubscriptionFundsPending",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },

  {
    type: "event",
    name: "SubscriptionCancelled",
    inputs: [
      { name: "artist", type: "address", indexed: true },
      { name: "subscriber", type: "address", indexed: true },
      { name: "refundAmount", type: "uint256", indexed: false },
    ],
  },

  {
    type: "event",
    name: "AdminFeesWithdrawn",
    inputs: [
      { name: "admin", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },

  {
    type: "event",
    name: "MinSubscriptionFeeSet",
    inputs: [
      { name: "artist", type: "address", indexed: true },
      { name: "newFee", type: "uint256", indexed: false },
    ],
  },

  {
    type: "event",
    name: "DropPaused",
    inputs: [
      { name: "dropId", type: "uint256", indexed: true },
      { name: "paused", type: "bool", indexed: false },
    ],
  },

  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "artist", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },

  // ─── Write functions ──────────────────────────────────────────────────────

  {
    type: "function",
    name: "createDrop",
    inputs: [
      { name: "_metadataURI", type: "string" },
      { name: "_priceWei", type: "uint256" },
      { name: "_maxSupply", type: "uint256" },
      { name: "_startTime", type: "uint64" },
      { name: "_endTime", type: "uint64" },
    ],
    outputs: [{ name: "dropId", type: "uint256" }],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "mint",
    inputs: [{ name: "_dropId", type: "uint256" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "payable",
  },

  // ✅ FIXED: Subscribe now requires artist parameter
  {
    type: "function",
    name: "subscribe",
    inputs: [{ name: "artist", type: "address" }],
    outputs: [],
    stateMutability: "payable",
  },

  {
    type: "function",
    name: "cancelSubscription",
    inputs: [{ name: "subscriber", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "withdrawSubscriptionFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "togglePause",
    inputs: [{ name: "_dropId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "setFee",
    inputs: [{ name: "_bps", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "setFeeRecipient",
    inputs: [{ name: "_addr", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "approveArtist",
    inputs: [{ name: "_artist", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "disapproveArtist",
    inputs: [{ name: "_artist", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "setMinSubscriptionFee",
    inputs: [
      { name: "artist", type: "address" },
      { name: "_fee", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "withdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ─── Read functions ───────────────────────────────────────────────────────

  // State variables
  {
    type: "function",
    name: "nextDropId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "nextTokenId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "platformFeeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "feeRecipient",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "totalSubscriptionRevenue",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "pendingWithdrawals",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // Drops
  {
    type: "function",
    name: "drops",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "artist", type: "address" },
      { name: "metadataURI", type: "string" },
      { name: "priceWei", type: "uint256" },
      { name: "maxSupply", type: "uint256" },
      { name: "minted", type: "uint256" },
      { name: "startTime", type: "uint64" },
      { name: "endTime", type: "uint64" },
      { name: "paused", type: "bool" },
    ],
    stateMutability: "view",
  },

  // Subscriptions
  {
    type: "function",
    name: "subscribers",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "hasSubscribed",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "subscriptionBalance",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // ✅ NEW: Subscription expiry tracking
  {
    type: "function",
    name: "subscriptionExpiry",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // ✅ NEW: Minimum subscription fee per artist
  {
    type: "function",
    name: "minSubscriptionFee",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // ✅ NEW: Subscription status queries
  {
    type: "function",
    name: "isSubscriptionActive",
    inputs: [
      { name: "artist", type: "address" },
      { name: "subscriber", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "getSubscriptionTimeRemaining",
    inputs: [
      { name: "artist", type: "address" },
      { name: "subscriber", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "isSubscribed",
    inputs: [
      { name: "artist", type: "address" },
      { name: "subscriber", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "getSubscriptionAmount",
    inputs: [
      { name: "artist", type: "address" },
      { name: "subscriber", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "getUniqueSubscriberCount",
    inputs: [{ name: "artist", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // ─── ERC-721 ──────────────────────────────────────────────────────

  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "approvedArtists",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;
