// =====================================================================
//  LIVE GitHub API service for SudhirDevOps1
//  100% REAL DATA from GitHub REST API v3
//  Verified: 16 June 2026
// =====================================================================

import { formatDistanceToNow } from 'date-fns';

export const USERNAME = "SudhirDevOps1";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  blog: string | null;
  location: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  company: string | null;
  twitter_username: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  homepage: string | null;
  clone_url: string;
  ssh_url: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license: { name: string; spdx_id: string; key: string } | null;
  has_pages: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  default_branch: string;
}

const API_BASE = "https://api.github.com";

export async function fetchUser(): Promise<GitHubUser> {
  const res = await fetch(`${API_BASE}/users/${USERNAME}`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const all: GitHubRepo[] = [];
  let page = 1;
  while (page <= 5) {
    const res = await fetch(
      `${API_BASE}/users/${USERNAME}/repos?per_page=100&page=${page}&sort=updated&direction=desc`
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    const data: GitHubRepo[] = await res.json();
    if (data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return all.filter(r => !r.fork && !r.archived && !r.disabled);
}

export function getLiveUrl(repo: GitHubRepo): string | null {
  if (repo.homepage && repo.homepage.trim().length > 0) {
    let url = repo.homepage.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    return url;
  }
  if (repo.has_pages) {
    return `https://${USERNAME.toLowerCase()}.github.io/${repo.name}/`;
  }
  return null;
}

export function getTotalStars(repos: GitHubRepo[]): number {
  return repos.reduce((sum, r) => sum + r.stargazers_count, 0);
}

export function getTotalForks(repos: GitHubRepo[]): number {
  return repos.reduce((sum, r) => sum + r.forks_count, 0);
}

export function getTotalSize(repos: GitHubRepo[]): number {
  return repos.reduce((sum, r) => sum + r.size, 0);
}

export function getLanguageStats(
  repos: GitHubRepo[]
): { name: string; count: number; percent: number; color: string }[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of repos) {
    if (r.language) {
      counts[r.language] = (counts[r.language] || 0) + 1;
      total++;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.count - a.count);
}

const LANG_COLORS: Record<string, string> = {
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Python': '#3572A5',
  'Java': '#b07219',
  'Shell': '#89e051',
  'C': '#555555',
  'C++': '#f34b7d',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Swift': '#ffac45',
  'Kotlin': '#A97BFF',
  'Vue': '#41b883',
  'React': '#61dafb',
};

export function getLanguageColor(name: string): string {
  return LANG_COLORS[name] || '#8b949e';
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatBytes(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function getTopRepos(repos: GitHubRepo[], count: number = 6): GitHubRepo[] {
  return [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, count);
}

export function getRecentlyUpdated(repos: GitHubRepo[], count: number = 5): GitHubRepo[] {
  return [...repos]
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, count);
}

export const VERIFIED_DATE = "16 June 2026";
