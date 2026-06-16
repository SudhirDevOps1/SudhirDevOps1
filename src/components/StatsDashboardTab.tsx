import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Folder, 
  Users, 
  Sparkles, 
  GitFork,
  Award,
  Terminal,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { GitHubUser, GitHubRepo, getTotalStars, getTotalForks, getLanguageStats, formatDate, getLiveUrl } from '../data/github';
import { AnimatedCounter } from './AnimatedCounter';

interface StatsDashboardTabProps {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
}

const LANG_COLORS: Record<string, string> = {
  HTML: 'bg-orange-500', CSS: 'bg-blue-400', JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-600', Python: 'bg-emerald-500', Shell: 'bg-green-600',
  Java: 'bg-red-500', 'Jupyter Notebook': 'bg-amber-500', Vue: 'bg-teal-500',
  PHP: 'bg-indigo-500', C: 'bg-slate-500', 'C++': 'bg-pink-500',
};
const getLangColor = (name: string) => LANG_COLORS[name] || 'bg-purple-500';

export const StatsDashboardTab: React.FC<StatsDashboardTabProps> = ({ user, repos, loading, error }) => {
  const langStats = useMemo(() => getLanguageStats(repos), [repos]);
  const totalStars = getTotalStars(repos);
  const totalForks = getTotalForks(repos);
  const liveCount = repos.filter(r => getLiveUrl(r)).length;

  const topStarred = useMemo(
    () => [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5),
    [repos]
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400 font-mono">Computing live analytics from the GitHub API…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-base text-white font-semibold">Could not load analytics</p>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  const maxLangCount = Math.max(...langStats.map(l => l.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-fade-in-down">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <BarChart3 className="w-6 h-6" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Live GitHub Analytics</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Computed live from real API data{user?.updated_at ? ` • profile updated ${formatDate(user.updated_at)}` : ''}.
            </p>
          </div>
        </div>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Public Repos</span>
            <Folder className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter value={user?.public_repos ?? repos.length} className="text-4xl font-extrabold text-white font-mono" />
            <span className="text-xs text-emerald-400 font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />Live</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Total Stars</span>
            <Star className="w-5 h-5 text-amber-400 fill-current" />
          </div>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter value={totalStars} className="text-4xl font-extrabold text-white font-mono" />
            <span className="text-xs text-amber-400 font-bold">earned</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Total Forks</span>
            <GitFork className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter value={totalForks} className="text-4xl font-extrabold text-white font-mono" />
            <span className="text-xs text-slate-400 font-mono">{liveCount} live</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Followers</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter value={user?.followers ?? 0} className="text-4xl font-extrabold text-white font-mono" />
            <span className="text-xs text-slate-400 font-mono">/{user?.following ?? 0} following</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Languages (real) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl card-3d">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-white flex items-center gap-2"><Terminal className="w-5 h-5 text-cyan-400" /><span>Repository Languages</span></h3>
              <p className="text-xs text-slate-400">Computed from your real repos' primary language</p>
            </div>
            <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">{langStats.length} Languages</span>
          </div>

          {langStats.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No language data available from the API.</p>
          ) : (
            <>
              <div className="w-full h-4 rounded-full bg-slate-950 flex overflow-hidden p-0.5 gap-0.5 border border-slate-800">
                {langStats.map((lm, idx) => (
                  <div key={idx} style={{ width: `${lm.percent}%` }} className={`h-full rounded-sm ${getLangColor(lm.name)}`} title={`${lm.name}: ${lm.percent}%`}></div>
                ))}
              </div>
              <div className="space-y-3.5 pt-2">
                {langStats.map((lm, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getLangColor(lm.name)}`}></span>
                        <span>{lm.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">({lm.count} repos)</span>
                      </span>
                      <span className="font-mono font-bold text-slate-300">{lm.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5">
                      <div style={{ width: `${Math.max((lm.count / maxLangCount) * 100, 4)}%`, animationDelay: `${idx * 100}ms` }} className={`h-full rounded-full ${getLangColor(lm.name)} animate-grow-bar`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top starred (real) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl card-3d">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /><span>Top Starred Repositories</span></h3>
            <p className="text-xs text-slate-400">Your most-starred real projects</p>
          </div>
          <div className="space-y-2.5">
            {topStarred.map((repo, idx) => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:translate-x-1 transition-all duration-300 group animate-slide-in-right" style={{ animationDelay: `${idx * 90}ms`, opacity: 0 }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-mono font-bold text-slate-600 w-5 shrink-0">#{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white font-mono truncate group-hover:text-amber-400">{repo.name}</p>
                    <p className="text-[10px] text-slate-500">{repo.language || 'No language'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-mono text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" />{repo.stargazers_count}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Live API stat images */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl card-3d">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /><span>Live Profile Cards & Trophies</span></h3>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1"><Award className="w-3.5 h-3.5" />Auto-rendered</span>
        </div>
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center overflow-x-auto shadow-inner">
          <img src="https://github-profile-trophy.vercel.app/?username=SudhirDevOps1&theme=tokyonight&no-frame=true&no-bg=true&margin-w=10&column=7" alt="GitHub Trophies" className="max-w-full h-auto py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center shadow-inner">
            <img src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=SudhirDevOps1&theme=tokyonight" alt="Repos per language" className="max-w-full h-auto" />
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center shadow-inner">
            <img src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=SudhirDevOps1&theme=tokyonight" alt="Most commit language" className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
