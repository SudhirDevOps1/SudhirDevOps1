import { GitHubUser, GitHubRepo, getLiveUrl, getTotalStars, formatDate, VERIFIED_DATE } from './github';

export const PROFILE_INFO = {
  username: "SudhirDevOps1",
  avatar: "https://avatars.githubusercontent.com/u/234449571?v=4",
  location: "Bihar, India",
  website: "https://sudhirdevops1.github.io",
  github: "https://github.com/SudhirDevOps1",
  linkedin: "https://linkedin.com/in/SudhirDevOps1",
  telegram: "https://t.me/SudhirDevOps1",
};

export const TECH_STACK_ICONS = [
  { name: "HTML5", icon: "html", color: "from-orange-500/20 to-orange-500/10", border: "border-orange-500/30", hex: "#E34F26" },
  { name: "CSS3", icon: "css", color: "from-blue-500/20 to-blue-500/10", border: "border-blue-500/30", hex: "#1572B6" },
  { name: "JavaScript", icon: "js", color: "from-yellow-500/20 to-yellow-500/10", border: "border-yellow-500/30", hex: "#F7DF1E" },
  { name: "TypeScript", icon: "ts", color: "from-blue-600/20 to-blue-600/10", border: "border-blue-600/30", hex: "#3178C6" },
  { name: "Python", icon: "python", color: "from-emerald-500/20 to-emerald-500/10", border: "border-emerald-500/30", hex: "#3776AB" },
  { name: "React", icon: "react", color: "from-cyan-500/20 to-cyan-500/10", border: "border-cyan-500/30", hex: "#61DAFB" },
  { name: "Tailwind CSS", icon: "tailwind", color: "from-teal-500/20 to-teal-500/10", border: "border-teal-500/30", hex: "#38B2AC" },
  { name: "Bootstrap", icon: "bootstrap", color: "from-purple-500/20 to-purple-500/10", border: "border-purple-500/30", hex: "#7952B3" },
  { name: "Git", icon: "git", color: "from-red-500/20 to-red-500/10", border: "border-red-500/30", hex: "#F05032" },
  { name: "GitHub", icon: "github", color: "from-slate-700/20 to-slate-700/10", border: "border-slate-700/30", hex: "#181717" },
  { name: "VS Code", icon: "vscode", color: "from-sky-500/20 to-sky-500/10", border: "border-sky-500/30", hex: "#007ACC" },
  { name: "Linux", icon: "linux", color: "from-amber-500/20 to-amber-500/10", border: "border-amber-500/30", hex: "#FCC624" },
  { name: "Cloudflare", icon: "cloudflare", color: "from-orange-600/20 to-orange-600/10", border: "border-orange-600/30", hex: "#F38020" },
  { name: "Vercel", icon: "vercel", color: "from-slate-800/20 to-slate-800/10", border: "border-slate-800/30", hex: "#000000" },
];

