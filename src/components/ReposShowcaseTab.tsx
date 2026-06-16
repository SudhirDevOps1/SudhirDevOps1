import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  Star, 
  GitFork, 
  ExternalLink, 
  Eye, 
  Terminal, 
  Layers, 
  Search, 
  Copy, 
  Check, 
  Clock,
  Loader2,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { GitHubRepo, getLiveUrl, getTotalStars, timeAgo } from '../data/github';
import { TiltCard } from './TiltCard';

interface ReposShowcaseTabProps {
  onCopyClone: (url: string) => void;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
}

type SortMode = 'stars' | 'updated' | 'name';

export const ReposShowcaseTab: React.FC<ReposShowcaseTabProps> = ({ onCopyClone, repos, loading, error }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('stars');
  const [onlyLive, setOnlyLive] = useState<boolean>(false);
  const [copiedCloneId, setCopiedCloneId] = useState<number | null>(null);

  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach(r => { if (r.language) set.add(r.language); });
    return Array.from(set).sort();
  }, [repos]);

  const filteredRepos = useMemo(() => {
    let list = repos.filter(repo => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        repo.name.toLowerCase().includes(q) ||
        (repo.description || '').toLowerCase().includes(q) ||
        repo.topics.some(t => t.toLowerCase().includes(q));
      const matchesLang = selectedLang === 'all' || repo.language === selectedLang;
      const matchesLive = !onlyLive || !!getLiveUrl(repo);
      return matchesSearch && matchesLang && matchesLive;
    });

    list = [...list].sort((a, b) => {
      if (sortMode === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
    return list;
  }, [repos, searchQuery, selectedLang, onlyLive, sortMode]);

  const handleCloneCopy = (repo: GitHubRepo, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloneCmd = `git clone ${repo.clone_url}`;
    navigator.clipboard.writeText(cloneCmd);
    onCopyClone(cloneCmd);
    setCopiedCloneId(repo.id);
    setTimeout(() => setCopiedCloneId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400 font-mono">Loading all real repositories from the GitHub API…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-base text-white font-semibold">Could not load repositories</p>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  const totalStars = getTotalStars(repos);
  const liveCount = repos.filter(r => getLiveUrl(r)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in-down">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Folder className="w-6 h-6" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {repos.length} Real GitHub Repositories
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Live from the GitHub API — real stars, forks, languages, <code className="text-cyan-400 font-mono">git clone</code> URLs and live demo links. Nothing fake.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
              <p className="text-lg font-extrabold text-amber-400 font-mono flex items-center gap-1 justify-center"><Star className="w-4 h-4 fill-current" />{totalStars}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Stars</p>
            </div>
            <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
              <p className="text-lg font-extrabold text-emerald-400 font-mono">{liveCount}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Live Demos</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search repos by name, description, topic..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <select
            value={selectedLang}
            onChange={e => setSelectedLang(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <button
            onClick={() => setSortMode(sortMode === 'stars' ? 'updated' : sortMode === 'updated' ? 'name' : 'stars')}
            className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 hover:border-cyan-500 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sort: {sortMode === 'stars' ? 'Stars' : sortMode === 'updated' ? 'Updated' : 'Name'}</span>
          </button>

          <button
            onClick={() => setOnlyLive(!onlyLive)}
            className={`flex items-center gap-1.5 text-xs rounded-xl px-3 py-2.5 border transition-colors cursor-pointer ${onlyLive ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live demos only</span>
          </button>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.map((repo, idx) => {
          const live = getLiveUrl(repo);
          return (
            <div key={repo.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 40, 600)}ms`, opacity: 0 }}>
            <TiltCard className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-3d h-full group relative overflow-hidden" intensity={9}>
              {live && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /><span>LIVE</span>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-bold text-white text-base font-mono hover:text-cyan-400 hover:underline truncate pr-12">
                    {repo.name}
                  </a>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 min-h-[54px]">
                  {repo.description || 'No description provided on GitHub.'}
                </p>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1.5">
                  {repo.language && <span className="px-2 py-0.5 text-[11px] font-mono bg-slate-950 border border-slate-800 text-cyan-300 rounded-md">{repo.language}</span>}
                  {repo.topics.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[11px] font-mono bg-slate-950 border border-slate-800 text-slate-400 rounded-md">{t}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-current" />{repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{repo.forks_count}</span>
                    <span className="flex items-center gap-1 text-[10px]"><Clock className="w-3 h-3" />{timeAgo(repo.pushed_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCloneCopy(repo, e)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all duration-200 cursor-pointer press-3d ${copiedCloneId === repo.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-cyan-500 hover:text-white'}`}
                    title={`git clone ${repo.clone_url}`}
                  >
                    {copiedCloneId === repo.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                    <span>Clone</span>
                  </button>
                  {live && (
                    <a href={live} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 transition-all duration-200 press-3d">
                      <Eye className="w-3 h-3" /><span>Live App</span>
                    </a>
                  )}
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:scale-105 transition-all duration-200 press-3d ml-auto">
                    <span>GitHub</span><ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </TiltCard>
            </div>
          );
        })}
      </div>

      {filteredRepos.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
          <Terminal className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No repositories matched your filters</h3>
          <p className="text-xs text-slate-400">Try clearing your search or language filter.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedLang('all'); setOnlyLive(false); }} className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
            <Layers className="w-4 h-4" /><span>Show All Repositories</span>
          </button>
        </div>
      )}
    </div>
  );
};
