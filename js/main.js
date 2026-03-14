/* ═══════════════════════════════════════════════════════
   ALEX TryHackMe Dashboard — main.js
   Theme: Hacking / Futuriste / Kali Linux
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   1. LOADING SCREEN — Phase 1 : Boot  +  Phase 2 : Login
══════════════════════════════════════════════════════ */

const BOOT_LINES = [
  { txt: "[    0.000000] Linux version 6.11.0-kali9-amd64 (devel@kali.org)",          cls: "info", delay: 0   },
  { txt: "[    0.142883] BIOS-provided physical RAM map: 65536K OK",                  cls: "ok",   delay: 140 },
  { txt: "[    0.391028] Mounting encrypted filesystem (LUKS2)...",                   cls: "info", delay: 320 },
  { txt: "[    0.521304] Starting network-manager.service            [ OK ]",         cls: "ok",   delay: 480 },
  { txt: "[    0.688910] WARNING: eth0 — unknown hardware address type 778",          cls: "warn", delay: 620 },
  { txt: "[    0.801247] Started OpenSSH server daemon               [ OK ]",         cls: "ok",   delay: 760 },
  { txt: "[    0.934512] Started Metasploit Framework v6.3.55-dev    [ OK ]",         cls: "ok",   delay: 900 },
  { txt: "[    1.021700] VPN tunnel tun0 established: 10.8.0.1       [ SECURE ]",     cls: "ok",   delay: 1020},
  { txt: "[    1.140000] Reached target graphical.target",                            cls: "info", delay: 1140},
];

function initLoginScreen() {
  const biosLog  = document.getElementById("bios-log");
  const biosBar  = document.getElementById("bios-bar");
  const biosPct  = document.getElementById("bios-percent");
  const bootEl   = document.getElementById("boot-phase");
  const loginEl  = document.getElementById("login-phase");
  const loadingEl= document.getElementById("loading-screen");

  /* ── Phase 1 : boot lines ── */
  BOOT_LINES.forEach((line, i) => {
    setTimeout(() => {
      const div = document.createElement("div");
      div.className = `log-line ${line.cls}`;
      div.textContent = line.txt;
      biosLog.appendChild(div);
      biosLog.scrollTop = biosLog.scrollHeight;
      const pct = Math.round(((i + 1) / BOOT_LINES.length) * 100);
      biosBar.style.width = pct + "%";
      biosPct.textContent = pct + "%";
    }, line.delay);
  });

  /* ── Transition vers Phase 2 après 1.6 s ── */
  setTimeout(() => {
    bootEl.style.opacity = "0";
    setTimeout(() => {
      bootEl.style.display = "none";
      loginEl.classList.add("active");
      initLoginParticles();
      initDragonOrbit();
      startLoginClock();
      startAutoLogin(loadingEl);
    }, 500);
  }, 1600);
}

