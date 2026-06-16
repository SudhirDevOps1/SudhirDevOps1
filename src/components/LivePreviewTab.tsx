import React, { useState } from 'react';
import { 
  BookOpen, 
  Star, 
  ExternalLink, 
  GitFork, 
  Sparkles, 
  MapPin, 
  GraduationCap, 
  Flame, 
  Eye, 
  Code,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Database,
  Calendar
} from 'lucide-react';
import { PROFILE_INFO, TECH_STACK_ICONS } from '../data/profileData';
import { GitHubUser, GitHubRepo, getLiveUrl, getTotalStars, getTotalForks, formatDate, timeAgo, getLanguageColor, formatBytes } from '../data/github';
import { TabId } from './Navbar';
import { AnimatedCounter } from './AnimatedCounter';
import { TiltCard } from './TiltCard';

interface LivePreviewTabProps {
  theme: string;
  headerTitle: string;
  subtitle: string;
  setActiveTab: (tab: TabId) => void;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
}

export const LivePreviewTab: React.FC<LivePreviewTabProps> = ({ 
  theme, 
  headerTitle, 
  subtitle,
  setActiveTab,
  user,
  repos,
  loading,
  error
}) => {
  const [copiedClone, setCopiedClone] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'recent'>('overview');

  const displayName = user?.name ?? 'Sudhir Singh';
  const repoCount = user?.public_repos ?? repos.length;
  const totalStars = getTotalStars(repos);
  const totalForks = getTotalForks(repos);
  const totalSize = repos.reduce((sum, r) => sum + r.size, 0);
  const featuredRepos = repos.slice(0, 6);
  const recentRepos = [...repos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()).slice(0, 6);

  const handleClone = (repo: GitHubRepo) => {
    navigator.clipboard.writeText(`git clone ${repo.clone_url}`);
    setCopiedClone(repo.name);
    setTimeout(() => setCopiedClone(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4 bg-[#0d1117] animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-glow-pulse"></div>
          <Loader2 className="relative w-12 h-12 text-cyan-400 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-mono animate-fade-in-up">Fetching live data from GitHub API…</p>
        <p className="text-xs text-slate-600 animate-fade-in-up stagger-2">Real-time data • No cached info • 100% authentic</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4 bg-[#0d1117] px-6">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-base text-white font-semibold">Could not load live GitHub data</p>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-xl font-semibold transition-colors">
          View Profile on GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg text-[#c9d1d9] pb-12 relative">
      {/* Animated colorful grid overlay */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-40"></div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 relative z-10">
        {/* Header with typing animation */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] animate-scale-in hover:border-cyan-500/40 transition-colors duration-500">
          <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer" className="block">
            <img 
              src={`https://capsule-render.vercel.app/api?type=waving&color=0:0F2027,30:203A43,60:2C5364,100:36BCF7&height=250&section=header&text=${encodeURIComponent(headerTitle)}&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=BCA%20Student%20%E2%80%A2%20Aspiring%20Full-Stack%20Developer%20%E2%80%A2%20Bihar%2C%20India&descSize=18&descAlignY=60`} 
              width="100%" 
              alt="Header"
              className="w-full object-cover min-h-[180px]"
            />
          </a>
          <div className="p-6 text-center border-t border-[#30363d]/60 bg-[#0d1117]/80">
            <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer" className="inline-block max-w-full">
              <img 
                src={`https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&duration=2800&pause=900&color=36BCF7&center=true&vCenter=true&width=850&height=65&lines=${encodeURIComponent(subtitle)};%F0%9F%93%8D+Bihar%2C+India+%E2%80%A2+%F0%9F%8E%93+BCA+Student;%F0%9F%92%BB+Aspiring+Full-Stack+Developer;%F0%9F%9A%80+${repoCount}+public+repositories+on+GitHub`} 
                alt="Typing"
                className="max-w-full h-auto"
              />
            </a>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: About */}
          <div className="lg:col-span-8 bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg animate-slide-in-left hover:border-cyan-500/30 transition-colors duration-500">
            <div className="flex items-center gap-3 border-b border-[#30363d] pb-4">
              <span className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Sparkles className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">About Me</h2>
                <p className="text-xs text-[#8b949e]">{user?.updated_at ? `Profile updated ${timeAgo(user.updated_at)}` : 'Live profile data'}</p>
              </div>
            </div>

            <p className="text-[#c9d1d9] leading-relaxed text-sm sm:text-base">
              {user?.bio || 'I am Sudhir Singh, a BCA student from Bihar, India and an aspiring full-stack developer. I love building practical web tools, study utilities, media apps and small productivity projects.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
              <TiltCard className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-amber-500/50 shadow-3d" intensity={6}>
                <GraduationCap className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[#8b949e] text-xs block">Currently</span>
                  <strong className="text-white">Pursuing BCA Degree</strong>
                </div>
              </TiltCard>
              <TiltCard className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-red-500/50 shadow-3d" intensity={6}>
                <Flame className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[#8b949e] text-xs block">Passionate about</span>
                  <strong className="text-white">Coding, AI & Cyber Labs</strong>
                </div>
              </TiltCard>
              <TiltCard className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-cyan-500/50 shadow-3d" intensity={6}>
                <Code className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[#8b949e] text-xs block">Learning Stack</span>
                  <strong className="text-white">Python, JS, TS, Ethical Hacking</strong>
                </div>
              </TiltCard>
              <TiltCard className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-purple-500/50 shadow-3d" intensity={6}>
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[#8b949e] text-xs block">Location</span>
                  <strong className="text-white">Bihar, India</strong>
                </div>
              </TiltCard>
            </div>

            <div className="pt-4 border-t border-[#30363d]">
              <span className="text-xs uppercase tracking-wider text-[#8b949e] font-semibold block mb-3">Connect</span>
              <div className="flex flex-wrap items-center gap-2.5">
                <a href={PROFILE_INFO.website} target="_blank" rel="noreferrer">
                  <img src="https://img.shields.io/badge/Portfolio-sudhirdevops1.github.io-FF6B6B?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Portfolio" />
                </a>
                <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer">
                  <img src="https://img.shields.io/badge/GitHub-SudhirDevOps1-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
                </a>
                <a href={PROFILE_INFO.linkedin} target="_blank" rel="noreferrer">
                  <img src="https://img.shields.io/badge/LinkedIn-in%2FSudhirDevOps1-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Live Stats */}
          <div className="lg:col-span-4 bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col items-center text-center justify-between space-y-6 shadow-lg animate-slide-in-right hover:border-cyan-500/30 transition-colors duration-500">
            <div className="relative">
              {/* Aurora Multi-color Glow behind avatar */}
              <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-2xl animate-aurora-glow"></div>
              {/* Orbital ring 1 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 rounded-full border border-cyan-400/20 border-dashed animate-spin-slow"></div>
              </div>
              {/* Orbital ring 2 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full border border-violet-400/15 border-dashed animate-spin-reverse"></div>
              </div>
              {/* Orbiting particles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 absolute animate-orbit shadow-lg shadow-cyan-400/50"></div>
                <div className="w-2 h-2 rounded-full bg-violet-400 absolute animate-orbit-2 shadow-lg shadow-violet-400/50"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400 absolute" style={{ animation: 'orbit2 10s linear infinite, particleFloat 2s ease-in-out infinite' }}></div>
              </div>
              {/* Scattered particles */}
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 absolute top-2 right-4 animate-particle shadow-sm" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-300 absolute bottom-4 left-2 animate-particle shadow-sm" style={{ animationDelay: '1.2s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-pink-300 absolute top-6 left-0 animate-particle shadow-sm" style={{ animationDelay: '2.4s' }}></div>
              {/* Main Avatar — interactive 3D */}
              <div className="relative animate-float">
                <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 rounded-full blur-lg opacity-70 animate-aurora-glow"></div>
                <TiltCard className="rounded-full" intensity={18} scale={1.06}>
                  <img 
                    src={user?.avatar_url ?? PROFILE_INFO.avatar} 
                    alt={displayName}
                    className="relative w-36 h-36 rounded-full border-4 border-[#0d1117] object-cover shadow-2xl cursor-pointer select-none" 
                  />
                </TiltCard>
                {/* Verified badge */}
                <span className="absolute bottom-1 right-2 bg-gradient-to-br from-emerald-400 to-cyan-500 border-2 border-[#161b22] text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/30 z-10 animate-glow-pulse" title="Live Verified">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold animate-rainbow-text">{displayName}</h3>
              <p className="text-sm font-mono text-cyan-400">@{PROFILE_INFO.username}</p>
            </div>

            <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-[#30363d] pb-2 transition-colors hover:text-white">
                <span className="text-[#8b949e]">📦 Public Repos</span>
                <AnimatedCounter value={repoCount} className="font-mono font-bold text-white text-sm" />
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#30363d] pb-2 transition-colors hover:text-white">
                <span className="text-[#8b949e]">⭐ Total Stars</span>
                <AnimatedCounter value={totalStars} className="font-mono font-bold text-amber-400 text-sm" />
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#30363d] pb-2 transition-colors hover:text-white">
                <span className="text-[#8b949e]">🍴 Total Forks</span>
                <span className="font-mono font-bold text-white text-sm">{totalForks}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#30363d] pb-2">
                <span className="text-[#8b949e]">💾 Code Size</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatBytes(totalSize)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#30363d] pb-2">
                <span className="text-[#8b949e]">👥 Followers</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{user?.followers ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-[#8b949e]">🗓️ Joined</span>
                <span className="font-mono text-slate-300 text-xs">{user?.created_at ? formatDate(user.created_at) : '—'}</span>
              </div>
            </div>

            <div className="w-full pt-2">
              <img src="https://komarev.com/ghpvc/?username=SudhirDevOps1&label=Profile+Views&color=36BCF7&style=for-the-badge" alt="Views" className="mx-auto rounded-lg shadow" />
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6 hover:border-cyan-500/30 transition-colors duration-500">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#30363d] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Tech Stack & Skills</h2>
              <p className="text-xs text-[#8b949e]">Technologies used across repositories</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] flex justify-center overflow-x-auto">
            <a href="https://skillicons.dev" target="_blank" rel="noreferrer">
              <img src="https://skillicons.dev/icons?i=html,css,js,ts,python,react,tailwind,bootstrap,git,github,vscode,linux,cloudflare,vercel&perline=14" alt="Tech" className="max-w-full h-auto py-2" />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            {TECH_STACK_ICONS.map((tech, idx) => (
              <TiltCard key={idx} className={`p-3 rounded-xl bg-gradient-to-br ${tech.color} border ${tech.border} flex flex-col items-center justify-center gap-2 text-center shadow-3d`} intensity={14} scale={1.08}>
                <img src={`https://skillicons.dev/icons?i=${tech.icon}`} alt={tech.name} className="w-8 h-8 drop-shadow transition-transform duration-300 group-hover:rotate-6" style={{ animationDelay: `${idx * 50}ms` }} />
                <span className="text-xs font-semibold text-slate-200">{tech.name}</span>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Featured Repos with Tabs */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-[#30363d] pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Repositories</h2>
              <p className="text-xs text-[#8b949e]">Real-time data from GitHub API • Stars, forks & links are LIVE</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveSubTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer press-3d ${activeSubTab === 'overview' ? 'bg-cyan-500 text-white shadow-md' : 'bg-[#21262d] text-slate-300 hover:text-white'}`}
              >
                Top Starred
              </button>
              <button 
                onClick={() => setActiveSubTab('recent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer press-3d ${activeSubTab === 'recent' ? 'bg-cyan-500 text-white shadow-md' : 'bg-[#21262d] text-slate-300 hover:text-white'}`}
              >
                Recently Updated
              </button>
              <button 
                onClick={() => setActiveTab('repos-showcase')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-all duration-200 cursor-pointer press-3d shadow-lg shadow-cyan-500/20"
              >
                View All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeSubTab === 'overview' ? featuredRepos : recentRepos).map((repo, idx) => {
              const live = getLiveUrl(repo);
              return (
                <div key={repo.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 80, 600)}ms`, opacity: 0 }}>
                <TiltCard className="bg-[#161b22] border border-[#30363d] hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-3d h-full group" intensity={10}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-5 h-5 text-cyan-400 shrink-0" />
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-bold text-white text-base font-mono hover:text-cyan-400 hover:underline truncate">
                          {repo.name}
                        </a>
                      </div>
                      {repo.language && (
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getLanguageColor(repo.language) }} title={repo.language}></span>
                      )}
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-3 min-h-[54px]">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {repo.language && (
                        <span className="px-2 py-0.5 text-[11px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-md">{repo.language}</span>
                      )}
                      {repo.topics.slice(0, 2).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 text-[11px] font-mono bg-slate-800/60 border border-slate-700 text-slate-300 rounded-md">{t}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-[#30363d]/80 pt-3 text-[#8b949e]">
                      <div className="flex items-center gap-3 font-mono">
                        <span className="flex items-center gap-1" title={`${repo.stargazers_count} stars`}>
                          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />{repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1" title={`${repo.forks_count} forks`}>
                          <GitFork className="w-3.5 h-3.5" />{repo.forks_count}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />{timeAgo(repo.pushed_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClone(repo)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all duration-200 cursor-pointer press-3d ${copiedClone === repo.name ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#0d1117] text-slate-300 border border-[#30363d] hover:text-white hover:border-cyan-500'}`}
                        title={`git clone ${repo.clone_url}`}
                      >
                        {copiedClone === repo.name ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                        <span>Clone</span>
                      </button>
                      {live && (
                        <a href={live} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 press-3d">
                          <Eye className="w-3 h-3" /><span>Live</span>
                        </a>
                      )}
                      <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#21262d] text-slate-200 border border-[#30363d] hover:bg-[#30363d] hover:scale-105 transition-all duration-200 press-3d ml-auto">
                        <span>GitHub</span><ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </TiltCard>
                </div>
              );
            })}
          </div>

          {/* Stats Cards */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TiltCard className="p-1 rounded-2xl bg-[#0d1117] border border-[#30363d] flex justify-center shadow-3d" intensity={6}>
              <img src={`https://github-readme-stats.vercel.app/api?username=SudhirDevOps1&show_icons=true&theme=${theme}&hide_border=true&include_all_commits=true&count_private=true`} alt="Stats" className="w-full max-w-[480px] object-contain py-2" />
            </TiltCard>
            <TiltCard className="p-1 rounded-2xl bg-[#0d1117] border border-[#30363d] flex justify-center shadow-3d" intensity={6}>
              <img src={`https://github-readme-streak-stats.herokuapp.com/?user=SudhirDevOps1&theme=${theme}&hide_border=true`} alt="Streak" className="w-full max-w-[480px] object-contain py-2" />
            </TiltCard>
          </div>
        </div>

        {/* Trophies & Activity */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl hover:border-cyan-500/30 transition-colors duration-500">
          <div className="space-y-2 border-b border-[#30363d] pb-4">
            <h2 className="text-xl font-bold text-white tracking-wide">Trophies & Contribution Activity</h2>
            <p className="text-xs text-[#8b949e]">Live-rendered from GitHub</p>
          </div>
          
          <div className="bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] flex justify-center overflow-x-auto shadow-inner">
            <img src={`https://github-profile-trophy.vercel.app/?username=SudhirDevOps1&theme=${theme}&no-frame=true&no-bg=true&margin-w=10&column=7`} alt="Trophies" className="max-w-full h-auto py-2" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] flex justify-center shadow-inner">
              <img src={`https://github-readme-stats.vercel.app/api/top-langs/?username=SudhirDevOps1&layout=compact&theme=${theme}&hide_border=true&langs_count=8`} alt="Languages" className="max-w-full h-auto py-1" />
            </div>
            <div className="lg:col-span-7 bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] flex justify-center shadow-inner">
              <img src={`https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=SudhirDevOps1&theme=${theme}&utcOffset=5.5`} alt="Productive time" className="max-w-full h-auto py-1" />
            </div>
          </div>
          
          <div className="bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] flex justify-center overflow-x-auto shadow-inner">
            <img src="https://github-readme-activity-graph.vercel.app/graph?username=SudhirDevOps1&theme=tokyo-night&hide_border=true&area=true&custom_title=Contribution%20Activity" alt="Activity" className="w-full py-1" />
          </div>
          
          <div className="bg-[#0d1117] p-6 rounded-2xl border border-[#30363d] flex flex-col items-center justify-center space-y-4 shadow-inner">
            <span className="text-xs font-mono font-semibold text-cyan-400">Contribution Graph Snake</span>
            <picture className="w-full flex justify-center max-w-[850px] overflow-x-auto py-2">
              <img alt="Snake" src="https://raw.githubusercontent.com/SudhirDevOps1/SudhirDevOps1/output/github-contribution-grid-snake.svg" className="max-w-full h-auto" />
            </picture>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#161b22] to-slate-900 border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Export your professional README.md</span>
            </h4>
            <p className="text-xs text-[#8b949e]">All data above is fetched live from the GitHub API.</p>
          </div>
          <button onClick={() => setActiveTab('md-customizer')} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Open .md Studio
          </button>
        </div>
      </div>
    </div>
  );
};
