/* ── Theme ── */
const html = document.documentElement;
html.dataset.theme = localStorage.getItem('pt-theme') || 'dark';
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('pt-theme', next);
  nn.rebuild();
});

/* ── Nav ── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.querySelector('.nav-links');
const backTop   = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 24);
  backTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.classList.remove('open');
  navLinks.classList.remove('open');
}));
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════
   NEURAL NETWORK BACKGROUND
══════════════════════════════════════════ */
const nn = (() => {
  const canvas = document.getElementById('nn-canvas');
  const ctx    = canvas.getContext('2d');
  const LAYERS = [4, 6, 6, 3];
  let nodes = [], conns = [], pulses = [], raf = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function rebuild() {
    nodes = []; conns = [];
    const W = canvas.width, H = canvas.height;
    const xs = LAYERS.map((_, i) => W * 0.06 + (i / (LAYERS.length - 1)) * W * 0.88);
    const byLayer = [];
    for (let l = 0; l < LAYERS.length; l++) {
      const n = LAYERS[l], col = [];
      for (let i = 0; i < n; i++) {
        col.push({
          x: xs[l] + (Math.random() - .5) * W * 0.04,
          y: H * 0.1 + (i / (n - 1 || 1)) * H * 0.8,
          l, r: 2.5 + Math.random() * 1.5
        });
      }
      nodes.push(...col);
      byLayer.push(col);
    }
    for (let l = 0; l < LAYERS.length - 1; l++) {
      for (const a of byLayer[l])
        for (const b of byLayer[l + 1])
          if (Math.random() > .3) conns.push({ a, b });
    }
  }

  function spawnPulse() {
    if (!conns.length) return;
    const c = conns[Math.floor(Math.random() * conns.length)];
    pulses.push({ a: c.a, b: c.b, t: 0, spd: .006 + Math.random() * .007 });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark    = html.dataset.theme !== 'light';
    const ac      = dark ? '0,212,170'  : '0,138,110';
    const bc      = dark ? '14,165,233' : '0,119,187';
    const connOp  = dark ? .07  : .05;
    const nodeOp  = dark ? .14  : .11;
    const nodeStr = dark ? .28  : .2;

    for (const c of conns) {
      ctx.beginPath();
      ctx.moveTo(c.a.x, c.a.y);
      ctx.lineTo(c.b.x, c.b.y);
      ctx.strokeStyle = `rgba(${bc},${connOp})`;
      ctx.lineWidth = .7;
      ctx.stroke();
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ac},${nodeOp})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ac},${nodeStr})`;
      ctx.lineWidth = .8;
      ctx.stroke();
    }

    if (Math.random() < .022) spawnPulse();

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.spd;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }
      const px = p.a.x + (p.b.x - p.a.x) * p.t;
      const py = p.a.y + (p.b.y - p.a.y) * p.t;
      const g  = ctx.createRadialGradient(px, py, 0, px, py, 11);
      g.addColorStop(0,   `rgba(${ac},${dark ? .85 : .7})`);
      g.addColorStop(.45, `rgba(${ac},${dark ? .3  : .2})`);
      g.addColorStop(1,   `rgba(${ac},0)`);
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  function start() { resize(); rebuild(); draw(); }
  function stop()  { cancelAnimationFrame(raf); }

  window.addEventListener('resize', () => { resize(); rebuild(); }, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  start();
  return { rebuild: () => { stop(); resize(); rebuild(); draw(); } };
})();

/* ── Typewriter ── */
const roles = ['Data Scientist', 'ML Engineer', 'Fraud Detection Expert', 'MLOps Engineer'];
let ri = 0, ci = 0, del = false;
const tyEl = document.getElementById('typing-text');
(function type() {
  const w = roles[ri];
  tyEl.textContent = del ? w.slice(0, ci - 1) : w.slice(0, ci + 1);
  del ? ci-- : ci++;
  let spd = del ? 46 : 88;
  if (!del && ci === w.length)  { spd = 2100; del = true; }
  else if (del && ci === 0)     { del = false; ri = (ri + 1) % roles.length; spd = 380; }
  setTimeout(type, spd);
})();

/* ── Counters ── */
function runCounter(el) {
  const tgt = parseFloat(el.dataset.count);
  const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const dur = 1600, t0 = performance.now();
  const int = Number.isInteger(tgt);
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + (int ? Math.floor(tgt * e) : (tgt * e).toFixed(1)) + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ── Intersection observers ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revObs.unobserve(e.target); } });
}, { threshold: .1 });
document.querySelectorAll('[data-reveal]').forEach(el => revObs.observe(el));

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cntObs.unobserve(e.target); } });
}, { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(el => cntObs.observe(el));

/* ── Experience split-panel ── */
const expData = [
  {
    title: 'Data Scientist', company: 'Randstad Digital LLC', client: 'Verizon Wireless',
    period: 'Nov 2019 – Present', location: 'Irving, TX',
    chips: ['65% Fraud ↓','$1M+ / mo','47% FP ↓'],
    metrics: [{n:'65%',l:'Max Fraud Reduction'},{n:'$1M+',l:'Monthly Savings'},{n:'47%',l:'False Positives ↓'}],
    highlights: [
      {i:'🤖', t:'Fraud Detection ML', d:'Built supervised & unsupervised models (Python + Spark) for payment and login fraud — reducing unauthorized txns by 45% and registrations by 65%'},
      {i:'🔍', t:'Anomaly Detection System', d:'Architected ML + rule-based order fraud detection — blocking fraudulent fulfillment and generating $1M+ in monthly savings'},
      {i:'📊', t:'Dashboards & KPI Reporting', d:'Owned OpenSearch, Grafana & Tableau monitoring; produced weekly KPI reports and solely managed analytics during high-priority fraud investigations'},
      {i:'🧠', t:'GenAI & LLM Integration', d:'Integrated LLM capabilities into fraud analytics workflows — automating investigation insights and enhancing operational monitoring on AWS'},
    ],
    stack: ['Python','Apache Spark','Airflow','Apache NiFi','AWS','OpenSearch','Tableau','Grafana','Oracle SQL','XGBoost','H2O.ai','LLMs / GenAI','Databricks']
  },
  {
    title: 'Software Developer / Data Analyst', company: 'Wipro', client: 'Capital One',
    period: 'Feb 2019 – Oct 2019', location: 'Richmond, VA',
    chips: ['Cloud Migration','BI Reporting','Trend Analysis'],
    metrics: [],
    highlights: [
      {i:'☁️', t:'Cloud Migration', d:'Migrated Hadoop jobs to AWS S3 as part of Capital One large-scale cloud modernization initiative'},
      {i:'📈', t:'Operational Reporting', d:'Managed BI reporting for loan operations, escrow, agency servicing, and core operations teams'},
      {i:'📉', t:'Trend Forecasting', d:'Performed data analysis and trend forecasting to support operational and strategic business decisions'},
    ],
    stack: ['Hadoop','AWS S3','SQL','Power BI','Excel / BI Tools']
  }
];

function selectJob(idx) {
  document.querySelectorAll('.exp-job-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
  const detail = document.getElementById('exp-detail');
  detail.style.cssText = 'opacity:0;transform:translateX(10px);transition:none';
  setTimeout(() => {
    detail.innerHTML = renderJob(expData[idx]);
    detail.style.cssText = 'opacity:1;transform:none;transition:opacity .32s ease,transform .32s ease';
    detail.querySelectorAll('[data-count]').forEach(runCounter);
  }, 160);
}

function renderJob(j) {
  const metrics = j.metrics.length ? `<div class="ep-metrics">${j.metrics.map(m=>`<div class="ep-metric"><span class="ep-mn">${m.n}</span><span class="ep-ml">${m.l}</span></div>`).join('')}</div>` : '';
  const chips = `<div class="ep-chips">${j.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div>`;
  const highlights = `<div class="ep-highlights">${j.highlights.map(h=>`<div class="ep-highlight"><span class="ep-h-icon">${h.i}</span><div><strong>${h.t}</strong><p>${h.d}</p></div></div>`).join('')}</div>`;
  const stack = `<div class="ep-stack"><span class="sg-label">Tech Stack</span><div class="pill-row">${j.stack.map(s=>`<span class="pill">${s}</span>`).join('')}</div></div>`;
  return `<div class="ep-header"><div><h3>${j.title}</h3><p>${j.company} <span>· ${j.client}</span></p><small>${j.period} · ${j.location}</small></div>${chips}</div>${metrics}${highlights}${stack}`;
}

selectJob(0);

/* ── Parallax ── */
window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight) return;
  const ph = document.querySelector('.hero-photo');
  const hc = document.querySelector('.hero-content');
  if (ph) ph.style.transform = `translateY(${window.scrollY * .11}px)`;
  if (hc) hc.style.transform = `translateY(${window.scrollY * .055}px)`;
}, { passive: true });

/* ── Magnetic buttons ── */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .2}px,${(e.clientY - r.top - r.height/2) * .2}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
    btn.style.transform  = '';
    setTimeout(() => btn.style.transition = '', 400);
  });
  btn.addEventListener('mouseenter', () => { btn.style.transition = 'none'; });
});

/* ══════════════════════════════════════════
   CONTACT FORM → GOOGLE SHEETS

   SETUP (one-time, ~5 min):
   1. Go to sheets.google.com → create a new sheet → name the first sheet "Contacts"
   2. Go to Extensions → Apps Script → paste this code:

      function doPost(e) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contacts');
        if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        if (sheet.getLastRow() === 0)
          sheet.appendRow(['Timestamp','Name','Email','Message','Status']);
        sheet.appendRow([
          e.parameter.timestamp || new Date().toLocaleString(),
          e.parameter.name,
          e.parameter.email,
          e.parameter.message,
          'New ⭐'
        ]);
        return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
      }

   3. Click Deploy → New deployment → Web app
      Execute as: Me | Who has access: Anyone → Deploy → Copy the URL
   4. Paste that URL below replacing YOUR_SCRIPT_URL_HERE
══════════════════════════════════════════ */
const GFORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScU8ZLm0TICG6JEq_h9_i_CU4ZvSZMD7kXS6hYdAAaqd5xetw/formResponse';
const GFORM_NAME    = 'entry.1691537470';
const GFORM_MESSAGE = 'entry.2096371744';

(function () {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('cf-btn');
  const btnTxt = document.getElementById('cf-btn-txt');
  const spinner = document.getElementById('cf-spinner');
  const status = document.getElementById('cform-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btnTxt.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'cform-status';

    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    const payload = new URLSearchParams({
      [GFORM_NAME]:    name,
      [GFORM_MESSAGE]: `Email: ${email}\n\n${message}`,
      fvv:         '1',
      pageHistory: '0',
      fbzx:        Math.random().toString(36)
    });

    try {
      await fetch(GFORM_URL, { method: 'POST', mode: 'no-cors', body: payload });
      status.textContent = '✓ Message received! I\'ll get back to you soon.';
      status.className = 'cform-status ok';
      form.reset();
    } catch {
      status.textContent = '✗ Something went wrong. Please email prgs28.1994@gmail.com directly.';
      status.className = 'cform-status err';
    }

    btn.disabled = false;
    spinner.style.display = 'none';
    btnTxt.textContent = 'Send Message';
  });
})();

/* ── KPI flip: hover previews, click locks/unlocks ── */
document.querySelectorAll('.kpi-card').forEach(card => {
  const inner = card.querySelector('.kpi-inner');
  let locked = false;

  // Hover: flip on enter, unflip on leave (unless click-locked)
  card.addEventListener('mouseenter', () => {
    if (!locked) inner.classList.add('flipped');
  });
  card.addEventListener('mouseleave', () => {
    if (!locked) inner.classList.remove('flipped');
  });

  // Click: toggle lock (stays flipped even when mouse leaves)
  card.addEventListener('click', () => {
    locked = !locked;
    inner.classList.toggle('flipped', locked);
  });
});

/* ── Other card tilt ── */
document.querySelectorAll('.sg-block,.pub-item,.bg-item').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top  - r.height/2) / r.height) * -6;
    const ry = ((e.clientX - r.left - r.width /2) / r.width)  *  6;
    card.style.transition = 'none';
    card.style.transform  = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .5s ease,border-color .2s,box-shadow .2s';
    card.style.transform  = '';
  });
});
