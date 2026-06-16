import { useState } from 'react';
import { Navbar, TabId } from './components/Navbar';
import { LivePreviewTab } from './components/LivePreviewTab';
import { MdCustomizerTab } from './components/MdCustomizerTab';
import { ReposShowcaseTab } from './components/ReposShowcaseTab';
import { StatsDashboardTab } from './components/StatsDashboardTab';
import { generateMarkdown, PROFILE_INFO } from './data/profileData';
import { useGitHub } from './hooks/useGitHub';
import { Code2, Sparkles, ShieldCheck } from 'lucide-react';

// Verified Date: 16 June 2026
const VERIFIED_DATE = "16 June 2026";

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
    triggerToast('✓ Strict README.md copied to clipboard!');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter'] selection:bg-cyan-500 selection:text-white relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[60] bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90vw] animate-slide-in-right">
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

      <main className="flex-1">
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

      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-slate-400 text-xs mt-auto relative z-30 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Sudhir Singh — Professional GitHub Studio</p>
              <p className="text-[11px] text-slate-500 font-mono">BCA • Full-Stack Developer • Bihar, India</p>
              <p className="text-[10px] text-cyan-500/70 mt-0.5">Verified: {VERIFIED_DATE} • 100% Live API Data</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-5 font-medium text-slate-300">
            <a href={PROFILE_INFO.github} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors link-underline">GitHub</a>
            <a href={PROFILE_INFO.website} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors link-underline">Portfolio</a>
            <a href={PROFILE_INFO.linkedin} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors link-underline">LinkedIn</a>
            <a href={PROFILE_INFO.telegram} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors link-underline">Telegram</a>
            <button onClick={() => setActiveTab('md-customizer')} className="hover:text-cyan-400 transition-colors cursor-pointer link-underline">Studio</button>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Live API • No Fake Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
