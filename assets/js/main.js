/* Global UI setup */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function setupNav() {
  const toggle = $('#navToggle');
  const menu = $('#navMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('#navMenu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

function setupReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .05 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* Background canvas - subtle flowing particles */
function setupBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h; const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() { w = canvas.width = Math.floor(innerWidth * DPR); h = canvas.height = Math.floor(innerHeight * DPR); }
  resize(); window.addEventListener('resize', resize);
  const particles = Array.from({length: 70}, () => ({
    x: Math.random()*w, y: Math.random()*h, a: Math.random()*Math.PI*2,
    s: .3 + Math.random()*1.2, r: .5 + Math.random()*1.8
  }));
  function tick() {
    ctx.clearRect(0,0,w,h);
    ctx.globalAlpha = .9; ctx.fillStyle = 'rgba(20,164,77,0.05)'; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha = .9; ctx.strokeStyle = 'rgba(20,164,77,0.25)';
    particles.forEach(p => {
      p.a += (Math.random()-.5)*.1; p.x += Math.cos(p.a)*p.s; p.y += Math.sin(p.a)*p.s;
      if (p.x<0) p.x=w; if (p.x>w) p.x=0; if (p.y<0) p.y=h; if (p.y>h) p.y=0;
    });
    for (let i=0;i<particles.length;i++) {
      const pi = particles[i];
      for (let j=i+1;j<particles.length;j++) {
        const pj = particles[j];
        const dx = pi.x-pj.x, dy = pi.y-pj.y; const d2 = dx*dx+dy*dy; if (d2 < (120*DPR)**2) {
          ctx.globalAlpha = 0.08; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pi.x, pi.y); ctx.lineTo(pj.x, pj.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = .8; ctx.fillStyle = 'rgba(20,164,77,0.35)';
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r*DPR, 0, Math.PI*2); ctx.fill(); });
    requestAnimationFrame(tick);
  }
  tick();
}

/* Data loading */
async function loadJSON(path, fallback) {
  try { const res = await fetch(path, {cache: 'no-store'}); if (!res.ok) throw new Error('HTTP '+res.status); return await res.json(); }
  catch (e) { console.warn('Using fallback for', path, e); return fallback; }
}

const sampleProjects = [
  {
    id:"roadmap", title:"AI Career Roadmap Generator", category:"General", featured:true,
    description:"Personalized AI-driven career path with visual skill map.",
    problem:"Freshers struggle to create a career roadmap.",
    solution:"AI-based generator using user profile to suggest skills and steps.",
    outcome:"Delivers step-by-step plan and visual dependencies.",
    tools:["Python","Pandas","scikit-learn","Power BI"],
    visuals:["/assets/img/project-placeholder.svg"], links:{github:"#", demo:"#"}
  },
  {
    id:"plant-ml", title:"Plant Health Prediction using ML", category:"Horticulture", featured:true,
    description:"Detect diseases from leaf images, enable early intervention.",
    problem:"Early disease detection in crops is complex.",
    solution:"Image-based classification model with explainability.",
    outcome:">85% accuracy; supports proactive treatment.",
    tools:["Python","scikit-learn"], visuals:["/assets/img/project-placeholder.svg"], links:{github:"#"}
  },
  { id:"yield-forecast", title:"Crop Yield Forecasting", category:"Horticulture", description:"Time-series forecasting for yield.", problem:"Planning requires yield forecasts.", solution:"Prophet/ARIMA ensemble.", outcome:"Improved forecast MAPE.", tools:["Python","Prophet","ARIMA"], visuals:["/assets/img/project-placeholder.svg"]},
  { id:"powerbi-sales", title:"Sales Analytics Dashboard", category:"General", description:"Interactive Power BI dashboard.", problem:"Leaders lack visibility.", solution:"KPI-focused BI dashboard.", outcome:"Faster decisions.", tools:["Power BI","DAX"], visuals:["/assets/img/project-placeholder.svg"]},
  { id:"soil-analytics", title:"Soil Health Analytics", category:"Horticulture", description:"Soil metrics scoring & mapping.", problem:"Hard to compare soils.", solution:"Composite soil index.", outcome:"Prioritized interventions.", tools:["Python","GIS"], visuals:["/assets/img/project-placeholder.svg"]},
  { id:"market-basket", title:"Market Basket Analysis", category:"General", description:"Association rules for cross-sell.", problem:"Low cross-sell.", solution:"Apriori-based bundles.", outcome:"Higher basket size.", tools:["Python","mlxtend"], visuals:["/assets/img/project-placeholder.svg"]},
  { id:"irrigation-opt", title:"Smart Irrigation Optimization", category:"Horticulture", description:"Sensor-driven irrigation.", problem:"Water wastage.", solution:"ML-based scheduling.", outcome:"Saved water.", tools:["Python","IoT"], visuals:["/assets/img/project-placeholder.svg"]},
  { id:"excel-ops", title:"Excel Automation Toolkit", category:"General", description:"Excel → Python automations.", problem:"Manual reports.", solution:"OpenPyXL scripts.", outcome:"Hours saved weekly.", tools:["Python","Excel"], visuals:["/assets/img/project-placeholder.svg"]}
];

const samplePosts = [
  { title:"How AI is transforming horticulture", date:"2025-06-01", url:"#", excerpt:"From disease detection to smart irrigation, AI reshapes the field." },
  { title:"Top 5 Analytics Techniques for Crop Prediction", date:"2025-07-18", url:"#", excerpt:"ARIMA, Prophet, Random Forests, and beyond for reliable forecasts." },
  { title:"Designing Actionable Dashboards in Power BI", date:"2025-08-02", url:"#", excerpt:"Clarity, context, and consistency for decision-ready visuals." }
];

/* Portfolio grid */
function renderProjectCard(p) {
  const tools = p.tools?.map(t=>`<span class="badge">${t}</span>`).join('') || '';
  const img = (p.visuals && p.visuals[0]) || '/assets/img/project-placeholder.svg';
  return `
  <article class="project-card card" data-id="${p.id}" data-category="${p.category}">
    <img class="project-thumb" src="${img}" alt="${p.title} thumbnail" />
    <h3>${p.title}</h3>
    <p>${p.description || ''}</p>
    <div class="chips">${tools}</div>
  </article>`;
}

function buildPortfolioGrid(projects) {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  grid.innerHTML = projects.map(renderProjectCard).join('');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.project-card');
    if (!card) return;
    const id = card.getAttribute('data-id');
    const project = projects.find(p => p.id===id);
    if (project) openProjectModal(project);
  });
}

