import React from 'react';
import { 
  Send, 
  Globe, 
  Code2, 
  FileCode, 
  Layers, 
  BarChart3, 
  Copy, 
  Download, 
  Check, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROFILE_INFO } from '../data/profileData';
import { GitHubUser } from '../data/github';

export type TabId = 'live-preview' | 'md-customizer' | 'repos-showcase' | 'stats-dashboard';

interface NavbarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onCopyMd: () => void;
  onDownloadMd: () => void;
  isCopied: boolean;
  user: GitHubUser | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onCopyMd,
  onDownloadMd,
  isCopied,
  user,
  loading,
  onRefresh
}) => {
  const handleDownload = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.1 } });
    onDownloadMd();
  };

  const repoCount = user?.public_repos ?? 0;
  const displayName = user?.name ?? 'Sudhir Singh';

  const tabs: { id: TabId; label: string; icon: any; badge?: string }[] = [
    { id: 'live-preview', label: 'GitHub Profile', icon: Code2 },
    { id: 'md-customizer', label: 'strict .md Studio', icon: FileCode },
    { id: 'repos-showcase', label: 'Live Repositories', icon: Layers, badge: loading ? '…' : String(repoCount) },
    { id: 'stats-dashboard', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 shadow-2xl animate-fade-in-down">
      {/* Top ribbon */}
      <div className="bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-slate-900/60 px-4 py-1.5 border-b border-slate-800/40 text-xs flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Live GitHub Studio v2.0
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline flex items-center gap-1.5">
            {loading ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Syncing with GitHub API…</>
            ) : (
              <><span className="text-emerald-400">●</span> Real-time data active</>
            )}
          </span>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer" title="GitHub" className="text-slate-300 hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
              </svg>
            </a>
            <a href={PROFILE_INFO.website} target="_blank" rel="noreferrer" title="Portfolio" className="text-slate-300 hover:text-white transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href={PROFILE_INFO.telegram} target="_blank" rel="noreferrer" title="Telegram" className="text-slate-300 hover:text-white transition-colors">
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300 animate-glow-pulse"></div>
            <img 
              src={user?.avatar_url ?? PROFILE_INFO.avatar} 
              alt={displayName} 
              className="relative w-11 h-11 rounded-full border-2 border-slate-900 object-cover shadow-inner transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-white to-slate-300 bg-clip-text text-transparent animate-gradient-text">
                {displayName}
              </h1>
              <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold">
                @{PROFILE_INFO.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {loading ? (
                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</span>
              ) : (
                <span>{repoCount} Public Repos • BCA Student • India</span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:scale-105'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          <button
            onClick={onCopyMd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border cursor-pointer hover:scale-105 active:scale-95 ${
              isCopied
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isCopied ? 'Copied!' : 'Copy .md'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <a
            href={PROFILE_INFO.website}
            target="_blank"
            rel="noreferrer"
            className="hidden xl:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 hover:bg-slate-800 transition-all"
          >
            <span>Portfolio</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
