import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Grid3X3 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { getPublicClient, createPublicClient, http } from "viem";
import { Button } from "@/components/ui/button";
import { useWallet, useUserOwnedTokens } from "@/hooks/useContracts";
import { trackCollectionView, trackArticleView } from "@/lib/analyticsStore";
import { ART_DROP_ADDRESS, ART_DROP_ABI } from "@/lib/contracts/artDrop";
import { ACTIVE_CHAIN } from "@/lib/wagmi";

interface CollectionNFT {
  tokenId: number;
  dropId: number;
  uri: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
  owned: boolean;
}

const MyCollectionPage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [filter, setFilter] = useState("all"); // all, owned, watched
  const [collection, setCollection] = useState<CollectionNFT[]>([]);
  const [loading, setLoading] = useState(false);

  // Track analytics view
  useEffect(() => {
    if (isConnected && address) {
      trackCollectionView(address);
    }
  }, [isConnected, address]);

  // Get user's token balance from contract
  const { balance: tokenBalance, isLoading: balanceLoading } = useUserOwnedTokens(address);

  // Fetch user's owned NFT tokens from contract
  useEffect(() => {
    if (!isConnected || !address || tokenBalance === 0) {
      setCollection([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchTokens = async () => {
      try {
        const publicClient = createPublicClient({
          chain: ACTIVE_CHAIN,
          transport: http(),
        });

        // Scan ArtMinted(dropId, tokenId, collector indexed) event logs
        const logs = await publicClient.getLogs({
          address: ART_DROP_ADDRESS,
          event: {
            type: "event",
            name: "ArtMinted",
            inputs: [
              { name: "dropId", type: "uint256", indexed: true },
              { name: "tokenId", type: "uint256", indexed: true },
              { name: "collector", type: "address", indexed: true },
            ],
          },
          args: {
            collector: address,
          },
          fromBlock: "earliest",
          toBlock: "latest",
        });

        console.log(`Found ${logs.length} ArtMinted events for ${address}`);

        const tokens: CollectionNFT[] = [];

        // Process each event: fetch tokenURI and metadata
        for (const log of logs) {
          try {
            const dropId = Number((log.args as any).dropId);
            const tokenId = Number((log.args as any).tokenId);

            // Fetch token URI
            const tokenURI = await publicClient.readContract({
              address: ART_DROP_ADDRESS,
              abi: ART_DROP_ABI,
              functionName: "tokenURI",
              args: [BigInt(tokenId)],
            });

            console.log(`Token #${tokenId}: ${tokenURI}`);

            // Fetch IPFS metadata
            let metadata: any = {};
            if (tokenURI && typeof tokenURI === "string" && tokenURI.startsWith("ipfs://")) {
              try {
                const cid = tokenURI.replace("ipfs://", "");
                const metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
                const response = await fetch(metadataUrl);
                if (response.ok) {
                  metadata = await response.json();
                }
              } catch (err) {
                console.warn(`Failed to fetch metadata for token ${tokenId}:`, err);
              }
            }

            tokens.push({
              tokenId,
              dropId,
              uri: tokenURI as string,
              metadata,
              owned: true,
            });
          } catch (err) {
            console.error(`Error processing token from log:`, err);
          }
        }

        setCollection(tokens);

        // Track collection view for analytics
        if (tokens.length > 0) {
          tokens.forEach((token) => {
            trackArticleView(address, `token_${token.tokenId}`);
          });
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
        // Keep UI usable even if fetching fails
        setCollection([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [isConnected, address, tokenBalance]);

  const collectedDrops = useMemo(() => {
    if (filter === "all") return collection;
    if (filter === "owned") return collection.filter((c) => c.owned);
    if (filter === "watched") return collection.filter((c) => !c.owned);
    return collection;
  }, [collection, filter]);

  if (!isConnected) {
    return (
      <div className="px-4 py-10 text-center space-y-4">
        <p className="text-lg font-semibold text-foreground">Connect Your Wallet</p>
        <p className="text-sm text-muted-foreground">Connect to see your NFT collection</p>
        <Button onClick={() => navigate(-1)} className="rounded-full gradient-primary text-primary-foreground">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 pt-3 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-secondary/50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold">My Collection</h1>
      </div>

      {/* Filter tabs */}
      <div className="px-4 flex gap-2">
        {["all", "owned", "watched"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Collection grid */}
      {loading ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">Loading your collection...</p>
        </div>
      ) : collectedDrops.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            You haven't collected any art yet.
          </p>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Visit the marketplace or drops to start collecting.
          </p>
          <Button
            onClick={() => navigate("/drops")}
            variant="outline"
            className="mt-4 rounded-full"
          >
            Browse Drops
          </Button>
        </div>
      ) : (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {collectedDrops.map((drop) => (
              <Link
                key={drop.tokenId}
                to={`/drops/${drop.dropId}`}
                className="rounded-xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-shadow group"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={drop.metadata?.image || `https://images.unsplash.com/photo-1578321272176-c8593e05e55a?w=400&h=400&fit=crop`}
                    alt={drop.metadata?.name || `NFT #${drop.tokenId}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold truncate text-foreground">
                    {drop.metadata?.name || `Token #${drop.tokenId}`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    ID: {drop.tokenId}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center pb-4 pt-2 text-xs text-muted-foreground font-body">
            <p>{collectedDrops.length} items in collection</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCollectionPage;
