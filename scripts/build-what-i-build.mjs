import fs from 'node:fs';
import path from 'node:path';

const fontsCss = fs.readFileSync('assets/fonts.css', 'utf8');

// Match @font-face blocks
const fontFaceBlocks = fontsCss.match(/@font-face\s*\{[\s\S]*?\}/g) || [];
let archivoFont = '';
let jetbrainsFont = '';

for (const block of fontFaceBlocks) {
  if (block.includes("'Archivo Black'") || block.includes('"Archivo Black"')) {
    archivoFont = block;
  } else if (block.includes("'JetBrains Mono'") || block.includes('"JetBrains Mono"')) {
    jetbrainsFont = block;
  }
}

console.log('Archivo Black length:', archivoFont.length);
console.log('JetBrains Mono length:', jetbrainsFont.length);

if (!archivoFont || !jetbrainsFont) {
  throw new Error('Required fonts not found in assets/fonts.css');
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 540" width="1280" height="540" role="img" aria-label="What Sudhir builds: complete resilient applications, autonomous CI/CD pipelines, and hardened systems architecture">
  <title>What I Build — Sudhir Singh</title>
  <desc>Systems Engineering Command Center showcasing resilient local-first applications, autonomous telemetry pipelines, and containerized zero-dependency architecture.</desc>

  <defs>
    <style type="text/css"><![CDATA[
${archivoFont}
${jetbrainsFont}

      .arch { font-family: 'Archivo Black', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 400; }
      .mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

      /* Base opacity is ALWAYS 1 - Zero Camo Proxy Freezing */
      .card { opacity: 1; }
      .cockpit { opacity: 1; }

      /* Additive animations only */
      @keyframes ledPulse {
        0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
        50% { opacity: 0.35; filter: none; }
      }
      .led-1 { animation: ledPulse 2.4s ease-in-out infinite; }
      .led-2 { animation: ledPulse 2.4s ease-in-out 0.6s infinite; }
      .led-3 { animation: ledPulse 2.4s ease-in-out 1.2s infinite; }
      .led-4 { animation: ledPulse 2.4s ease-in-out 1.8s infinite; }

      @keyframes waveFlow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -400; }
      }
      .wave-anim {
        stroke-dasharray: 20 8;
        animation: waveFlow 14s linear infinite;
      }

      @keyframes ringSpinCW {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes ringSpinCCW {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }
      .spin-cw {
        transform-origin: 168px 271px;
        animation: ringSpinCW 20s linear infinite;
      }
      .spin-ccw {
        transform-origin: 168px 271px;
        animation: ringSpinCCW 15s linear infinite;
      }
      .shuriken-spin {
        transform-origin: 1198px 494px;
        animation: ringSpinCW 10s linear infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .led-1, .led-2, .led-3, .led-4, .wave-anim, .spin-cw, .spin-ccw, .shuriken-spin {
          animation: none !important;
        }
      }
    ]]></style>

    <linearGradient id="bgGrad" x1="0" y1="0" x2="1280" y2="540" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#070B14"/>
      <stop offset="0.5" stop-color="#0B0F19"/>
      <stop offset="1" stop-color="#0E1626"/>
    </linearGradient>

    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0F172A"/>
      <stop offset="1" stop-color="#0A0E1A"/>
    </linearGradient>

    <linearGradient id="cyanAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#818CF8"/>
    </linearGradient>

    <linearGradient id="purpleAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C084FC"/>
      <stop offset="1" stop-color="#E879F9"/>
    </linearGradient>

    <linearGradient id="emeraldAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#10B981"/>
      <stop offset="1" stop-color="#34D399"/>
    </linearGradient>

    <linearGradient id="waveGrad" x1="0" y1="0" x2="454" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#38BDF8" stop-opacity="0.3"/>
      <stop offset="0.3" stop-color="#38BDF8"/>
      <stop offset="0.7" stop-color="#818CF8"/>
      <stop offset="1" stop-color="#C084FC" stop-opacity="0.3"/>
    </linearGradient>

    <pattern id="gridDots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.9" fill="#94A3B8" fill-opacity="0.08"/>
    </pattern>

    <radialGradient id="glowCockpit" cx="0.2" cy="0.4" r="0.5">
      <stop offset="0" stop-color="#38BDF8" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#38BDF8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="540" fill="url(#bgGrad)"/>
  <rect width="1280" height="540" fill="url(#gridDots)"/>
  <circle cx="295" cy="254" r="280" fill="url(#glowCockpit)"/>

  <!-- Top Micro Telemetry Header -->
  <g transform="translate(48, 22)">
    <text class="mono" x="0" y="16" font-size="11" fill="#64748B" letter-spacing="2">// SYSTEMS ARCHITECTURE &amp; PRODUCTION MISSIONS</text>
    
    <g transform="translate(984, 0)">
      <rect width="200" height="24" rx="12" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-opacity="0.4"/>
      <circle class="led-1" cx="14" cy="12" r="3.5" fill="#10B981"/>
      <text class="mono" x="25" y="15.5" font-size="9" fill="#10B981" font-weight="700" letter-spacing="1">ALL SYSTEMS OPERATIONAL</text>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- LEFT COLUMN (42%): SYSTEMS COMMAND COCKPIT                      -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <g class="cockpit" transform="translate(48, 56)">
    <!-- Cockpit Frame Outer -->
    <rect width="494" height="396" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.4"/>
    <rect width="494" height="3" rx="1.5" fill="url(#cyanAccent)"/>

    <!-- Mac Browser Window Header -->
    <g transform="translate(0, 0)">
      <rect width="494" height="36" rx="16" fill="#0A0F1D"/>
      <rect y="20" width="494" height="16" fill="#0A0F1D"/>
      <line x1="0" y1="36" x2="494" y2="36" stroke="#1E293B" stroke-width="1"/>
      
      <!-- Traffic lights -->
      <circle cx="22" cy="18" r="4.5" fill="#EF4444"/>
      <circle cx="36" cy="18" r="4.5" fill="#F59E0B"/>
      <circle cx="50" cy="18" r="4.5" fill="#10B981"/>

      <!-- URL Bar -->
      <g transform="translate(70, 7)">
        <rect width="300" height="22" rx="6" fill="#070B14" stroke="#1E293B"/>
        <text class="mono" x="150" y="15" text-anchor="middle" font-size="10" fill="#94A3B8">systems.sudhir.dev/cockpit</text>
      </g>

      <!-- Subsystem badge -->
      <g transform="translate(382, 7)">
        <rect width="98" height="22" rx="6" fill="#38BDF8" fill-opacity="0.12" stroke="#38BDF8" stroke-opacity="0.4"/>
        <circle class="led-1" cx="10" cy="11" r="3" fill="#38BDF8"/>
        <text class="mono" x="19" y="14.5" font-size="8.5" fill="#38BDF8" font-weight="700" letter-spacing="0.5">TELEMETRY</text>
      </g>
    </g>

    <!-- Sub-Panel 1: Web Audio DSP Waveform Oscilloscope -->
    <g transform="translate(18, 48)">
      <rect width="458" height="82" rx="10" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
      
      <!-- Scope grid lines -->
      <line x1="0" y1="41" x2="458" y2="41" stroke="#1E293B" stroke-dasharray="3 3"/>
      <line x1="114" y1="0" x2="114" y2="82" stroke="#1E293B" stroke-dasharray="2 4" stroke-opacity="0.5"/>
      <line x1="229" y1="0" x2="229" y2="82" stroke="#1E293B" stroke-dasharray="2 4" stroke-opacity="0.5"/>
      <line x1="343" y1="0" x2="343" y2="82" stroke="#1E293B" stroke-dasharray="2 4" stroke-opacity="0.5"/>

      <!-- Scope labels -->
      <text class="mono" x="12" y="16" font-size="8.5" fill="#38BDF8" font-weight="700" letter-spacing="1">AUDIO DSP OSCILLOSCOPE</text>
      <text class="mono" x="446" y="16" text-anchor="end" font-size="8" fill="#64748B">48.0 kHz · STEREO PCM</text>

      <!-- Sine Wave Path (harmonic synthesis) -->
      <path class="wave-anim" d="M 10 41 Q 38 12 66 41 T 122 41 T 178 41 T 234 41 T 290 41 T 346 41 T 402 41 T 448 41" 
            fill="none" stroke="url(#waveGrad)" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 10 41 Q 38 24 66 41 T 122 41 T 178 41 T 234 41 T 290 41 T 346 41 T 402 41 T 448 41" 
            fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-opacity="0.4" stroke-linecap="round"/>

      <text class="mono" x="12" y="72" font-size="8" fill="#94A3B8">SYNTHESIS: BINAURAL &#183; ISOCHRONIC &#183; REAL-TIME CANVAS</text>
    </g>

    <!-- Sub-Panel 2: Dual Core (Cryptographic Vault + Server Blades) -->
    <g transform="translate(18, 140)">
      <!-- Left Box: AES-GCM-256 Vault -->
      <g>
        <rect width="194" height="142" rx="10" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
        <text class="mono" x="12" y="18" font-size="8.5" fill="#C084FC" font-weight="700" letter-spacing="1">AES-256 CRYPTO VAULT</text>
        
        <!-- Concentric Lock Rings -->
        <g transform="translate(0, 8)">
          <!-- Outer Ring -->
          <circle class="spin-cw" cx="168" cy="271" r="42" fill="none" stroke="#C084FC" stroke-width="1.4" stroke-dasharray="6 8" stroke-opacity="0.7"/>
          <!-- Mid Ring -->
          <circle class="spin-ccw" cx="168" cy="271" r="28" fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="4 6" stroke-opacity="0.8"/>
          <!-- Inner Core -->
          <circle cx="168" cy="271" r="14" fill="#0F172A" stroke="#10B981" stroke-width="1.4"/>
          <!-- Lock Icon Glyph -->
          <path d="M 165 268 v-3 a 3 3 0 0 1 6 0 v 3 h 1 a 1 1 0 0 1 1 1 v 6 a 1 1 0 0 1 -1 1 h -8 a 1 1 0 0 1 -1 -1 v -6 a 1 1 0 0 1 1 -1 z" fill="#10B981"/>
        </g>

        <text class="mono" x="97" y="128" text-anchor="middle" font-size="8" fill="#94A3B8">ZERO-KNOWLEDGE COURIER</text>
      </g>

      <!-- Right Box: 4 Server Blades Matrix -->
      <g transform="translate(204, 0)">
        <rect width="254" height="142" rx="10" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
        <text class="mono" x="12" y="18" font-size="8.5" fill="#38BDF8" font-weight="700" letter-spacing="1">BLADE CLUSTER TELEMETRY</text>

        <!-- Blade 1 -->
        <g transform="translate(10, 28)">
          <rect width="234" height="22" rx="5" fill="#0B101D" stroke="#1E293B"/>
          <circle class="led-1" cx="12" cy="11" r="3" fill="#10B981"/>
          <text class="mono" x="22" y="14" font-size="8" fill="#E2E8F0">NODE-01 // PWA CORE</text>
          <text class="mono" x="222" y="14" text-anchor="end" font-size="8" fill="#10B981">ONLINE</text>
        </g>

        <!-- Blade 2 -->
        <g transform="translate(10, 55)">
          <rect width="234" height="22" rx="5" fill="#0B101D" stroke="#1E293B"/>
          <circle class="led-2" cx="12" cy="11" r="3" fill="#C084FC"/>
          <text class="mono" x="22" y="14" font-size="8" fill="#E2E8F0">NODE-02 // CRON ENGINE</text>
          <text class="mono" x="222" y="14" text-anchor="end" font-size="8" fill="#C084FC">SYNCED</text>
        </g>

        <!-- Blade 3 -->
        <g transform="translate(10, 82)">
          <rect width="234" height="22" rx="5" fill="#0B101D" stroke="#1E293B"/>
          <circle class="led-3" cx="12" cy="11" r="3" fill="#38BDF8"/>
          <text class="mono" x="22" y="14" font-size="8" fill="#E2E8F0">NODE-03 // DOCKER K8S</text>
          <text class="mono" x="222" y="14" text-anchor="end" font-size="8" fill="#38BDF8">ACTIVE</text>
        </g>

        <!-- Blade 4 -->
        <g transform="translate(10, 109)">
          <rect width="234" height="22" rx="5" fill="#0B101D" stroke="#1E293B"/>
          <circle class="led-4" cx="12" cy="11" r="3" fill="#10B981"/>
          <text class="mono" x="22" y="14" font-size="8" fill="#E2E8F0">NODE-04 // VAULT ENCRYPT</text>
          <text class="mono" x="222" y="14" text-anchor="end" font-size="8" fill="#10B981">LOCKED</text>
        </g>
      </g>
    </g>

    <!-- Sub-Panel 3: Real-Time Console Readout -->
    <g transform="translate(18, 292)">
      <rect width="458" height="90" rx="10" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
      <text class="mono" x="12" y="20" font-size="9" fill="#38BDF8">&gt; git verify --strict-telemetry-parity</text>
      <text class="mono" x="12" y="38" font-size="9" fill="#10B981">[OK] 77 Repositories &#183; 44 Stars &#183; 3,063 Commits indexed</text>
      <text class="mono" x="12" y="56" font-size="9" fill="#94A3B8">[OK] Zero-drift schema gate passed &#183; SHA: 4e8547d</text>
      <text class="mono" x="12" y="74" font-size="8.5" fill="#A855F7">[LIVE] Telemetry frequency: 12h cron &#183; All health checks PASS &#10003;</text>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- RIGHT COLUMN (58%): 3 PRODUCTION CAPABILITY CARDS               -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <g class="cards" transform="translate(562, 56)">
    
    <!-- CARD 01: RESILIENT LOCAL-FIRST COCKPITS -->
    <g transform="translate(0, 0)">
      <rect width="670" height="122" rx="14" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.4"/>
      <rect width="4" height="122" rx="2" fill="#38BDF8"/>
      
      <text class="mono" x="22" y="24" font-size="10.5" fill="#38BDF8" font-weight="700" letter-spacing="1.5">01 // RESILIENT LOCAL-FIRST COCKPITS</text>
      
      <!-- Deployment Badge -->
      <g transform="translate(548, 12)">
        <rect width="102" height="22" rx="11" fill="#38BDF8" fill-opacity="0.12" stroke="#38BDF8" stroke-opacity="0.5"/>
        <circle class="led-1" cx="12" cy="11" r="3.5" fill="#38BDF8"/>
        <text class="mono" x="22" y="14.5" font-size="8.5" fill="#38BDF8" font-weight="700" letter-spacing="0.8">DEPLOYED</text>
      </g>

      <text class="arch" x="22" y="52" font-size="16.5" fill="#FFFFFF">Syntax Screen Studio &amp; Web Audio DSP</text>
      <text class="sans" x="22" y="74" font-size="11.5" fill="#94A3B8">Local-first client architectures with zero server dependency, standalone PWA runtime, and audio neuroscience waveform generators.</text>
      
      <g transform="translate(22, 100)">
        <text class="mono" font-size="9.5" fill="#475569">STACK: <tspan fill="#CBD5E1" font-weight="700">TypeScript &#183; Web Audio API &#183; SQLite &#183; Canvas PWA &#183; Electron</tspan></text>
      </g>
    </g>

    <!-- CARD 02: AUTONOMOUS CI/CD & TELEMETRY GATES -->
    <g transform="translate(0, 137)">
      <rect width="670" height="122" rx="14" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.4"/>
      <rect width="4" height="122" rx="2" fill="#C084FC"/>
      
      <text class="mono" x="22" y="24" font-size="10.5" fill="#C084FC" font-weight="700" letter-spacing="1.5">02 // AUTONOMOUS CI/CD &amp; TELEMETRY GATES</text>
      
      <!-- Deployment Badge -->
      <g transform="translate(536, 12)">
        <rect width="114" height="22" rx="11" fill="#C084FC" fill-opacity="0.12" stroke="#C084FC" stroke-opacity="0.5"/>
        <circle class="led-2" cx="12" cy="11" r="3.5" fill="#C084FC"/>
        <text class="mono" x="22" y="14.5" font-size="8.5" fill="#C084FC" font-weight="700" letter-spacing="0.8">AUTOMATED</text>
      </g>

      <text class="arch" x="22" y="52" font-size="16.5" fill="#FFFFFF">Scheduled Health Gates &amp; Verified API Engines</text>
      <text class="sans" x="22" y="74" font-size="11.5" fill="#94A3B8">GitHub Actions cron workflows polling GitHub REST v3 &amp; Search API, enforcing strict XML schema gates with zero-drift telemetry parity.</text>
      
      <g transform="translate(22, 100)">
        <text class="mono" font-size="9.5" fill="#475569">STACK: <tspan fill="#CBD5E1" font-weight="700">GitHub Actions &#183; Cron &#183; REST v3 &#183; GraphQL &#183; Python &#183; Node.js</tspan></text>
      </g>
    </g>

    <!-- CARD 03: HARDENED CONTAINERIZED MESH & SECURITY -->
    <g transform="translate(0, 274)">
      <rect width="670" height="122" rx="14" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.4"/>
      <rect width="4" height="122" rx="2" fill="#10B981"/>
      
      <text class="mono" x="22" y="24" font-size="10.5" fill="#10B981" font-weight="700" letter-spacing="1.5">03 // HARDENED CONTAINERIZED MESH &amp; SECURITY</text>
      
      <!-- Deployment Badge -->
      <g transform="translate(516, 12)">
        <rect width="134" height="22" rx="11" fill="#10B981" fill-opacity="0.12" stroke="#10B981" stroke-opacity="0.5"/>
        <circle class="led-3" cx="12" cy="11" r="3.5" fill="#10B981"/>
        <text class="mono" x="22" y="14.5" font-size="8.5" fill="#10B981" font-weight="700" letter-spacing="0.8">PROD HARDENED</text>
      </g>

      <text class="arch" x="22" y="52" font-size="16.5" fill="#FFFFFF">Containerized Microservices &amp; Cryptographic Vaults</text>
      <text class="sans" x="22" y="74" font-size="11.5" fill="#94A3B8">Client-side AES-GCM-256 encryption, zero-knowledge couriers, containerized workloads with Docker &amp; Kubernetes, and Linux kernel hardening.</text>
      
      <g transform="translate(22, 100)">
        <text class="mono" font-size="9.5" fill="#475569">STACK: <tspan fill="#CBD5E1" font-weight="700">Docker &#183; Kubernetes &#183; AES-GCM-256 &#183; Prometheus &#183; Linux Systems</tspan></text>
      </g>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- BOTTOM MANIFESTO STRIP (MISSION PARITY BANNER)                   -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <g transform="translate(48, 466)">
    <rect width="1184" height="54" rx="14" fill="#070B14" stroke="#1E293B" stroke-width="1.4"/>
    <rect width="4" height="54" rx="2" fill="url(#cyanAccent)"/>

    <!-- Left Manifesto Quote -->
    <text class="arch" x="24" y="32" font-size="13" fill="#E2E8F0" letter-spacing="0.5">&#8220;Zero fake data. Every line verified in production.&#8221;</text>

    <!-- Right Telemetry Coordinates -->
    <text class="mono" x="1120" y="32" text-anchor="end" font-size="10.5" fill="#38BDF8" font-weight="700" letter-spacing="1">77 REPOS &#183; 44&#9733; STARS &#183; 3,063 COMMITS &#183; BIHAR, IN</text>

    <!-- Spinning Shuriken Glyph (Ninja way homage) -->
    <g class="shuriken-spin">
      <!-- 4-point cyber shuriken -->
      <path d="M 1198 484 Q 1198 494 1208 494 Q 1198 494 1198 504 Q 1198 494 1188 494 Q 1198 494 1198 484 Z" fill="#38BDF8"/>
      <circle cx="1198" cy="494" r="2.5" fill="#070B14"/>
    </g>
  </g>

</svg>`;

fs.writeFileSync('assets/what-i-build.svg', svg.trim() + '\n', 'utf8');
console.log('Successfully written assets/what-i-build.svg! Size:', (Buffer.byteLength(svg) / 1024).toFixed(2), 'KB');
