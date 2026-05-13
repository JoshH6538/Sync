export const CACHE_TTLS = {
  spotifyUser: 24 * 60 * 60 * 1000,
  spotifyTopItems: 60 * 60 * 1000,
  tasteProfile: 60 * 60 * 1000,
  ticketmasterAttraction: 7 * 24 * 60 * 60 * 1000,
  ticketmasterEvents: 60 * 60 * 1000,
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

export const getCachedValue = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry.expiresAt || Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const setCachedValue = <T>(key: string, value: T, ttlMs: number) => {
  const entry: CacheEntry<T> = {
    expiresAt: Date.now() + ttlMs,
    value,
  };

  localStorage.setItem(key, JSON.stringify(entry));
};
