import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles, 
  ExternalLink, 
  Star, 
  Code, 
  Laptop, 
  Shield, 
  Layers, 
  Send, 
  Check, 
  Copy, 
  Compass, 
  GraduationCap, 
  Globe, 
  ArrowUpRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GitHubUser, GitHubRepo, getTotalStars } from '../data/github';
import { PROFILE_INFO, TECH_STACK_ICONS } from '../data/profileData';
import { TiltCard } from './TiltCard';
import { AnimatedCounter } from './AnimatedCounter';
import { AnimatedImage } from './ui/AnimatedImage';

interface PortfolioTabProps {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
  error?: string | null;
}

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
  </svg>
);

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ user, repos, loading, error: _error }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'crypto' | 'pwa' | 'apps'>('all');
  const [copiedClone, setCopiedClone] = useState<string | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: 'whoami', output: 'Sudhir Singh (SudhirDevOps1) — BCA Student & Full-Stack / DevOps Architect from Bihar, India.' },
    { cmd: 'status', output: '🚀 Available for tech internships, freelance full-stack projects, and open-source collaborations.' }
  ]);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const totalStars = getTotalStars(repos);
  const publicRepos = user?.public_repos ?? repos.length;
  const followers = user?.followers ?? 0;

  // Handle terminal command execution
  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim().toLowerCase();
    let res = '';

    switch (trimmed) {
      case 'help':
        res = 'Available commands: whoami, skills, projects, education, stats, contact, clear, sudo hire';
        break;
      case 'whoami':
        res = `Sudhir Singh | GitHub: @SudhirDevOps1 | Location: Bihar, India | Focus: Full-Stack Web, DevOps, TypeScript & Cryptography.`;
        break;
      case 'skills':
        res = 'Frontend: React, Next.js, TypeScript, Tailwind CSS\nBackend: Node.js, Python, REST APIs\nDevOps: Git, GitHub Actions, Vercel, Cloudflare, Linux\nSecurity: AES-GCM-256 E2EE, Zero-Knowledge architecture';
        break;
      case 'projects':
        res = '1. BlindShare (Zero-Knowledge AES-GCM Encrypted File Sharing)\n2. code-to-image-generator (PWA Syntax Highlighting Tool)\n3. NovaPulse (Modern Web Experience)\n4. aalm-vastralay (TypeScript E-Commerce Engine)\n5. The-Ultimate-Master-Study-Tracker (Analytics Suite)';
        break;
      case 'education':
        res = 'Bachelor of Computer Applications (BCA) • Passionate self-driven engineering with 100% verified GitHub projects.';
        break;
      case 'stats':
        res = `Live Repos: ${publicRepos} | Total Stars: ${totalStars} | Followers: ${followers} | Verified: Active 2026`;
        break;
      case 'contact':
        res = `Telegram: ${PROFILE_INFO.telegram} | GitHub: ${PROFILE_INFO.github} | Portfolio: ${PROFILE_INFO.website}`;
        break;
      case 'sudo hire':
      case 'hire':
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        res = '🎉 Access Granted! Sudhir is ready for hire. Reaching out via Telegram @SudhirDevOps1 is the fastest way!';
        break;
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      default:
        res = `Command not recognized: "${trimmed}". Type "help" to see available commands.`;
    }

    setTerminalHistory(prev => [...prev, { cmd: cmdText, output: res }]);
    setTerminalInput('');
  };

  const handleCopyClone = (repoName: string, cloneUrl: string) => {
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedClone(repoName);
    setTimeout(() => setCopiedClone(null), 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setContactStatus('Thank you! Your message has been prepared. You can also message directly on Telegram @SudhirDevOps1.');
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactStatus(null), 6000);
  };

  // Curated flagship projects backed by live GitHub API data
  const flagshipProjects = [
    {
      name: 'BlindShare',
      stars: repos.find(r => r.name.toLowerCase() === 'blindshare')?.stargazers_count ?? 1,
      forks: repos.find(r => r.name.toLowerCase() === 'blindshare')?.forks_count ?? 0,
      description: 'Enterprise-grade zero-knowledge end-to-end encrypted file sharing platform powered by client-side Web Crypto AES-GCM-256.',
      liveUrl: 'https://blind-share.vercel.app',
      repoUrl: 'https://github.com/SudhirDevOps1/BlindShare',
      tags: ['Next.js', 'TypeScript', 'AES-GCM-256', 'E2EE', 'Security'],
      category: 'crypto',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      featured: true,
      icon: Shield
    },
    {
      name: 'code-to-image-generator',
      stars: repos.find(r => r.name.toLowerCase() === 'code-to-image-generator')?.stargazers_count ?? 4,
      forks: repos.find(r => r.name.toLowerCase() === 'code-to-image-generator')?.forks_count ?? 0,
      description: 'Progressive Web App (PWA) to generate gorgeous, high-resolution code snippet graphics with custom syntax highlighting, themes, and canvas export.',
      liveUrl: 'https://sudhirdevops1.github.io/code-to-image-generator/',
      repoUrl: 'https://github.com/SudhirDevOps1/code-to-image-generator',
      tags: ['PWA', 'Tailwind CSS', 'JavaScript', 'Canvas API', 'Syntax Highlighter'],
      category: 'pwa',
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      featured: true,
      icon: Code
    },
    {
      name: 'NovaPulse',
      stars: repos.find(r => r.name.toLowerCase() === 'novapulse')?.stargazers_count ?? 2,
      forks: repos.find(r => r.name.toLowerCase() === 'novapulse')?.forks_count ?? 1,
      description: 'Ultra-fast, fluid modern web interface featuring bespoke glassmorphic aesthetics, dynamic micro-interactions, and responsive layout.',
      liveUrl: 'https://sudhirdevops1.github.io/NovaPulse/',
      repoUrl: 'https://github.com/SudhirDevOps1/NovaPulse',
      tags: ['JavaScript', 'HTML5', 'CSS3 Animation', 'Responsive UI'],
      category: 'apps',
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
      borderColor: 'border-violet-500/30 hover:border-violet-400',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      featured: true,
      icon: Laptop
    },
    {
      name: 'aalm-vastralay',
      stars: repos.find(r => r.name.toLowerCase() === 'aalm-vastralay')?.stargazers_count ?? 2,
      forks: repos.find(r => r.name.toLowerCase() === 'aalm-vastralay')?.forks_count ?? 1,
      description: 'Full-featured modern apparel e-commerce web storefront built with TypeScript, structured product catalogs, and cart state management.',
      liveUrl: 'https://sudhirdevops1.github.io/aalm-vastralay/',
      repoUrl: 'https://github.com/SudhirDevOps1/aalm-vastralay',
      tags: ['TypeScript', 'E-Commerce', 'Responsive Web', 'Catalog Engine'],
      category: 'apps',
      gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
      borderColor: 'border-pink-500/30 hover:border-pink-400',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      featured: false,
      icon: Layers
    },
    {
      name: 'The-Ultimate-Master-Study-Tracker',
      stars: repos.find(r => r.name.toLowerCase().includes('study-tracker'))?.stargazers_count ?? 1,
      forks: repos.find(r => r.name.toLowerCase().includes('study-tracker'))?.forks_count ?? 0,
      description: 'Gamified student productivity dashboard with deep subject analytics, study sessions tracking, streak monitors, and goal visualization.',
      liveUrl: 'https://the-ultimate-master-study-tracker.vercel.app/',
      repoUrl: 'https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker',
      tags: ['TypeScript', 'Vercel', 'Dashboard', 'Analytics', 'Productivity'],
      category: 'apps',
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      featured: false,
      icon: GraduationCap
    },
    {
      name: 'LinkForge',
      stars: repos.find(r => r.name.toLowerCase() === 'linkforge')?.stargazers_count ?? 0,
      forks: repos.find(r => r.name.toLowerCase() === 'linkforge')?.forks_count ?? 0,
      description: 'High-speed, customizable developer Linktree alternative with analytics telemetry, deep social embeds, and ultra-minimalist theme presets.',
      liveUrl: 'https://linkforge-demo.vercel.app',
      repoUrl: 'https://github.com/SudhirDevOps1/LinkForge',
      tags: ['TypeScript', 'Vercel', 'Next.js', 'Developer Tools'],
      category: 'apps',
      gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-sky-500/30 hover:border-sky-400',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      featured: false,
      icon: Globe
    }
  ];

  const filteredProjects = flagshipProjects.filter(p => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16 animate-fade-in text-slate-100">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl glass border border-white/10 p-8 sm:p-14 shadow-3d">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* Avatar with dynamic aurora rings & status */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-spin-slow"></div>
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1.5 bg-slate-950 ring-2 ring-cyan-400/50 shadow-2xl">
              <img 
                src={user?.avatar_url ?? PROFILE_INFO.avatar} 
                alt="Sudhir Singh" 
                className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Online pulsing indicator */}
              <div className="absolute bottom-3 right-3 bg-slate-950 p-1.5 rounded-full border border-emerald-400/50 shadow-lg">
                <div className="w-4 h-4 rounded-full bg-emerald-400 animate-ping absolute"></div>
                <div className="w-4 h-4 rounded-full bg-emerald-400 relative"></div>
              </div>
            </div>
            
            {/* Quick Experience Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-400/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono font-semibold text-cyan-300 shadow-xl whitespace-nowrap flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>BCA 2026 • Developer</span>
            </div>
          </div>

          {/* Hero text & headline */}
          <div className="flex-1 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              LIVE RESEARCH & VERIFIED GITHUB IDENTITY
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Hi, I'm <span className="animate-rainbow-text">Sudhir Singh</span>
              </h1>
              <p className="text-lg sm:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300">
                Full-Stack Developer • Cryptography & DevOps Explorer
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Based in <strong className="text-white">Bihar, India</strong>. I build high-performance web applications, 
              zero-knowledge encrypted tools (like <strong className="text-emerald-400">BlindShare</strong>), 
              and developer utilities with <span className="text-cyan-400 font-mono">React, TypeScript, Next.js</span> and <span className="text-violet-400 font-mono">Tailwind CSS</span>.
            </p>

            {/* Quick Live Stats Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 shadow-sm">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Public Repos:</span>
                <span className="text-sm font-mono font-bold text-white">
                  {loading ? '…' : <AnimatedCounter value={publicRepos} duration={1000} />}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 shadow-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <span className="text-xs text-slate-400">Total Stars:</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {loading ? '…' : <AnimatedCounter value={totalStars} duration={1000} />}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 shadow-sm">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400">Followers:</span>
                <span className="text-sm font-mono font-bold text-emerald-300">
                  {loading ? '…' : <AnimatedCounter value={followers} duration={1000} />}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Open for Opportunities</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <a 
                href="#projects" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all duration-300 press-3d flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Explore Featured Projects</span>
              </a>

              <a 
                href={PROFILE_INFO.github} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400 text-white font-bold text-sm transition-all duration-300 press-3d flex items-center gap-2"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a 
                href={PROFILE_INFO.telegram} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-200 font-bold text-sm transition-all duration-300 press-3d flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-violet-400" />
                <span>Quick Chat (Telegram)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. INTERACTIVE LIVE TERMINAL (CLI)                             */}
      {/* ============================================================== */}
      <section className="rounded-3xl glass border border-white/10 p-6 sm:p-8 shadow-3d relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pl-3">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>sudhir@archlinux: ~ (interactive shell)</span>
            </div>
          </div>

          {/* Quick command pills */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {['whoami', 'skills', 'projects', 'education', 'stats', 'sudo hire', 'clear'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                ${cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Screen output */}
        <div className="py-4 space-y-3 font-mono text-xs sm:text-sm min-h-[160px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-slate-500">
            * Interactive Dev Environment initialized. Type <span className="text-cyan-400">help</span> or click buttons above.
          </div>

          {terminalHistory.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="text-emerald-400">sudhir@dev:~$</span>
                <span>{item.cmd}</span>
              </div>
              <div className="text-slate-300 whitespace-pre-wrap pl-4 border-l-2 border-cyan-500/30">
                {item.output}
              </div>
            </div>
          ))}
        </div>

        {/* Terminal input bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (terminalInput) executeCommand(terminalInput);
          }}
          className="mt-2 pt-3 border-t border-white/10 flex items-center gap-2 font-mono text-xs sm:text-sm"
        >
          <span className="text-emerald-400 font-bold shrink-0">sudhir@dev:~$</span>
          <input 
            type="text" 
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="Type command (e.g. skills, stats, sudo hire)..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600 font-mono text-xs sm:text-sm"
          />
          <button 
            type="submit"
            className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono transition-colors"
          >
            Run
          </button>
        </form>
      </section>

      {/* ============================================================== */}
      {/* 3. FEATURED LIVE PROJECTS (RESEARCH DATA)                     */}
      {/* ============================================================== */}
      <section id="projects-section" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold">
              <Flame className="w-4 h-4 text-amber-400" />
              Verified Production Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Projects & Systems
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Real projects fetched from <span className="text-cyan-300 font-mono">api.github.com/users/SudhirDevOps1</span> with 
              live demos, verified cryptographic implementations, and responsive UIs.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'crypto', label: 'Security & Crypto' },
              { id: 'pwa', label: 'PWAs & Tools' },
              { id: 'apps', label: 'Web Apps' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  filterCategory === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const Icon = project.icon;
            return (
              <TiltCard key={project.name} intensity={6} className="h-full">
                <div className={`h-full rounded-2xl glass border ${project.borderColor} p-6 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden bg-gradient-to-br ${project.gradient}`}>
                  
                  {/* Top card header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>

                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                            FLAGSHIP
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${project.badgeColor}`}>
                          <Star className="w-3 h-3 fill-current" />
                          <span>{project.stars}</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                        <span>{project.name}</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    {/* Tech stack tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>

                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>

                    <button
                      onClick={() => handleCopyClone(project.name, project.repoUrl)}
                      className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-cyan-300 text-xs transition-colors"
                      title="Copy git clone command"
                    >
                      {copiedClone === project.name ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. TECH RADAR & SKILLS MATRIX                                  */}
      {/* ============================================================== */}
      <section className="space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-violet-400 tracking-wider uppercase font-bold">
            <Zap className="w-4 h-4 text-violet-400" />
            Core Competencies & Stack
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technical Arsenal & Tooling
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Modern technologies used daily to architect, build, and deploy high-reliability software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Group 1: Frontend Architecture */}
          <div className="rounded-2xl glass border border-cyan-500/20 p-6 space-y-4 bg-gradient-to-b from-cyan-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Frontend</h3>
                <p className="text-[11px] font-mono text-cyan-400">UI / UX / PWAs</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center justify-between">
                <span>React.js & Next.js</span>
                <span className="text-cyan-400 font-bold">Advanced</span>
              </li>
              <li className="flex items-center justify-between">
                <span>TypeScript</span>
                <span className="text-cyan-400 font-bold">Proficient</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tailwind CSS</span>
                <span className="text-cyan-400 font-bold">Expert</span>
              </li>
              <li className="flex items-center justify-between">
                <span>HTML5 / Modern CSS</span>
                <span className="text-cyan-400 font-bold">Mastery</span>
              </li>
            </ul>
          </div>

          {/* Group 2: Security & Backend */}
          <div className="rounded-2xl glass border border-emerald-500/20 p-6 space-y-4 bg-gradient-to-b from-emerald-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Security & APIs</h3>
                <p className="text-[11px] font-mono text-emerald-400">Zero-Knowledge / Crypto</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center justify-between">
                <span>Web Crypto (AES-GCM-256)</span>
                <span className="text-emerald-400 font-bold">Verified</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Node.js / Express</span>
                <span className="text-emerald-400 font-bold">Solid</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Python Scripting</span>
                <span className="text-emerald-400 font-bold">Proficient</span>
              </li>
              <li className="flex items-center justify-between">
                <span>REST & WebSockets</span>
                <span className="text-emerald-400 font-bold">Solid</span>
              </li>
            </ul>
          </div>

          {/* Group 3: DevOps & Cloud */}
          <div className="rounded-2xl glass border border-violet-500/20 p-6 space-y-4 bg-gradient-to-b from-violet-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">DevOps & Cloud</h3>
                <p className="text-[11px] font-mono text-violet-400">CI/CD / Edge Networks</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center justify-between">
                <span>Git & GitHub Actions</span>
                <span className="text-violet-400 font-bold">Fluent</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Vercel & Cloudflare Edge</span>
                <span className="text-violet-400 font-bold">Production</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Linux & Terminal</span>
                <span className="text-violet-400 font-bold">Active</span>
              </li>
              <li className="flex items-center justify-between">
                <span>GitHub Pages CI</span>
                <span className="text-violet-400 font-bold">Daily</span>
              </li>
            </ul>
          </div>

          {/* Group 4: Foundations & Academia */}
          <div className="rounded-2xl glass border border-amber-500/20 p-6 space-y-4 bg-gradient-to-b from-amber-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Education</h3>
                <p className="text-[11px] font-mono text-amber-400">BCA Degree Program</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center justify-between">
                <span>Bachelor of Computer Applications</span>
                <span className="text-amber-400 font-bold">2026</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Data Structures & Algorithims</span>
                <span className="text-amber-400 font-bold">Solid</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Database Mgmt (DBMS)</span>
                <span className="text-amber-400 font-bold">Applied</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Computer Networks</span>
                <span className="text-amber-400 font-bold">Studied</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Tech Icon Badges Carousel / Grid */}
        <div className="rounded-2xl glass border border-white/10 p-6">
          <div className="text-xs font-mono text-slate-400 mb-4 flex items-center justify-between">
            <span>VERIFIED TECHNOLOGY ECOSYSTEM</span>
            <span className="text-cyan-400">{TECH_STACK_ICONS.length} Core Technologies</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {TECH_STACK_ICONS.map((tech) => (
              <div
                key={tech.name}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 flex items-center gap-2 text-xs font-semibold text-slate-200 transition-all hover:scale-105"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.hex }}></span>
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. GITHUB LIVE ANALYTICS & STATS EMBED                         */}
      {/* ============================================================== */}
      <section className="space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold">
            <Award className="w-4 h-4 text-cyan-400" />
            Live GitHub Activity Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            GitHub Performance Metrics
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time GitHub statistics synced directly from GitHub servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Readme Stats Card */}
          <div className="rounded-2xl glass border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-3d hover:border-cyan-400/40 transition-colors">
            <h4 className="text-sm font-mono text-cyan-400 mb-4 font-bold">
              GitHub Overall Activity Card
            </h4>
            <div className="w-full overflow-hidden rounded-xl bg-slate-950/60 p-2 border border-white/5">
              <AnimatedImage
                src="https://github-readme-stats.vercel.app/api?username=SudhirDevOps1&show_icons=true&theme=tokyonight&hide_border=true&bg_color=00000000"
                alt="SudhirDevOps1 GitHub Stats"
                className="max-w-md mx-auto"
                width={400}
                lazy={false}
              />
            </div>
          </div>

          {/* GitHub Streak Stats Card */}
          <div className="rounded-2xl glass border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-3d hover:border-violet-400/40 transition-colors">
            <h4 className="text-sm font-mono text-violet-400 mb-4 font-bold">
              GitHub Streaks & Commit Velocity
            </h4>
            <div className="w-full overflow-hidden rounded-xl bg-slate-950/60 p-2 border border-white/5">
              <AnimatedImage
                src="https://github-readme-streak-stats.herokuapp.com/?user=SudhirDevOps1&theme=tokyonight&hide_border=true&background=00000000"
                alt="SudhirDevOps1 GitHub Streak"
                className="max-w-md mx-auto"
                width={400}
                lazy={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. CONTACT & CONNECT HUB                                       */}
      {/* ============================================================== */}
      <section className="rounded-3xl glass border border-white/10 p-8 sm:p-12 shadow-3d relative overflow-hidden bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-violet-950/30">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              GET IN TOUCH DIRECTLY
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Let's Build Something <span className="animate-rainbow-text">Extraordinary</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether you have an internship opportunity, freelance project, open-source collaboration, 
              or simply want to talk tech and cryptography — my inbox is always open.
            </p>
          </div>

          {/* Social Quick-Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            
            <a 
              href={PROFILE_INFO.telegram} 
              target="_blank" 
              rel="noreferrer"
              className="p-5 rounded-2xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 flex flex-col items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-sm">Telegram</div>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">@SudhirDevOps1</div>
              </div>
            </a>

            <a 
              href={PROFILE_INFO.github} 
              target="_blank" 
              rel="noreferrer"
              className="p-5 rounded-2xl bg-white/5 hover:bg-violet-500/15 border border-white/10 hover:border-violet-400/50 transition-all duration-300 flex flex-col items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform">
                <GithubIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-sm">GitHub Profile</div>
                <div className="text-xs font-mono text-violet-400 mt-0.5">SudhirDevOps1</div>
              </div>
            </a>

            <a 
              href={PROFILE_INFO.website} 
              target="_blank" 
              rel="noreferrer"
              className="p-5 rounded-2xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/50 transition-all duration-300 flex flex-col items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-sm">Portfolio Hub</div>
                <div className="text-xs font-mono text-emerald-400 mt-0.5">sudhirdevops1.github.io</div>
              </div>
            </a>

          </div>

          {/* Interactive Quick Message Form */}
          <div className="pt-6 text-left">
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl mx-auto">
              {contactStatus && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-mono text-center">
                  {contactStatus}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Your Name</label>
                  <input 
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    placeholder="e.g. Alex Smith"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs sm:text-sm font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Your Email</label>
                  <input 
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    placeholder="e.g. alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs sm:text-sm font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Message / Project Details</label>
                <textarea 
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  placeholder="Tell me about your project, idea, or role..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs sm:text-sm font-sans"
                />
              </div>

              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all press-3d flex items-center justify-center gap-2 mx-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Direct Message</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};
