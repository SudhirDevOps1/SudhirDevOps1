import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, 
  Download, 
  Check, 
  Palette, 
  Type, 
  Sparkles, 
  Eye, 
  Code,
  RefreshCw,
  Sliders,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { marked } from 'marked';
import { generateMarkdown } from '../data/profileData';
import { GitHubUser, GitHubRepo } from '../data/github';

interface MdCustomizerTabProps {
  theme: string;
  setTheme: (t: string) => void;
  headerTitle: string;
  setHeaderTitle: (t: string) => void;
  subtitle: string;
  setSubtitle: (s: string) => void;
  onCopyMd: () => void;
  onDownloadMd: () => void;
  isCopied: boolean;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
}

const THEME_OPTIONS = [
  { id: 'tokyonight', name: 'Tokyo Night', bg: 'bg-[#1a1b26]' },
  { id: 'radical', name: 'Radical Cyber', bg: 'bg-[#141321]' },
  { id: 'dracula', name: 'Dracula Dark', bg: 'bg-[#282a36]' },
  { id: 'onedark', name: 'One Dark', bg: 'bg-[#282c34]' },
  { id: 'synthwave', name: 'Synthwave 84', bg: 'bg-[#2b213a]' },
  { id: 'nord', name: 'Nord Clean', bg: 'bg-[#2e3440]' },
];

export const MdCustomizerTab: React.FC<MdCustomizerTabProps> = ({
  theme,
  setTheme,
  headerTitle,
  setHeaderTitle,
  subtitle,
  setSubtitle,
  onCopyMd,
  onDownloadMd,
  isCopied,
  user,
  repos,
  loading
}) => {
  const [activeView, setActiveView] = useState<'code' | 'preview'>('preview');

  // The strict markdown, rebuilt whenever live data or options change.
  const markdown = useMemo(
    () => generateMarkdown(theme, headerTitle, subtitle, user, repos),
    [theme, headerTitle, subtitle, user, repos]
  );

  // Editable copy for manual tweaks.
  const [customMarkdown, setCustomMarkdown] = useState<string>(markdown);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (!edited) setCustomMarkdown(markdown);
  }, [markdown, edited]);

  // Render markdown -> HTML for live preview (real markdown rendering).
  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(customMarkdown, { async: false }) as string;
    } catch {
      return '<p>Unable to render preview.</p>';
    }
  }, [customMarkdown]);

  const handleResetSync = () => {
    setCustomMarkdown(markdown);
    setEdited(false);
  };

  const handleDownload = () => {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.2 } });
    onDownloadMd();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl animate-fade-in-down">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 p-2 rounded-xl">
                <Sliders className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">strict .md Studio & Live Preview</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-xl flex items-center gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Building markdown from live GitHub data…</>
              ) : (
                <>The project tables, stars & links below are built from your <strong className="text-cyan-300">real {repos.length} repositories</strong>.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onCopyMd} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isCopied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}>
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{isCopied ? 'Copied!' : 'Copy strict .md'}</span>
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Download README.md</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6 animate-slide-in-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>1. Stats Card Theme</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${theme === opt.id ? 'bg-slate-800 border-cyan-500 text-white shadow-md shadow-cyan-500/10' : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${opt.bg} border border-slate-700`}></span>
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Type className="w-4 h-4 text-amber-400" />
              <span>2. Banner Text Customizer</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Header Wave Title</label>
                <input type="text" value={headerTitle} onChange={(e) => { setHeaderTitle(e.target.value); setEdited(false); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Typing SVG Subtitle</label>
                <input type="text" value={subtitle} onChange={(e) => { setSubtitle(e.target.value); setEdited(false); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500" />
              </div>
              <button onClick={handleResetSync} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset & Re-sync from live data</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border border-blue-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-cyan-300">100% Real Data</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The catalog table is generated from your live GitHub API repos with real descriptions, languages and homepage/GitHub-Pages live links. No fake entries.
            </p>
          </div>
        </div>

        {/* Editor + Live Preview */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-in-right">
          <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold font-mono text-white">README.md</span>
              {edited && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">edited</span>}
            </div>
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button onClick={() => setActiveView('preview')} className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${activeView === 'preview' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Eye className="w-3.5 h-3.5" /><span>Rendered Preview</span>
              </button>
              <button onClick={() => setActiveView('code')} className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${activeView === 'code' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Code className="w-3.5 h-3.5" /><span>Raw Markdown</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[600px] max-h-[760px] overflow-hidden flex bg-slate-950">
            {activeView === 'code' ? (
              <textarea
                value={customMarkdown}
                onChange={(e) => { setCustomMarkdown(e.target.value); setEdited(true); }}
                spellCheck={false}
                className="w-full h-full p-6 bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none"
              />
            ) : (
              <div className="w-full h-full overflow-y-auto bg-white">
                <div
                  className="md-render p-8 text-slate-800"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            )}
          </div>

          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>UTF-8 • GitHub-Flavored Markdown • live</span>
            <button onClick={onCopyMd} className="text-cyan-400 hover:underline font-semibold cursor-pointer">Copy complete code</button>
          </div>
        </div>
      </div>
    </div>
  );
};