function setupFilters(allProjects) {
  const chips = $$('.filters .chip');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    const filtered = (filter==='all') ? allProjects : allProjects.filter(p=>p.category===filter);
    buildPortfolioGrid(filtered);
  }));
}

/* Highlights carousel */
function buildHighlights(projects) {
  const track = $('.carousel-track'); if (!track) return;
  const featured = projects.filter(p=>p.featured).slice(0,3);
  track.innerHTML = featured.map(p => `
    <article class="carousel-card card" aria-roledescription="slide">
      <img class="project-thumb" src="${(p.visuals && p.visuals[0]) || '/assets/img/project-placeholder.svg'}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>${p.problem}</p>
      <div class="chips">${(p.tools||[]).map(t=>`<span class='badge'>${t}</span>`).join('')}</div>
    </article>`).join('');
  const prev = $('.carousel-btn.prev');
  const next = $('.carousel-btn.next');
  let idx = 0;
  function scrollToIndex(i) { const card = track.children[i]; if (card) card.scrollIntoView({behavior:'smooth', inline:'start'}); }
  prev?.addEventListener('click', ()=>{ idx = Math.max(0, idx-1); scrollToIndex(idx); });
  next?.addEventListener('click', ()=>{ idx = Math.min(track.children.length-1, idx+1); scrollToIndex(idx); });
}

/* Modal */
function openProjectModal(p) {
  const modal = document.getElementById('projectModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;
  body.innerHTML = `
    <header style="padding-right:28px">
      <h2 style="margin:0 0 8px">${p.title}</h2>
      <p style="margin:0;color:#aac7b6">${p.description||''}</p>
    </header>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
      <div>
        <h3>Case Study</h3>
        <p><strong>Problem</strong>: ${p.problem||'-'}</p>
        <p><strong>Solution</strong>: ${p.solution||'-'}</p>
        <p><strong>Outcome</strong>: ${p.outcome||'-'}</p>
        <div class="chips">${(p.tools||[]).map(t=>`<span class='badge'>${t}</span>`).join('')}</div>
        ${p.links?.github?`<p><a href='${p.links.github}' target='_blank' rel='noreferrer'>GitHub</a></p>`:''}
        ${p.links?.demo?`<p><a href='${p.links.demo}' target='_blank' rel='noreferrer'>Live demo</a></p>`:''}
      </div>
      <div>
        ${(p.visuals||[]).map(src=>`<img class='project-thumb' style='height:160px' src='${src}' alt='${p.title} visual' />`).join('')}
      </div>
    </div>`;
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn?.addEventListener('click', ()=> modal.close());
  modal.showModal();
}

/* Resume section */
function buildResumeProjects(projects) {
  const list = document.getElementById('resumeProjects'); if (!list) return;
  const top = projects.slice(0, 4);
  list.innerHTML = top.map(p=>`<li>${p.title} – <span style='color:#9bb7a8'>${(p.tools||[]).slice(0,3).join(', ')}</span></li>`).join('');
}

/* Skills radar */
function buildRadar() {
  const canvas = document.getElementById('skillsRadar'); if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type:'radar',
    data:{
      labels:['Python','SQL','Power BI','Excel','ML'],
      datasets:[{
        label:'Proficiency', data:[85,75,80,90,70],
        backgroundColor:'rgba(20,164,77,.25)', borderColor:'rgba(20,164,77,.8)', pointBackgroundColor:'#14a44d'
      }]
    },
    options:{ scales:{ r:{ angleLines:{color:'rgba(255,255,255,.08)'}, grid:{color:'rgba(255,255,255,.08)'}, pointLabels:{color:'#e8f3ec'}, ticks:{display:false, beginAtZero:true, max:100} } }, plugins:{legend:{display:false}} }
  });
}