// =====================================================================
//  Professional README.md Generator — 100% LIVE DATA
//  Verified: 16 June 2026
// =====================================================================
export const generateMarkdown = (
  theme: string,
  headerTitle: string,
  subtitle: string,
  user: GitHubUser | null,
  repos: GitHubRepo[]
): string => {
  const encTitle = encodeURIComponent(headerTitle);
  const encSub = encodeURIComponent(subtitle);

  const publicRepos = user?.public_repos ?? repos.length;
  const followers = user?.followers ?? 0;
  const following = user?.following ?? 0;
  const totalStars = getTotalStars(repos);
  const joined = user?.created_at ? formatDate(user.created_at) : "—";

  // Top repos by stars (featured)
  const featured = repos.slice(0, 6);
  const pinnedCards = featured
    .map(
      (r) => `<a href="${r.html_url}">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=SudhirDevOps1&repo=${r.name}&theme=${theme}&hide_border=true" alt="${r.name}"/>
</a>`
    )
    .join("\n");

  // Project catalog table (top 25 repos with descriptions or live links)
  const projectRows = repos
    .filter((r) => r.description || getLiveUrl(r))
    .slice(0, 25)
    .map((r) => {
      const live = getLiveUrl(r);
      const liveCell = live ? `[🔗 Live](${live})` : "—";
      const desc = (r.description || "—").replace(/\|/g, "\\|").slice(0, 80) + (r.description && r.description.length > 80 ? "..." : "");
      const lang = r.language || "—";
      const stars = r.stargazers_count > 0 ? `⭐ ${r.stargazers_count}` : "";
      return `| [${r.name}](${r.html_url}) | ${desc} | ${lang} ${stars} | ${liveCell} |`;
    })
    .join("\n");

  return `<!--
================================================================================
  📄 markdown.md — SudhirDevOps1
  👤 Author      : Sudhir Singh
  📊 Data Source : GitHub REST API (PUBLIC) — 100% REAL LIVE DATA
  ✅ Verified on : ${VERIFIED_DATE}
  🔗 Live Studio : https://sudhirdevops1.github.io
  
  ⚠️  NOTE: All stats (stars, forks, repos) are REAL-TIME from GitHub API.
================================================================================
-->

<!-- 🌊 ANIMATED HEADER -->
<a href="https://github.com/SudhirDevOps1">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F2027,30:203A43,60:2C5364,100:36BCF7&height=260&section=header&text=${encTitle}&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=BCA%20Student%20%E2%80%A2%20Aspiring%20Full-Stack%20Developer%20%E2%80%A2%20Bihar%2C%20India&descSize=18&descAlignY=60" width="100%" alt="Header"/>
</a>

<!-- ✍️ TYPING ANIMATION -->
<div align="center">

<a href="https://github.com/SudhirDevOps1">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=26&duration=2800&pause=900&color=36BCF7&center=true&vCenter=true&width=900&height=70&lines=${encSub};%F0%9F%93%8D+Bihar%2C+India+%E2%80%A2+%F0%9F%8E%93+BCA+Student;%F0%9F%92%BB+Aspiring+Full-Stack+Developer;%F0%9F%9A%80+${publicRepos}+Public+Repositories" alt="Typing"/>
</a>

</div>

<!-- 👋 ABOUT SECTION -->
<table align="center" width="100%">
<tr>
<td width="60%" valign="top">

### 🙋‍♂️ About Me

I am **Sudhir Singh**, a **BCA student** from **Bihar, India** and an aspiring full-stack developer.
I love building practical web tools, study utilities, media apps and small productivity projects.

- 🎓 **Currently** pursuing **BCA**
- 💡 **Passionate about** coding, problem-solving and AI
- 🌱 **Learning** **Python**, **JavaScript** and **Ethical Hacking**
- 🛠️ **Working with** HTML, CSS, JavaScript, TypeScript, Python
- 🌐 **Portfolio** → [sudhirdevops1.github.io](https://sudhirdevops1.github.io)
- 📫 **Connect** → [LinkedIn](https://linkedin.com/in/SudhirDevOps1) • [Telegram](https://t.me/SudhirDevOps1)

</td>
<td width="40%" align="center" valign="top">

<img src="${user?.avatar_url || PROFILE_INFO.avatar}" width="200" style="border-radius:50%" alt="Avatar"/>

<br/><br/>

<a href="https://github.com/SudhirDevOps1">
  <img src="https://img.shields.io/badge/@SudhirDevOps1-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>

<br/>

<img src="https://komarev.com/ghpvc/?username=SudhirDevOps1&label=Profile+Views&color=36BCF7&style=for-the-badge" alt="Profile views"/>

</td>
</tr>
</table>

<!-- 🔗 CONNECT -->
<div align="center">

### 🌐 Connect With Me

<a href="https://sudhirdevops1.github.io">
  <img src="https://img.shields.io/badge/Portfolio-sudhirdevops1.github.io-FF6B6B?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Portfolio"/>
</a>
<a href="https://github.com/SudhirDevOps1">
  <img src="https://img.shields.io/badge/GitHub-SudhirDevOps1-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
<a href="https://linkedin.com/in/SudhirDevOps1">
  <img src="https://img.shields.io/badge/LinkedIn-in%2FSudhirDevOps1-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
<a href="https://t.me/SudhirDevOps1">
  <img src="https://img.shields.io/badge/Telegram-%40SudhirDevOps1-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"/>
</a>

</div>

<!-- 📊 LIVE STATS TABLE -->
<div align="center">

### 📊 Verified GitHub Statistics (LIVE)

| Metric | Value |
|:--|:--|
| 👤 **Name** | Sudhir Singh |
| 🆔 **Username** | [\`SudhirDevOps1\`](https://github.com/SudhirDevOps1) |
| 📍 **Location** | Bihar, India |
| 🌐 **Website** | https://sudhirdevops1.github.io |
| 📦 **Public Repositories** | **${publicRepos}** |
| ⭐ **Total Stars Earned** | **${totalStars}** |
| 👥 **Followers** | **${followers}** |
| ➡️ **Following** | **${following}** |
| 🗓️ **Joined GitHub** | ${joined} |
| ✅ **Last Updated** | ${VERIFIED_DATE} |

<br/>

<img src="https://img.shields.io/github/followers/SudhirDevOps1?label=Followers&style=for-the-badge&color=4ECDC4&logo=github" alt="Followers"/>
<img src="https://img.shields.io/github/stars/SudhirDevOps1?label=Total%20Stars&style=for-the-badge&color=FFDD00&logo=github" alt="Stars"/>
<img src="https://img.shields.io/badge/Public%20Repos-${publicRepos}-36BCF7?style=for-the-badge&logo=github&logoColor=white" alt="Repos"/>

</div>

<!-- 🛠️ TECH STACK -->
## 🛠️ Tech Stack

<div align="center">

<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=html,css,js,ts,python,react,tailwind,bootstrap,git,github,vscode,linux,cloudflare,vercel&perline=14" alt="Tech stack"/>
</a>

<br/><br/>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" />

</div>

<!-- 📌 FEATURED PROJECTS -->
## 📌 Featured Projects

<div align="center">

${pinnedCards}

</div>

<!-- 📚 PROJECT CATALOG -->
## 📚 Project Catalog

> **Note:** All repository data below is fetched LIVE from the GitHub API. 
> Stars ⭐, forks 🍴 and descriptions are real-time values.

| Repository | Description | Language | Live Demo |
|:--|:--|:--:|:--:|
${projectRows}

> 📦 **View all ${publicRepos} repositories:** [github.com/SudhirDevOps1?tab=repositories](https://github.com/SudhirDevOps1?tab=repositories)

<!-- 📈 GITHUB STATS -->
## 📈 GitHub Statistics

<div align="center">

<img height="170" src="https://github-readme-stats.vercel.app/api?username=SudhirDevOps1&show_icons=true&theme=${theme}&hide_border=true&include_all_commits=true&count_private=true" alt="GitHub stats"/>
<img height="170" src="https://github-readme-streak-stats.herokuapp.com/?user=SudhirDevOps1&theme=${theme}&hide_border=true" alt="GitHub streak"/>

<br/><br/>

<img height="180" src="https://github-readme-stats.vercel.app/api/top-langs/?username=SudhirDevOps1&layout=compact&theme=${theme}&hide_border=true&langs_count=8" alt="Top languages"/>

<br/><br/>

<img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=SudhirDevOps1&theme=${theme}" width="95%" alt="Profile summary"/>

</div>

<!-- 🏆 TROPHIES -->
## 🏆 GitHub Trophies

<div align="center">

<img src="https://github-profile-trophy.vercel.app/?username=SudhirDevOps1&theme=${theme}&no-frame=true&no-bg=true&margin-w=10&column=7" alt="Trophies"/>

</div>

<!-- 🐍 CONTRIBUTION SNAKE -->
## 🐍 Contribution Graph

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SudhirDevOps1/SudhirDevOps1/output/github-contribution-grid-snake-dark.svg"/>
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/SudhirDevOps1/SudhirDevOps1/output/github-contribution-grid-snake.svg"/>
  <img alt="Contribution snake" src="https://raw.githubusercontent.com/SudhirDevOps1/SudhirDevOps1/output/github-contribution-grid-snake.svg"/>
</picture>

</div>

<!-- 🌊 FOOTER -->
<div align="center">

<a href="https://github.com/SudhirDevOps1">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=22&duration=3000&pause=900&color=36BCF7&center=true&vCenter=true&width=900&height=55&lines=Thanks+for+visiting!+%F0%9F%99%8F;Open+to+collaboration+%F0%9F%9A%80;Let's+build+something+amazing!" alt="Footer typing"/>
</a>

<br/>

<a href="https://github.com/SudhirDevOps1">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:36BCF7,50:2C5364,100:0F2027&height=140&section=footer&text=Code%20%E2%80%A2%20Build%20%E2%80%A2%20Ship&fontSize=22&fontColor=ffffff&animation=fadeIn&fontAlignY=70" width="100%" alt="Footer"/>
</a>

<sub>📅 markdown.md • <strong>LIVE</strong> from GitHub API | <strong>${VERIFIED_DATE}</strong> | With 💙 by Sudhir Singh</sub>

</div>`;
};
