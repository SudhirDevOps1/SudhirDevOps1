import { useState } from 'react';
import { Navbar, TabId } from './components/Navbar';
import { LivePreviewTab } from './components/LivePreviewTab';
import { MdCustomizerTab } from './components/MdCustomizerTab';
import { ReposShowcaseTab } from './components/ReposShowcaseTab';
import { StatsDashboardTab } from './components/StatsDashboardTab';
import { generateMarkdown, PROFILE_INFO } from './data/profileData';
import { useGitHub } from './hooks/useGitHub';
import { VERIFIED_DATE } from './data/github';
import { Code2, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('live-preview');
  
  // Live GitHub data
  const { user, repos, loading, error, refetch } = useGitHub();

  // Customizer states
  const [theme, setTheme] = useState<string>('tokyonight');
  const [headerTitle, setHeaderTitle] = useState<string>('Sudhir Singh');
  const [subtitle, setSubtitle] = useState<string>("Hi there 👋 I'm Sudhir Singh");

  // Interaction states
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyMd = () => {
    const mdContent = generateMarkdown(theme, headerTitle, subtitle, user, repos);
    navigator.clipboard.writeText(mdContent);
    setIsCopied(true);
    triggerToast('✓ markdown.md copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadMd = () => {
    const mdContent = generateMarkdown(theme, headerTitle, subtitle, user, repos);
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('✓ README.md downloaded successfully!');
  };

  const handleCopyClone = (cmd: string) => {
    triggerToast(`✓ Copied: ${cmd}`);
  };

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex flex-col font-['Inter'] selection:bg-cyan-500 selection:text-white relative">
      {/* Animated colorful grid overlay */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-30"></div>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-4 sm:right-6 z-[60] bg-gradient-to-r from-emerald-900 to-cyan-900 border border-emerald-500/50 text-emerald-100 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90vw] animate-slide-in-right">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0 animate-spin-slow" />
          <span className="text-xs font-mono font-bold">{toastMsg}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCopyMd={handleCopyMd}
        onDownloadMd={handleDownloadMd}
        isCopied={isCopied}
        user={user}
        loading={loading}
        onRefresh={refetch}
      />

      <main className="flex-1 relative z-10">
        {activeTab === 'live-preview' && (
          <LivePreviewTab
            theme={theme}
            headerTitle={headerTitle}
            subtitle={subtitle}
            setActiveTab={setActiveTab}
            user={user}
            repos={repos}
            loading={loading}
            error={error}
          />
        )}

        {activeTab === 'md-customizer' && (
          <MdCustomizerTab
            theme={theme}
            setTheme={setTheme}
            headerTitle={headerTitle}
            setHeaderTitle={setHeaderTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            onCopyMd={handleCopyMd}
            onDownloadMd={handleDownloadMd}
            isCopied={isCopied}
            user={user}
            repos={repos}
            loading={loading}
          />
        )}

        {activeTab === 'repos-showcase' && (
          <ReposShowcaseTab onCopyClone={handleCopyClone} repos={repos} loading={loading} error={error} />
        )}

        {activeTab === 'stats-dashboard' && (
          <StatsDashboardTab user={user} repos={repos} loading={loading} error={error} />
        )}
      </main>

      <footer className="mt-auto p-4 sm:p-6 relative z-20 animate-fade-in">
        <div className="max-w-7xl mx-auto glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-3d hover:border-cyan-400/40 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-4 text-center md:text-left relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-violet-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 animate-glow-pulse shrink-0">
              <Code2 className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 justify-center md:justify-start">
                <span className="animate-rainbow-text">Sudhir Singh Studio v2.5</span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">LIVE API</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">BCA • Aspiring Full-Stack Architect • Bihar, India</p>
              <p className="text-[10px] font-mono text-cyan-400/80 mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Verified: {VERIFIED_DATE} • Zero Cache • 100% Authentic API Deploys
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 font-semibold text-xs text-slate-200 relative z-10">
            <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400 transition-all duration-200 press-3d flex items-center gap-2">
              <svg className="w-4 h-4 fill-current text-cyan-400" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>
              <span>GitHub Hub</span>
            </a>
            <a href={PROFILE_INFO.website} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-400 transition-all duration-200 press-3d flex items-center gap-2">
              <svg className="w-4 h-4 fill-current text-violet-400" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 21.849c-3.111-.395-5.694-2.525-6.611-5.849h14.222c-.917 3.324-3.5 5.454-6.611 5.849zm1-15.849h-10c.85-2.453 2.973-4.321 5.688-4.839 2.164.316 4.093 1.611 5.163 3.513.117.207.228.423.332.648-.392-.208-.825-.322-1.183-.322zm-7 2h12v10h-12v-10zm-3 0h1c0 3.333 0 6.667 0 10h-1c-.552 0-1-.448-1-1v-8c0-.552.448-1 1-1zm16 0c.552 0 1 .448 1 1v8c0 .552-.448 1-1 1h-1v-10h1z"/></svg>
              <span>Portfolio Hub</span>
            </a>
            <a href={PROFILE_INFO.linkedin} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-400 transition-all duration-200 press-3d flex items-center gap-2">
              <svg className="w-4 h-4 fill-current text-blue-400" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <span>LinkedIn</span>
            </a>
            <a href={PROFILE_INFO.telegram} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-400 transition-all duration-200 press-3d flex items-center gap-2">
              <svg className="w-4 h-4 fill-current text-pink-400" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.895-1.058-.677-1.653-1.096-2.678-1.771-1.185-.778-.415-1.207.25-1.895.174-.179 3.197-2.932 3.256-3.178.007-.031.013-.15-.054-.213s-.175-.041-.249-.026c-.105.022-1.782 1.134-5.034 3.32-.476.326-.906.486-1.288.477-.42-.01-.1229-.12-.1728-.16-.607-.24-1.218-.4-1.218-.4-.68-.22-.971-.43-.915-.72.03-.15.22-.3.57-.45 2.25-1.03 4.88-2.13 7.9-3.41 3.75-1.58 4.53-1.86 5.05-1.87z"/></svg>
              <span>Telegram</span>
            </a>
            <button onClick={() => setActiveTab('md-customizer')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all duration-200 press-3d cursor-pointer font-bold">
              Launch Studio
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