/* ── Horloge en bas de l'écran de login ── */
function startLoginClock() {
  const el = document.getElementById("login-clock");
  function tick() {
    if (!el) return;
    const n = new Date();
    el.textContent = pad(n.getHours()) + ":" + pad(n.getMinutes()) + ":" + pad(n.getSeconds());
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Auto-login séquence ── */
function startAutoLogin(loadingEl) {
  const userInput = document.getElementById("login-user");
  const passInput = document.getElementById("login-pass");
  const passGroup = document.getElementById("lg-pass");
  const btn       = document.getElementById("login-btn");
  const statusEl  = document.getElementById("login-status");
  const userCursor= document.getElementById("user-cursor");
  const passCursor= document.getElementById("pass-cursor");

  userInput.classList.add("active");

  /* Typage du username "root" */
  const USERNAME = "root";
  let uIdx = 0;
  const userTimer = setInterval(() => {
    if (uIdx < USERNAME.length) {
      userInput.value += USERNAME[uIdx++];
    } else {
      clearInterval(userTimer);
      userCursor.style.display = "none";

      /* Affiche le champ password */
      setTimeout(() => {
        passGroup.style.opacity    = "1";
        passGroup.style.transform  = "translateY(0)";
        passInput.classList.add("active");
        passCursor.style.display   = "inline";

        /* Typage du password (4 bullets simulées) */
        const PASS_LEN = 4;
        let pIdx = 0;
        const passTimer = setInterval(() => {
          if (pIdx < PASS_LEN) {
            passInput.value += "x";        // chaque char = •
            pIdx++;
          } else {
            clearInterval(passTimer);
            passCursor.style.display = "none";

            /* Affiche le bouton */
            setTimeout(() => {
              btn.style.opacity   = "1";
              btn.style.transform = "scale(1)";
              btn.classList.add("pulsing");

              /* Clic automatique */
              setTimeout(() => {
                btn.classList.remove("pulsing");
                btn.classList.add("clicking");
                document.getElementById("login-btn-text").textContent = "Connexion…";

                statusEl.className = "login-status info";
                statusEl.textContent = "Authentification en cours…";

                setTimeout(() => {
                  statusEl.className = "login-status ok";
                  statusEl.textContent = "✔ Accès accordé — [0x6] VOYAGER";

                  setTimeout(() => {
                    loadingEl.classList.add("fade-out");
                    setTimeout(() => {
                      loadingEl.style.display = "none";
                      document.getElementById("app").classList.add("visible");
                      initDashboard();
                    }, 800);
                  }, 900);
                }, 800);
              }, 1200);
            }, 400);
          }
        }, 160);
      }, 400);
    }
  }, 130);
}

/* ── Particules orbitales autour du dragon ── */
function initDragonOrbit() {
  const canvas = document.getElementById("dragon-orbit-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const CX = 130, CY = 130;

  // Orbites : { radius, speed, angle, size, color, trail }
  const ORBITS = [
    { r: 88,  speed:  0.022, a: 0,           size: 3,   color: "#2a6dd9", trail: [] },
    { r: 88,  speed:  0.022, a: Math.PI,      size: 2.5, color: "#00f3ff", trail: [] },
    { r: 108, speed: -0.014, a: Math.PI/2,    size: 2,   color: "#4488ff", trail: [] },
    { r: 108, speed: -0.014, a: 3*Math.PI/2,  size: 2,   color: "#6655ff", trail: [] },
    { r: 70,  speed:  0.035, a: Math.PI/4,    size: 1.5, color: "#00ccff", trail: [] },
    { r: 70,  speed:  0.035, a: 5*Math.PI/4,  size: 1.5, color: "#2a6dd9", trail: [] },
  ];

  const TRAIL_LEN = 22;

  function frame() {
    ctx.clearRect(0, 0, 260, 260);

    ORBITS.forEach(o => {
      o.a += o.speed;
      const x = CX + Math.cos(o.a) * o.r;
      const y = CY + Math.sin(o.a) * o.r;

      // Traînée
      o.trail.push({ x, y });
      if (o.trail.length > TRAIL_LEN) o.trail.shift();

      o.trail.forEach((pt, i) => {
        const alpha = (i / TRAIL_LEN) * 0.55;
        const radius = o.size * (i / TRAIL_LEN) * 0.8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.2, radius), 0, Math.PI * 2);
        ctx.fillStyle = o.color.replace(")", `, ${alpha})`).replace("rgb", "rgba").replace("#", "rgba(").replace(/^rgba\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/, (_,r,g,b) =>
          `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)}`);
        // Simpler approach:
        ctx.globalAlpha = alpha;
        ctx.fillStyle = o.color;
        ctx.fill();
      });

      // Point principal avec glow
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = o.color;
      ctx.beginPath();
      ctx.arc(x, y, o.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  frame();
}

/* ── Particules flottantes sur le fond ── */
function initLoginParticles() {
  const canvas = document.getElementById("login-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const DOTS = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.4,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    a: Math.random(),
  }));

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    DOTS.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = canvas.width;
      if (d.x > canvas.width)  d.x = 0;
      if (d.y < 0) d.y = canvas.height;
      if (d.y > canvas.height) d.y = 0;
      d.a += 0.008;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(42, 109, 217, ${0.3 + 0.3 * Math.abs(Math.sin(d.a))})`;
      ctx.fill();
    });
    // Lignes entre points proches
    for (let i = 0; i < DOTS.length; i++) {
      for (let j = i + 1; j < DOTS.length; j++) {
        const dx = DOTS[i].x - DOTS[j].x;
        const dy = DOTS[i].y - DOTS[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(DOTS[i].x, DOTS[i].y);
          ctx.lineTo(DOTS[j].x, DOTS[j].y);
          ctx.strokeStyle = `rgba(42, 109, 217, ${0.18 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ══════════════════════════════════════════════════════
   2. MATRIX RAIN
══════════════════════════════════════════════════════ */
function initMatrix() {
  const canvas = document.getElementById("matrix-canvas");
  const ctx    = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/\\|=+-*{}[]";
  let cols  = Math.floor(window.innerWidth / 14);
  let drops = Array(cols).fill(1);

  window.addEventListener("resize", () => {
    cols  = Math.floor(window.innerWidth / 14);
    drops = Array(cols).fill(1);
  });

  setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font      = "13px Share Tech Mono";

    drops.forEach((y, i) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(char, i * 14, y * 14);
      if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }, 55);
}

/* ══════════════════════════════════════════════════════
   3. RADAR ANIMATION
══════════════════════════════════════════════════════ */
function initRadarHUD() {
  const canvas = document.getElementById("radar-canvas");
  const ctx    = canvas.getContext("2d");
  let   angle  = 0;
  const CX = 70, CY = 70, MAX_R = 64;

  const BLIPS = [
    { a: 0.8, r: 40 }, { a: 2.1, r: 55 }, { a: 3.7, r: 30 },
    { a: 5.0, r: 50 }, { a: 1.5, r: 62 }, { a: 4.2, r: 38 },
  ];

  setInterval(() => {
    ctx.clearRect(0, 0, 140, 140);

    // Circles
    [1, 0.66, 0.33].forEach(f => {
      ctx.beginPath();
      ctx.arc(CX, CY, MAX_R * f, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ff4122";
      ctx.lineWidth   = 1;
      ctx.stroke();
    });

    // Cross-hairs
    ctx.strokeStyle = "#00ff4122";
    ctx.beginPath(); ctx.moveTo(CX - MAX_R, CY); ctx.lineTo(CX + MAX_R, CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY - MAX_R); ctx.lineTo(CX, CY + MAX_R); ctx.stroke();

    // Sweep sector
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, MAX_R, angle - 0.9, angle, false);
    ctx.closePath();
    const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, MAX_R);
    grad.addColorStop(0, "#00ff4166");
    grad.addColorStop(1, "#00ff4100");
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep line
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(angle) * MAX_R, CY + Math.sin(angle) * MAX_R);
    ctx.strokeStyle = "#00ff41cc";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Blips
    BLIPS.forEach(b => {
      const diff = ((angle - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const fade = diff < 1.5 ? 1 - diff / 1.5 : 0;
      if (fade > 0.05) {
        ctx.beginPath();
        ctx.arc(CX + Math.cos(b.a) * b.r, CY + Math.sin(b.a) * b.r, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,65,${fade})`;
        ctx.fill();
      }
    });

    angle = (angle + 0.03) % (Math.PI * 2);
  }, 40);
}

/* ══════════════════════════════════════════════════════
   4. HUD SCAN / BRUTEFORCE PANELS
══════════════════════════════════════════════════════ */
function initHUDPanels() {
  const scanEl  = document.getElementById("scan-lines");
  const bruteEl = document.getElementById("brute-lines");
  const SERVICES = ["SSH", "FTP", "RDP", "SMB", "HTTP", "LDAP"];
  const PORT_INFO = [
    "22/tcp open ssh",    "80/tcp open http",   "443/tcp open https",
    "445/tcp open SMB",   "3389/tcp RDP open",  "8080/tcp open http-proxy",
  ];

  function updateScan() {
    const subnet = `10.${rand(1,254)}.${rand(0,254)}.0/24`;
    const port   = PORT_INFO[Math.floor(Math.random() * PORT_INFO.length)];
    const host   = `10.${rand(1,254)}.${rand(0,254)}.${rand(1,254)}`;
    scanEl.innerHTML = `
      <div class="hud-line"><span class="blink-dot blue"></span>Scanning ${subnet}...</div>
      <div class="hud-line" style="color:#00f3ff88;margin-left:12px">&#9658; ${port}</div>
      <div class="hud-line" style="color:#33333388">&#9658; Host: ${host} up</div>`;
  }

  function updateBrute() {
    const lines = SERVICES.slice(0, 4).map(s => {
      const p   = rand(5, 99);
      const col = p > 70 ? "#00ff41" : p > 40 ? "#ffe600" : "#ff003c";
      return `<div class="hud-line"><span class="blink-dot"></span>Bruteforce <b style="color:${col}">${s}</b>: ${p}% complete</div>`;
    }).join("");
    bruteEl.innerHTML = lines;
  }

  updateScan();  updateBrute();
  setInterval(updateScan,  2500);
  setInterval(updateBrute, 1800);
}

/* ══════════════════════════════════════════════════════
   5. ANIMATED COUNTERS
══════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1800, prefix = "") {
  if (!el) return;
  let current = 0;
  const step  = target / (duration / 16);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = prefix + Math.floor(current).toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 16);
}

/* ══════════════════════════════════════════════════════
   6. HASH ANIMATIONS
══════════════════════════════════════════════════════ */
function randHex(len) {
  return Array.from({ length: len }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");
}

function animateHash(el, finalVal) {
  if (!el) return;
  let t = 0;
  const iv = setInterval(() => {
    el.textContent = "HASH: 0x" + randHex(6) + "...";
    t += 80;
    if (t > 1600) { el.textContent = "HASH: " + finalVal; clearInterval(iv); }
  }, 80);
}

// Continuously mutate hash displays
function startHashRotation() {
  const h1 = document.getElementById("hash-rooms");
  const h2 = document.getElementById("hash-badges");
  setInterval(() => {
    if (h1) h1.textContent = "HASH: 0x" + randHex(4) + "..." + randHex(2);
    if (h2) h2.textContent = "HASH: 0x" + randHex(4) + "..." + randHex(2);
  }, 3000);
}

/* ══════════════════════════════════════════════════════
   7. SKILL BARS
══════════════════════════════════════════════════════ */
function animateSkills() {
  const SKILLS = [
    { id: "sk-web",    pct: 82 },
    { id: "sk-net",    pct: 75 },
    { id: "sk-crypto", pct: 60 },
    { id: "sk-for",    pct: 53 },
    { id: "sk-rev",    pct: 41 },
  ];
  SKILLS.forEach((s, i) => {
    setTimeout(() => {
      const el = document.getElementById(s.id);
      if (el) el.style.width = s.pct + "%";
    }, 400 + i * 180);
  });
}

/* ══════════════════════════════════════════════════════
   8. RADAR CHART (Chart.js)
══════════════════════════════════════════════════════ */
function initRadarChart() {
  const ctx = document.getElementById("radarChart");
  if (!ctx) return;
  new Chart(ctx.getContext("2d"), {
    type: "radar",
    data: {
      labels: ["Web", "Network", "Crypto", "Forensics", "Rev.Eng", "OSINT"],
      datasets: [{
        label: "Skill Level",
        data: [82, 75, 60, 53, 41, 68],
        backgroundColor: "rgba(0,243,255,0.12)",
        borderColor: "#00f3ff",
        pointBackgroundColor: "#00f3ff",
        pointBorderColor: "#00f3ff88",
        borderWidth: 1.5,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1500 },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false, stepSize: 25 },
          grid:       { color: "#00f3ff18" },
          angleLines: { color: "#00f3ff18" },
          pointLabels: {
            color: "#00f3ff88",
            font: { family: "Share Tech Mono", size: 10 }
          }
        }
      }
    }
  });
}

/* ══════════════════════════════════════════════════════
   9. CERTIFICATION PROGRESS BARS
══════════════════════════════════════════════════════ */
function animateCertBars() {
  setTimeout(() => {
    const soc  = document.getElementById("cp-soc");
    const web  = document.getElementById("cp-web");
    const jrpt = document.getElementById("cp-jrpt");
    if (soc)  soc.style.width  = "65%";
    if (web)  web.style.width  = "45%";
    if (jrpt) jrpt.style.width = "20%";
  }, 700);
}

/* ══════════════════════════════════════════════════════
   10. MINI TERMINAL ROTATION
══════════════════════════════════════════════════════ */
function initMiniTerminal() {
  const CMDS = [
    "nmap -sV -sC -p- 10.10.45.89",
    "hydra -l admin -P rockyou.txt ssh://10.10.45.89",
    "gobuster dir -u http://10.10.45.89 -w common.txt",
    "sqlmap -u 'http://target.thm/login' --dbs",
    "msfconsole -q -x 'use exploit/ms17_010_eternalblue'",
    "john --wordlist=rockyou.txt hash.txt",
    "hashcat -m 0 hash.txt rockyou.txt",
    "python3 exploit.py 10.10.45.89 4444",
    "burpsuite &",
    "wfuzz -c -z file,common.txt --hc 404 http://target.thm/FUZZ",
    "enum4linux -a 10.10.45.89",
    "nikto -h http://10.10.45.89",
  ];

  let idx = 0;
  setInterval(() => {
    const lines = ["tc0", "tc1", "tc2"];
    lines.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = CMDS[(idx + i) % CMDS.length];
    });
    idx++;
  }, 3500);
}

/* ══════════════════════════════════════════════════════
   11. LIVE ACTIVITY FEED
══════════════════════════════════════════════════════ */
const LIVE_EVENTS = [
  { icon: "&#9876;",  text: "Started recon on <strong>Overpass</strong>" },
  { icon: "&#128272;",text: "Found credential: <strong>admin:password123</strong>" },
  { icon: "&#9989;",  text: "Completed <strong>Burp Suite</strong> room" },
  { icon: "&#9876;",  text: "Privilege escalation on <strong>Skynet</strong>" },
  { icon: "&#127942;",text: "New badge: <strong>Web Warrior</strong>" },
  { icon: "&#128272;",text: "SSH key extracted from <strong>Brainpan</strong>" },
  { icon: "&#9650;",  text: "XP gained: +240 — Level progress updated" },
  { icon: "&#9876;",  text: "Rooted <strong>Pickle Rick</strong> in 18min" },
];
let liveIdx = 0;

function pushActivity() {
  const feed = document.getElementById("activity-feed");
  if (!feed) return;

  const ev  = LIVE_EVENTS[liveIdx % LIVE_EVENTS.length];
  const now = new Date();
  const ts  = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;

  const div = document.createElement("div");
  div.className = "activity-item act-new";
  div.innerHTML = `<span class="act-time">${ts}</span><span class="act-icon">${ev.icon}</span><span class="act-text">${ev.text}</span>`;
  feed.insertBefore(div, feed.firstChild);

  // Keep max 8 items
  const items = feed.querySelectorAll(".activity-item");
  if (items.length > 8) items[items.length - 1].remove();

  liveIdx++;
}

/* ══════════════════════════════════════════════════════
   12. DEBUG CONSOLE
══════════════════════════════════════════════════════ */
const DEBUG_MSGS = [
  { mod: "[NET]",     msg: "Packet intercepted: 10.10.1.5 → 10.10.45.89",       err: false },
  { mod: "[EXPLOIT]", msg: "EternalBlue: buffer overflow triggered at 0xDEAD",   err: false },
  { mod: "[SHELL]",   msg: "Reverse shell received on port 4444",                err: false },
  { mod: "[HASH]",    msg: "MD5 cracked: 5f4dcc3b5aa765d61d → password",         err: false },
  { mod: "[PRIV]",    msg: "SUID binary found: /usr/bin/python3",                err: false },
  { mod: "[SCAN]",    msg: "Port 8080 open — Apache Tomcat 9.0.17",              err: false },
  { mod: "[WARN]",    msg: "IDS alert triggered — switching stealth mode",       err: true  },
  { mod: "[AUTH]",    msg: "SSH login success as root@10.10.45.89",              err: false },
  { mod: "[ENUM]",    msg: "SMB share found: \\\\10.10.45.89\\ADMIN$",           err: false },
  { mod: "[CRACK]",   msg: "Password spray success: admin/P@ssw0rd",             err: false },
];
let dbIdx = 0;

function pushDebug() {
  const dc = document.getElementById("debug-console");
  if (!dc) return;

  const m   = DEBUG_MSGS[dbIdx % DEBUG_MSGS.length];
  const now = new Date();
  const ts  = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;

  const div       = document.createElement("div");
  div.className   = "debug-line";
  div.innerHTML   = `<span class="ts">${ts}</span> <span class="mod">${m.mod}</span> <span class="${m.err ? "err" : "msg"}">${m.msg}</span>`;
  dc.appendChild(div);
  dc.scrollTop    = dc.scrollHeight;

  // Keep max 12 lines
  if (dc.children.length > 12) dc.removeChild(dc.firstChild);
  dbIdx++;
}

/* ══════════════════════════════════════════════════════
   13. CERT MODAL
══════════════════════════════════════════════════════ */
window.showCert = function(name, status, progress, date, time, credId) {
  document.getElementById("cd-title").textContent    = name;
  document.getElementById("cd-status").textContent   = status;
  document.getElementById("cd-progress").textContent = progress;
  document.getElementById("cd-date").textContent     = date;
  document.getElementById("cd-time").textContent     = time;
  document.getElementById("cd-id").textContent       = credId;
  document.getElementById("cd-block").textContent    =
    "BLOCKCHAIN: 0x" + randHex(8).toUpperCase() + "...";

  drawFakeQR();
  document.getElementById("cert-overlay").classList.add("show");
};

window.hideCert = function() {
  document.getElementById("cert-overlay").classList.remove("show");
};

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("cert-overlay");
  if (overlay) overlay.addEventListener("click", e => { if (e.target === overlay) hideCert(); });
});

function drawFakeQR() {
  const c   = document.getElementById("qr-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 60, 60);
  ctx.fillStyle = "#00ff41";
  for (let i = 0; i < 60; i += 4)
    for (let j = 0; j < 60; j += 4)
      if (Math.random() > 0.55) ctx.fillRect(i, j, 3, 3);
  // Corner markers
  [[0, 0], [42, 0], [0, 42]].forEach(([x, y]) => {
    ctx.fillStyle = "#00ff41"; ctx.fillRect(x,   y,   15, 15);
    ctx.fillStyle = "#000";    ctx.fillRect(x+3, y+3,  9,  9);
    ctx.fillStyle = "#00ff41"; ctx.fillRect(x+5, y+5,  5,  5);
  });
}

/* ══════════════════════════════════════════════════════
   14. GLITCH TITLE DECRYPTION EFFECT
══════════════════════════════════════════════════════ */
function triggerGlitch() {
  const el       = document.getElementById("glitch-title");
  if (!el)        return;
  const ORIGINAL = "ALEXISLEROI // TRYHACKME";
  const GLITCH   = "!@#$%^&*<>/?|\\0123456789ABCDEF";
  let iterations = 0;

  const iv = setInterval(() => {
    el.textContent = ORIGINAL.split("").map((c, i) => {
      if (c === " ") return " ";
      if (i < iterations) return c;
      return GLITCH[Math.floor(Math.random() * GLITCH.length)];
    }).join("");
    iterations += 1.5;
    if (iterations >= ORIGINAL.length) {
      el.textContent = ORIGINAL;
      clearInterval(iv);
    }
  }, 40);
}

/* ══════════════════════════════════════════════════════
   15. NAV ITEMS INTERACTION
══════════════════════════════════════════════════════ */
window.setNav = function(el) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  el.classList.add("active");
  // Ferme sidebar sur mobile après sélection
  const sb = document.getElementById("sidebar");
  if (sb && sb.classList.contains("open")) toggleSidebar();
};

/* ══════════════════════════════════════════════════════
   16. START ATTACK BUTTON
══════════════════════════════════════════════════════ */
window.startAttack = function() {
  const btn  = document.querySelector(".btn-attack");
  if (!btn)   return;
  const msgs = [
    "&#9632; CONNECTING...",
    "&#9658; SCANNING TARGET...",
    "&#9658; EXPLOIT LOADED",
    "&#9632; SHELL ACTIVE!",
  ];
  let i = 0;
  btn.disabled = true;
  const iv = setInterval(() => {
    btn.innerHTML = msgs[i++];
    if (i >= msgs.length) {
      clearInterval(iv);
      setTimeout(() => { btn.innerHTML = "&#9658; START NEW ATTACK"; btn.disabled = false; }, 2000);
    }
  }, 700);
};

/* ══════════════════════════════════════════════════════
   17. MOBILE SIDEBAR TOGGLE
══════════════════════════════════════════════════════ */
window.toggleSidebar = function() {
  const sb      = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const btn     = document.getElementById("sidebar-toggle");
  if (!sb) return;
  const isOpen = sb.classList.toggle("open");
  if (overlay) overlay.classList.toggle("show", isOpen);
  if (btn)     btn.classList.toggle("is-open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
};

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n)         { return String(n).padStart(2, "0"); }

/* ══════════════════════════════════════════════════════
   MAIN INIT — called after loading screen fades
══════════════════════════════════════════════════════ */
function initDashboard() {
  // Counters
  animateCounter(document.getElementById("cnt-rooms"),  37);
  animateCounter(document.getElementById("cnt-badges"), 6);
  animateCounter(document.getElementById("cnt-streak"), 6);
  const rankEl = document.getElementById("cnt-rank");
  if (rankEl) {
    animateCounter(rankEl, 20, 1800, "");
    setTimeout(() => { rankEl.textContent = "TOP 20%"; }, 2000);
  }

  // Hash intro animations
  animateHash(document.getElementById("hash-rooms"),   "0x25 (37 dec)");
  animateHash(document.getElementById("hash-badges"),  "0x06 (6 dec)");
  setTimeout(startHashRotation, 2000);

  // Skill bars & cert bars
  setTimeout(animateSkills,    300);
  setTimeout(animateCertBars,  500);

  // Chart.js radar
  setTimeout(initRadarChart, 400);

  // Mini terminal  
  initMiniTerminal();

  // Debug console — first entry then interval
  setTimeout(() => {
    pushDebug();
    setInterval(pushDebug, 2800);
  }, 1500);

  // Activity feed
  setInterval(pushActivity, 6000);

  // Glitch title every 6s
  setInterval(triggerGlitch, 6000);

  // Update footer date dynamically
  const fd = document.getElementById("footer-date");
  if (fd) fd.textContent = new Date().toISOString().slice(0, 10);
}

/* ══════════════════════════════════════════════════════
   BOOT — execute immediately on script load
══════════════════════════════════════════════════════ */
initMatrix();
initRadarHUD();
initHUDPanels();

// Login screen starts after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLoginScreen);
} else {
  initLoginScreen();
}
