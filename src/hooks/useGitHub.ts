import { useState, useEffect, useCallback } from 'react';
import {
  fetchUser,
  fetchAllRepos,
  GitHubUser,
  GitHubRepo,
} from '../data/github';

interface GitHubState {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastFetched: Date | null;
}

const CACHE_KEY = 'github_studio_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readCache(): { user: GitHubUser; repos: GitHubRepo[]; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(user: GitHubUser, repos: GitHubRepo[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ user, repos, ts: Date.now() }));
  } catch {
    // sessionStorage might be unavailable
  }
}

export function useGitHub(): GitHubState {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = readCache();
      if (cached) {
        // Sort: starred first, then recently pushed
        const sortedRepos = cached.repos.sort((a, b) => {
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
        });
        setUser(cached.user);
        setRepos(sortedRepos);
        setLastFetched(new Date(cached.ts));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const [userData, repoData] = await Promise.all([
        fetchUser(),
        fetchAllRepos(),
      ]);
      
      // Sort: starred first, then recently pushed
      const sortedRepos = repoData.sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return (
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        );
      });
      
      setUser(userData);
      setRepos(sortedRepos);
      setLastFetched(new Date());
      writeCache(userData, sortedRepos);
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to load live GitHub data. API rate limit may be exceeded.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // refetch always forces a fresh API call
  const refetch = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return { user, repos, loading, error, refetch, lastFetched };
}

