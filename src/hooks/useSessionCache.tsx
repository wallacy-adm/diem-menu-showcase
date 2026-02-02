import { useCallback } from 'react';

const CACHE_PREFIX = 'carpe-menu-cache-';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes validity

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function useSessionCache<T>(key: string) {
  const cacheKey = CACHE_PREFIX + key;

  const getCache = useCallback((): T | null => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;

      const cached: CachedData<T> = JSON.parse(raw);
      const age = Date.now() - cached.timestamp;

      // Return cached data even if stale (we'll revalidate in background)
      if (cached.data && Array.isArray(cached.data) && cached.data.length > 0) {
        return cached.data;
      }

      return null;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const setCache = useCallback((data: T) => {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch {
      // Storage full or unavailable - fail silently
    }
  }, [cacheKey]);

  const isCacheValid = useCallback((): boolean => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return false;

      const cached: CachedData<T> = JSON.parse(raw);
      const age = Date.now() - cached.timestamp;

      return age < CACHE_DURATION_MS;
    } catch {
      return false;
    }
  }, [cacheKey]);

  return { getCache, setCache, isCacheValid };
}
