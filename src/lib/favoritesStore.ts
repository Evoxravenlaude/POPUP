// Favorites storage for artists and POAPs
// Stored in localStorage under user's wallet address

const FAVORITES_KEY = "thepopup_favorites";

export interface Favorites {
  favoriteArtists: string[]; // artist wallet addresses
  favoritePOAPs: number[]; // campaign IDs
}

export function getFavorites(userAddress?: string): Favorites {
  if (!userAddress) {
    return { favoriteArtists: [], favoritePOAPs: [] };
  }

  try {
    const key = `${FAVORITES_KEY}_${userAddress.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : { favoriteArtists: [], favoritePOAPs: [] };
  } catch (error) {
    console.error("Error reading favorites:", error);
    return { favoriteArtists: [], favoritePOAPs: [] };
  }
}

export function toggleArtistFavorite(userAddress: string, artistAddress: string): boolean {
  const favorites = getFavorites(userAddress);
  const normalized = artistAddress.toLowerCase();
  const index = favorites.favoriteArtists.findIndex((a) => a.toLowerCase() === normalized);

  if (index >= 0) {
    favorites.favoriteArtists.splice(index, 1);
  } else {
    favorites.favoriteArtists.push(normalized);
  }

  try {
    const key = `${FAVORITES_KEY}_${userAddress.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(favorites));
    return index < 0; // return true if we just added it
  } catch (error) {
    console.error("Error updating favorites:", error);
    return false;
  }
}

export function isArtistFavorited(userAddress: string, artistAddress: string): boolean {
  const favorites = getFavorites(userAddress);
  return favorites.favoriteArtists.some((a) => a.toLowerCase() === artistAddress.toLowerCase());
}

export function togglePOAPFavorite(userAddress: string, campaignId: number): boolean {
  const favorites = getFavorites(userAddress);
  const index = favorites.favoritePOAPs.indexOf(campaignId);

  if (index >= 0) {
    favorites.favoritePOAPs.splice(index, 1);
  } else {
    favorites.favoritePOAPs.push(campaignId);
  }

  try {
    const key = `${FAVORITES_KEY}_${userAddress.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(favorites));
    return index < 0; // return true if we just added it
  } catch (error) {
    console.error("Error updating favorites:", error);
    return false;
  }
}

export function isPOAPFavorited(userAddress: string, campaignId: number): boolean {
  const favorites = getFavorites(userAddress);
  return favorites.favoritePOAPs.includes(campaignId);
}