/* Skill tree with D3 */
function buildSkillTree() {
  const container = document.getElementById('skillTree'); if (!container || !window.d3) return;
  const width = container.clientWidth; const height = container.clientHeight;
  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', 'translate(16,16)');
  const data = {
    name:'Skills', children:[
      { name:'Horticulture', children:[ {name:'Crop Analytics'}, {name:'Soil Health'}, {name:'Plant Pathology'} ] },
      { name:'Data & AI', children:[ {name:'Python', children:[{name:'Pandas'},{name:'scikit-learn'}]}, {name:'BI', children:[{name:'Power BI'},{name:'DAX'}]}, {name:'SQL'} ] }
    ]
  };
  const root = d3.hierarchy(data);
  const tree = d3.tree().size([height-32, width-64]);
  tree(root);
  g.selectAll('.link').data(root.links()).enter().append('path')
    .attr('class','link')
    .attr('d', d3.linkHorizontal().x(d=>d.y).y(d=>d.x))
    .attr('stroke','rgba(20,164,77,.6)').attr('fill','none');
  const node = g.selectAll('.node').data(root.descendants()).enter().append('g')
    .attr('class','node')
    .attr('transform', d=>`translate(${d.y},${d.x})`);
  node.append('circle').attr('r', 5).attr('fill','#14a44d');
  node.append('text').attr('x', 8).attr('dy', '0.32em').text(d=>d.data.name).attr('fill','#e8f3ec').style('font-size','12px');
}

/* Blog */
function buildBlog(posts) {
  const list = document.getElementById('blogList'); if (!list) return;
  list.innerHTML = posts.map(p=>`<article class='post card'><h3>${p.title}</h3><p style='color:#9bb7a8'>${p.excerpt}</p><a target='_blank' rel='noreferrer' href='${p.url}'>Read more</a></article>`).join('');
}

/* Contact */
function setupContact() {
  const form = document.getElementById('contactForm'); if (!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = encodeURIComponent(fd.get('name')||'');
    const email = encodeURIComponent(fd.get('email')||'');
    const message = encodeURIComponent(fd.get('message')||'');
    const subject = `Portfolio contact: ${decodeURIComponent(name)}`;
    const body = `Name: ${decodeURIComponent(name)}%0AEmail: ${decodeURIComponent(email)}%0A%0A${decodeURIComponent(message)}`;
    window.location.href = `mailto:youremail@example.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  });
}

/* Print */
function setupPrint() {
  const btn = document.getElementById('printBtn'); if (!btn) return;
  btn.addEventListener('click', ()=> window.print());
}

/* Year */
function setYear() { const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); }

/* Resume download tracking */
function setupResumeTracking() {
  const btn = document.getElementById('resumeBtn'); if (!btn) return;
  btn.addEventListener('click', ()=> { try { localStorage.setItem('resume_downloaded_at', String(Date.now())); } catch(_){} });
}

/* Bootstrap */
document.addEventListener('DOMContentLoaded', async () => {
  setupNav();
  setupReveal();
  setupBackground();
  setupContact();
  setupPrint();
  setYear();
  setupResumeTracking();

  const projects = await loadJSON('/data/projects.json', sampleProjects);
  const posts = await loadJSON('/data/blog.json', samplePosts);
  buildPortfolioGrid(projects);
  setupFilters(projects);
  buildHighlights(projects);
  buildResumeProjects(projects);
  buildBlog(posts);
  buildRadar();
  buildSkillTree();
});

