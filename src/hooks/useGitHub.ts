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

export function useGitHub(): GitHubState {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
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
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to load live GitHub data. API rate limit may be exceeded.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { user, repos, loading, error, refetch: fetchData, lastFetched };
}
