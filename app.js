'use strict';
/* ════════════════════════════════════════════════════════
   Assessment Nexus — app.js
════════════════════════════════════════════════════════ */

// URL do webapp GAS — Assessment Nexus Backend
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyaL1vkvy24sX481xAvxtk0cO4IMPnnb0CIGHLu_WWj7Et3sqz59qShDkizOBoxB68Blg/exec';

const PILAR_ORDER   = ['N', 'T', 'P', 'G', 'IA'];
const GAUGE_SM_CIRC = Math.PI * 80;
const GAUGE_LG_CIRC = Math.PI * 130;

const QW_TEMPLATES = {
  IA1: { titulo: 'Chatbot com IA no atendimento (WhatsApp / Chat)', descricao: 'Implementar assistente conversacional para resolver dúvidas frequentes, qualificar clientes e agendar reuniões automaticamente, 24h por dia.', prazo: '4–6 semanas', area: 'Atendimento' },
  IA2: { titulo: 'Pipeline de conteúdo e qualificação de leads com IA', descricao: 'Automatizar criação de posts, e-mails, scripts e propostas com IA, além de scoring de leads baseado em comportamento.', prazo: '3–4 semanas', area: 'Comercial / Marketing' },
  IA3: { titulo: 'Automação de processos repetitivos com RPA + IA', descricao: 'Mapear os 3 processos mais trabalhosos e automatizá-los com RPA + IA, eliminando inserção manual de dados e aprovações simples.', prazo: '5–8 semanas', area: 'Operações' },
  IA4: { titulo: 'Dashboard de BI com alertas preditivos', descricao: 'Conectar ERP e CRM em dashboard com KPIs em tempo real, forecasting de vendas e alertas automáticos de desvio.', prazo: '3–5 semanas', area: 'Analytics / BI' },
  IA5: { titulo: 'Base de conhecimento com busca inteligente por IA', descricao: 'Centralizar processos, políticas e FAQ com busca por IA, reduzindo tempo de onboarding e erros por desinformação.', prazo: '2–3 semanas', area: 'Documentação' },
  IA6: { titulo: 'Workshop: política e roadmap de IA em 30 dias', descricao: 'Mapear casos de uso por área, priorizar por ROI, criar política de uso e nomear responsável pela agenda de IA.', prazo: '2–4 semanas', area: 'Estratégia de IA' },
  IA7: { titulo: 'IA no RH: triagem de candidatos e predição de turnover', descricao: 'Implementar ATS com IA para triagem e ranking automático de candidatos, análise de eNPS com sentimento e modelo preditivo de risco de saída de talentos.', prazo: '4–6 semanas', area: 'Pessoas / RH' },
};

// ── Estado de autenticação ───────────────────────────────
const AUTH_STATE = {
  token:   null,
  usuario: null, // { id, username, nome, role }
};

const ROLE_LABELS = { admin: 'Administrador', consultor: 'Consultor', visualizador: 'Visualizador' };

// ── Estado ───────────────────────────────────────────────
const STATE = {
  config: { empresa: '', responsavel: '', setor: '', faturamento: '', funcionarios: '', faturamentoVal: 0, funcionariosVal: 0 },
  scores: {},
  currentPilar: 'N',
  currentTab: 'avaliacao',
};

// ── Helpers ──────────────────────────────────────────────
const qs  = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);
const svgEl = tag => document.createElementNS('http://www.w3.org/2000/svg', tag);

// ── Auth — login / logout / sessão ───────────────────────

function showLoginOverlay(msg) {
  const overlay = qs('#login-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  if (msg) {
    const err = qs('#login-error');
    if (err) { err.textContent = msg; err.classList.remove('hidden'); }
  }
}

function hideLoginOverlay() {
  const overlay = qs('#login-overlay');
  if (overlay) overlay.classList.add('hidden');
}

async function checkAuth() {
  const token   = localStorage.getItem('nexus_auth_token');
  const userStr = localStorage.getItem('nexus_auth_user');
  if (!token || !GAS_URL) { showLoginOverlay(); return false; }
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'validarSessao', token }),
    });
    const json = await res.json();
    if (json.ok) {
      AUTH_STATE.token   = token;
      AUTH_STATE.usuario = json.usuario;
      // Recupera nome do localStorage (sessão não devolve nome)
      try { const u = JSON.parse(userStr); if (u && u.nome) AUTH_STATE.usuario.nome = u.nome; } catch (_) {}
      return true;
    }
    localStorage.removeItem('nexus_auth_token');
    localStorage.removeItem('nexus_auth_user');
    showLoginOverlay();
    return false;
  } catch (_) {
    showLoginOverlay();
    return false;
  }
}

async function doLogin(username, senha) {
  const btn     = qs('#login-btn');
  const btnText = qs('#login-btn-text');
  const btnLoad = qs('#login-btn-loading');
  const errEl   = qs('#login-error');
  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoad.classList.remove('hidden');
  errEl.classList.add('hidden');
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'login', username: username.trim().toLowerCase(), senha }),
    });
    const json = await res.json();
    if (json.ok) {
      AUTH_STATE.token   = json.token;
      AUTH_STATE.usuario = json.usuario;
      localStorage.setItem('nexus_auth_token', json.token);
      localStorage.setItem('nexus_auth_user',  JSON.stringify(json.usuario));
      hideLoginOverlay();
      initApp(); // inicializa a app após login
    } else {
      errEl.textContent = json.erro || 'Credenciais inválidas.';
      errEl.classList.remove('hidden');
    }
  } catch (e) {
    errEl.textContent = 'Erro de conexão. Verifique o backend.';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoad.classList.add('hidden');
  }
}

async function doLogout() {
  if (AUTH_STATE.token) {
    try { await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logout', token: AUTH_STATE.token }),
    }); } catch (_) {}
  }
  AUTH_STATE.token   = null;
  AUTH_STATE.usuario = null;
  localStorage.removeItem('nexus_auth_token');
  localStorage.removeItem('nexus_auth_user');
  showLoginOverlay('Você saiu. Faça login para continuar.');
}

function updateSidebarUser() {
  const u = AUTH_STATE.usuario;
  if (!u) return;
  const wrap = qs('#sidebar-user');
  if (wrap) wrap.classList.remove('hidden');
  const nome = u.nome || u.username || '?';
  qs('#su-avatar').textContent = nome.charAt(0).toUpperCase();
  qs('#su-nome').textContent   = nome;
  qs('#su-role').textContent   = ROLE_LABELS[u.role] || u.role;
  // Admin: mostra item de usuários
  if (u.role === 'admin') {
    qs('#nav-usuarios')?.classList.remove('hidden');
  }
}

// ── Init ─────────────────────────────────────────────────
async function init() {
  // Primeiro verifica autenticação
  const authed = await checkAuth();
  if (authed) {
    initApp();
  } else {
    // configura o form de login
    setupLoginForm();
  }
}

function setupLoginForm() {
  qs('#login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const user = qs('#login-username').value;
    const pass = qs('#login-password').value;
    await doLogin(user, pass);
  });
}

function initApp() {
  // Inicializa scores
  CONFIG.pilares.forEach(p =>
    p.dimensoes.forEach(d => {
      if (!STATE.scores[d.id]) {
        STATE.scores[d.id] = { score: null, na: false, naMotivo: '', obs: '' };
      }
    })
  );

  // Popula selects (só na primeira vez)
  const setorEl = qs('#setor');
  if (setorEl && setorEl.options.length === 0) {
    CONFIG.setores.forEach(s => setorEl.add(new Option(s.label, s.id)));
    CONFIG.faturamentoOpcoes.forEach(f => qs('#faturamento').add(new Option(f.label, f.id)));
    CONFIG.funcionariosOpcoes.forEach(f => qs('#funcionarios').add(new Option(f.label, f.id)));
  }

  setupLoginForm();
  setupEvents();
  setupAuthEvents();
  updateSidebarUser();
}

function setupAuthEvents() {
  qs('#btn-logout')?.addEventListener('click', () => {
    if (confirm('Deseja sair do sistema?')) doLogout();
  });
}

// ── Navegação ────────────────────────────────────────────
function navigateTo(screen, pilarId = null) {
  qsa('.screen').forEach(s => s.classList.add('hidden'));
  qs('#screen-' + screen).classList.remove('hidden');

  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  if (screen === 'pilar' && pilarId) {
    qs(`[data-screen="pilar"][data-pilar="${pilarId}"]`)?.classList.add('active');
  } else {
    qs(`[data-screen="${screen}"]`)?.classList.add('active');
  }

  if (screen === 'pilar' && pilarId) setPilar(pilarId);
  if (screen === 'dashboard') renderDashboard();
  if (screen === 'calculadora') renderCalculadora();

  qs('.main').scrollTo(0, 0);
}

// ── Pilar screen ─────────────────────────────────────────
function setPilar(pilarId) {
  const pilar = CONFIG.getPilar(pilarId);
  if (!pilar) return;
  STATE.currentPilar = pilarId;

  document.documentElement.style.setProperty('--pilar-color', pilar.cor);

  qs('#pilar-badge').textContent      = pilar.sigla;
  qs('#pilar-badge').style.background = pilar.cor;
  qs('#pilar-nome').textContent       = pilar.nome;
  qs('#pilar-peso-tag').textContent   = `${Math.round(pilar.peso * 100)}% do IMD`;
  qs('#pilar-objetivo').textContent   = pilar.objetivo;
  qs('#tab-btn-quickwins').classList.toggle('hidden', pilarId !== 'IA');

  const idx = PILAR_ORDER.indexOf(pilarId);
  qs('#btn-anterior').textContent = idx === 0 ? '← Configuração' : `← ${CONFIG.getPilar(PILAR_ORDER[idx - 1]).nome}`;
  qs('#btn-proximo').textContent  = idx === PILAR_ORDER.length - 1 ? 'Ver Dashboard IMD →' : `${CONFIG.getPilar(PILAR_ORDER[idx + 1]).nome} →`;

  switchTab('avaliacao');
  renderDimensoes(pilar);
  updateScoreHeader(pilarId);
}

function renderDimensoes(pilar) {
  const list = qs('#dimensoes-list');
  list.innerHTML = '';
  pilar.dimensoes.forEach(d => list.appendChild(buildDimCard(d)));
  updateProgress(pilar);
}

function buildDimCard(dim) {
  const s = STATE.scores[dim.id];
  const card = document.createElement('div');
  card.id        = 'dim-' + dim.id;
  card.className = 'dimensao-card' + (s.na ? ' na-active' : '') + (s.score ? ' scored' : '');
  if (s.score) card.style.setProperty('--dim-score-color', scoreColor(s.score));

  card.innerHTML = `
    <div class="dim-card-header">
      <div class="dim-card-left">
        <div class="dim-nome">${dim.nome}</div>
        <div class="dim-peso">${Math.round(dim.peso * 100)}% do pilar</div>
      </div>
      <button class="btn-na ${s.na ? 'active' : ''}" data-id="${dim.id}">N/A</button>
    </div>
    <p class="dim-descricao">${dim.descricao}</p>
    <div class="scoring-row">
      ${CONFIG.niveis.map(n => `
        <button class="score-btn ${s.score === n.nivel ? 'selected' : ''}" data-nivel="${n.nivel}" data-id="${dim.id}">
          <span class="score-num">${n.nivel}</span>
          <span class="score-label">${n.nome}</span>
        </button>`).join('')}
    </div>
    <div class="dim-criterio ${s.score ? '' : 'hidden'}" id="criterio-${dim.id}">
      ${s.score ? criterioHTML(dim, s.score) : ''}
    </div>
    ${(dim.custoGap || dim.potencialIA) ? `
    <div class="dim-custo ${s.score ? '' : 'hidden'}" id="custo-${dim.id}">
      ${s.score ? custoHTML(dim, s.score) : ''}
    </div>` : ''}
    ${dim.benchmark ? `<div class="dim-benchmark ${s.score ? '' : 'hidden'}" id="bench-${dim.id}">${dim.benchmark}</div>` : ''}
    <div class="${s.na ? '' : 'hidden'}" id="na-wrap-${dim.id}">
      <input class="na-motivo-input" id="na-motivo-${dim.id}" placeholder="Motivo de N/A (opcional)..." value="${s.naMotivo || ''}">
    </div>
    <textarea class="dim-obs" id="obs-${dim.id}" placeholder="Observações do consultor...">${s.obs || ''}</textarea>
  `;
  return card;
}

function criterioHTML(dim, nivel) {
  const c = dim.criterios[nivel];
  if (!c) return '';
  return `<span class="criterio-nivel-badge" style="background:${scoreColor(nivel)}">Nível ${nivel} — ${c.nome}</span>
          <p class="criterio-desc">${c.descricao}</p>`;
}

function custoHTML(dim, nivel) {
  const fat  = STATE.config.faturamentoVal;
  const func = STATE.config.funcionariosVal;
  if (dim.potencialIA) {
    const v = CONFIG.calcularPotencialIA(dim.potencialIA, nivel, fat, func);
    return v > 0
      ? `<span class="dim-custo-icon">✨</span><div><span class="dim-custo-label">Potencial de ganho com IA</span><span class="dim-custo-valor" style="color:#0F766E">${fmtBRL(v)}/mês</span></div>`
      : `<span class="dim-custo-icon">✓</span><div><span class="dim-custo-valor" style="color:#0F766E">Nível máximo — sem gap</span></div>`;
  }
  if (dim.custoGap) {
    const v = CONFIG.calcularCustoGap(dim.custoGap, nivel, fat, func);
    return v > 0
      ? `<span class="dim-custo-icon">⚠</span><div><span class="dim-custo-label">Custo estimado do gap</span><span class="dim-custo-valor">${fmtBRL(v)}/mês</span></div>`
      : `<span class="dim-custo-icon">✓</span><div><span class="dim-custo-valor" style="color:#0F766E">Nível 5 — sem gap</span></div>`;
  }
  return '';
}

// ── Scoring handlers ─────────────────────────────────────
function onScore(dimId, nivel) {
  const s = STATE.scores[dimId];
  if (s.na) return;
  s.score = s.score === nivel ? null : nivel;

  const card = qs('#dim-' + dimId);
  card.querySelectorAll('.score-btn').forEach(b =>
    b.classList.toggle('selected', Number(b.dataset.nivel) === s.score)
  );
  card.classList.toggle('scored', !!s.score);
  if (s.score) card.style.setProperty('--dim-score-color', scoreColor(s.score));

  const { dimensao: dim } = CONFIG.getDimensao(dimId) || {};
  if (dim) {
    const crit = qs('#criterio-' + dimId);
    if (crit) { crit.innerHTML = s.score ? criterioHTML(dim, s.score) : ''; crit.classList.toggle('hidden', !s.score); }
    const custo = qs('#custo-' + dimId);
    if (custo) { custo.innerHTML = s.score ? custoHTML(dim, s.score) : ''; custo.classList.toggle('hidden', !s.score); }
    const bench = qs('#bench-' + dimId);
    if (bench) bench.classList.toggle('hidden', !s.score);
  }

  updateProgress(CONFIG.getPilar(STATE.currentPilar));
  updateScoreHeader(STATE.currentPilar);
  updateSidebarBadge(STATE.currentPilar);
  if (STATE.currentTab === 'score') renderScoreTab(STATE.currentPilar);
}

function onNA(dimId) {
  const s = STATE.scores[dimId];
  s.na = !s.na;
  if (s.na) s.score = null;

  const card = qs('#dim-' + dimId);
  card.classList.toggle('na-active', s.na);
  card.classList.toggle('scored', false);
  card.querySelectorAll('.score-btn').forEach(b => b.classList.remove('selected'));
  card.querySelector('.btn-na')?.classList.toggle('active', s.na);
  qs('#na-wrap-' + dimId)?.classList.toggle('hidden', !s.na);
  ['criterio', 'custo', 'bench'].forEach(p => qs(`#${p}-${dimId}`)?.classList.add('hidden'));

  updateProgress(CONFIG.getPilar(STATE.currentPilar));
  updateScoreHeader(STATE.currentPilar);
  updateSidebarBadge(STATE.currentPilar);
}

// ── Calculations ─────────────────────────────────────────
function pilarScore(pilarId) {
  return CONFIG.calcularScorePilar(CONFIG.getPilar(pilarId).dimensoes, STATE.scores);
}

function allPilarScores() {
  const out = {};
  CONFIG.pilares.forEach(p => { out[p.id] = pilarScore(p.id); });
  return out;
}

function totalCusto(pilarId) {
  const fat = STATE.config.faturamentoVal, func = STATE.config.funcionariosVal;
  return CONFIG.getPilar(pilarId).dimensoes.reduce((sum, d) => {
    const s = STATE.scores[d.id];
    return sum + (s && !s.na && s.score && d.custoGap ? CONFIG.calcularCustoGap(d.custoGap, s.score, fat, func) : 0);
  }, 0);
}

function totalPotencial(pilarId) {
  const fat = STATE.config.faturamentoVal, func = STATE.config.funcionariosVal;
  return CONFIG.getPilar(pilarId).dimensoes.reduce((sum, d) => {
    const s = STATE.scores[d.id];
    return sum + (s && !s.na && s.score && d.potencialIA ? CONFIG.calcularPotencialIA(d.potencialIA, s.score, fat, func) : 0);
  }, 0);
}

function topGaps(n, pilarId = null) {
  const gaps = [];
  CONFIG.pilares.forEach(p => {
    p.dimensoes.forEach(d => {
      const s = STATE.scores[d.id];
      if (!s || s.na || !s.score) return;
      const gap = 5 - s.score;
      if (!gap) return;
      gaps.push({ dimId: d.id, dimNome: d.nome, pilarId: p.id, pilarNome: p.nome, pilarCor: p.cor, score: s.score, priority: gap * d.peso * p.peso });
    });
  });
  gaps.sort((a, b) => b.priority - a.priority);
  return (pilarId ? gaps.filter(g => g.pilarId === pilarId) : gaps).slice(0, n);
}

// ── Tabs ─────────────────────────────────────────────────
function switchTab(tabId) {
  STATE.currentTab = tabId;
  qsa('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  qsa('.tab-content').forEach(t => { t.classList.remove('active'); t.classList.add('hidden'); });
  const target = qs('#tab-' + tabId);
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }

  const pilar = CONFIG.getPilar(STATE.currentPilar);
  if (tabId === 'score')     renderScoreTab(STATE.currentPilar);
  if (tabId === 'perguntas') renderPerguntas(pilar);
  if (tabId === 'quickwins') renderQuickWins(pilar);
}

// ── Score tab ────────────────────────────────────────────
function renderScoreTab(pilarId) {
  const pilar = CONFIG.getPilar(pilarId);
  const score = pilarScore(pilarId);

  updateGauge('gauge-pilar-fill', score, GAUGE_SM_CIRC, pilar.cor);
  qs('#gauge-pilar-score').textContent = score !== null ? Math.round(score) : '—';
  qs('#gauge-pilar-level').textContent = score !== null ? nivelFromScore(score).nome : '—';

  if (pilarId === 'IA') {
    const v = totalPotencial(pilarId);
    qs('.custo-box-label').textContent = 'Potencial de ganho com IA';
    qs('#custo-box-val').textContent = v > 0 ? fmtBRL(v) + '/mês' : '—';
    qs('#custo-box-val').style.color = '#0F766E';
    qs('#custo-box-sub').textContent = v > 0 ? fmtBRL(v * 12) + '/ano' : '';
  } else {
    const v = totalCusto(pilarId);
    qs('.custo-box-label').textContent = 'Custo total dos gaps';
    qs('#custo-box-val').textContent = v > 0 ? fmtBRL(v) + '/mês' : '—';
    qs('#custo-box-val').style.color = v > 0 ? '#EA580C' : '';
    qs('#custo-box-sub').textContent = v > 0 ? fmtBRL(v * 12) + '/ano' : '';
  }

  // Barras por dimensão
  const bars = qs('#dim-bars');
  bars.innerHTML = '';
  pilar.dimensoes.forEach(d => {
    const s = STATE.scores[d.id];
    const pct   = s && !s.na && s.score ? (s.score / 5) * 100 : 0;
    const color = s && s.score ? scoreColor(s.score) : 'var(--border)';
    const val   = s && !s.na && s.score ? Math.round(s.score * 20) : null;
    const row = document.createElement('div');
    row.className = 'dim-bar-row';
    row.innerHTML = `
      <span class="dim-bar-nome" title="${d.nome}">${d.nome}</span>
      <div class="dim-bar-track"><div class="dim-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      ${s && s.na ? `<span class="dim-bar-na">N/A</span>` : `<span class="dim-bar-val" style="color:${color}">${val !== null ? val : '—'}</span>`}
    `;
    bars.appendChild(row);
  });

  // Top 3 gaps
  renderGapList('#top3-gaps', topGaps(3, pilarId), pilar.cor);

  // Radar
  const vals   = pilar.dimensoes.map(d => { const s = STATE.scores[d.id]; return (!s || s.na || !s.score) ? 0 : s.score; });
  const labels = pilar.dimensoes.map(d => d.nome);
  renderRadar('radar-pilar', labels, vals, 5, pilar.cor, 150, 135, 90);
}

function renderGapList(sel, gaps, defaultColor) {
  const el = qs(sel);
  if (!el) return;
  if (!gaps.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:4px 0">Nenhum gap identificado ainda.</p>'; return; }
  el.innerHTML = gaps.map((g, i) => `
    <div class="gap-item">
      <div class="gap-rank" style="background:${g.pilarCor || defaultColor}">${i + 1}</div>
      <div class="gap-info">
        <div class="gap-nome">${g.dimNome}</div>
        <div class="gap-pilar-tag">${g.pilarNome || ''}</div>
      </div>
      <span class="gap-score" style="color:${scoreColor(g.score)}">${g.score * 20}</span>
    </div>`).join('');
}

// ── Perguntas tab ─────────────────────────────────────────
function renderPerguntas(pilar) {
  const list = qs('#perguntas-list');
  list.innerHTML = '';
  const setor = STATE.config.setor;
  pilar.dimensoes.forEach(d => {
    const s = STATE.scores[d.id];
    const isNA = s && s.na;
    const block = document.createElement('div');
    block.className = 'perguntas-bloco' + (isNA ? ' na-active' : '');
    const pergExtras = (d.perguntasPorSetor && d.perguntasPorSetor[setor]) || [];
    const todasPerguntas = [...d.perguntas, ...pergExtras];
    const sLabel = CONFIG.setores.find(x => x.id === setor)?.label || '';
    block.innerHTML = `
      <div class="perg-bloco-header">
        <span class="perg-bloco-nome">${d.nome}</span>
        <span class="perg-bloco-peso">${Math.round(d.peso * 100)}% do pilar</span>
        ${isNA ? '<span class="perg-bloco-na-badge">N/A</span>' : ''}
        ${pergExtras.length ? `<span class="perg-bloco-setor-badge">+ ${sLabel}</span>` : ''}
      </div>
      <ul class="perg-lista">${todasPerguntas.map(p => `<li>${p}</li>`).join('')}</ul>
    `;
    list.appendChild(block);
  });
}

// ── Quick Wins tab ────────────────────────────────────────
function renderQuickWins(pilar) {
  const pot = totalPotencial(pilar.id);
  qs('#qwh-total-val').textContent = pot > 0 ? fmtBRL(pot) + '/mês' : '—';

  const fat = STATE.config.faturamentoVal, func = STATE.config.funcionariosVal;
  const qws = [];
  pilar.dimensoes.forEach(d => {
    const s = STATE.scores[d.id];
    if (!s || s.na || !s.score) return;
    const tpl = QW_TEMPLATES[d.id];
    if (!tpl) return;
    const v   = d.potencialIA ? CONFIG.calcularPotencialIA(d.potencialIA, s.score, fat, func) : 0;
    const roi = s.score <= 2 ? 'alto' : s.score <= 3 ? 'medio' : 'baixo';
    qws.push({ ...tpl, roi, roiLabel: { alto: '↑ ROI Alto', medio: '→ ROI Médio', baixo: '↓ ROI Baixo' }[roi], pot: v });
  });
  qws.sort((a, b) => ({ alto: 0, medio: 1, baixo: 2 }[a.roi] - { alto: 0, medio: 1, baixo: 2 }[b.roi]));

  const list = qs('#qw-list');
  if (!qws.length) { list.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Avalie as dimensões para ver os quick wins.</p>'; return; }
  list.innerHTML = qws.map(q => `
    <div class="qw-card">
      <span class="qw-roi-badge ${q.roi}">${q.roiLabel}</span>
      <div class="qw-titulo">${q.titulo}</div>
      <div class="qw-descricao">${q.descricao}</div>
      <div class="qw-meta">
        <div class="qw-meta-item"><span class="qw-meta-label">Prazo</span><span class="qw-meta-val">${q.prazo}</span></div>
        <div class="qw-meta-item"><span class="qw-meta-label">Área</span><span class="qw-meta-val">${q.area}</span></div>
        ${q.pot > 0 ? `<div class="qw-meta-item"><span class="qw-meta-label">Potencial/mês</span><span class="qw-meta-val" style="color:#0F766E">${fmtBRL(q.pot)}</span></div>` : ''}
      </div>
    </div>`).join('');
}

// ── Dashboard ─────────────────────────────────────────────
function renderDashboard() {
  const scores = allPilarScores();
  const imd    = CONFIG.calcularIMD(scores);

  qs('#dashboard-empresa').textContent = STATE.config.empresa
    ? `${STATE.config.empresa} · ${STATE.config.responsavel}`
    : (STATE.config.responsavel || 'Assessment em andamento');

  updateGauge('gauge-imd-fill', imd, GAUGE_LG_CIRC, '#6366F1');
  qs('#gauge-imd-score').textContent = imd !== null ? Math.round(imd) : '—';

  if (imd !== null) {
    const faixa = CONFIG.getFaixaIMD(imd);
    const badge = qs('#imd-class-badge');
    badge.textContent  = faixa.nome;
    badge.style.cssText = `background:${faixa.cor}20;color:${faixa.cor};border-color:${faixa.cor}40`;
    qs('#imd-diagnostico').textContent = faixa.diagnostico;
    qs('#gauge-imd-fill').style.stroke = faixa.cor;
    // Recomendação de produto Nexus
    const prodEl = qs('#nexus-produto-recomendado');
    if (prodEl && faixa.produtoNexus) {
      prodEl.style.display = 'block';
      prodEl.style.borderColor = faixa.cor + '50';
      prodEl.innerHTML = `
        <div class="nexus-rec-label">Próximo passo recomendado</div>
        <div class="nexus-rec-produto" style="color:${faixa.cor}">${faixa.produtoNexus}</div>
        <div class="nexus-rec-acao">${faixa.acaoNexus}</div>
        <div class="nexus-rec-prazo" style="background:${faixa.cor}15;color:${faixa.cor}">⏱ Resultado em ${faixa.prazoNexus}</div>
      `;
    }
  }

  // Pilar cards
  const grid = qs('#pilares-grid');
  grid.innerHTML = '';
  CONFIG.pilares.forEach(p => {
    const s   = scores[p.id];
    const pct = s !== null ? Math.max(0, ((s - 20) / 80) * 100) : 0;
    const card = document.createElement('div');
    card.className = 'pilar-card';
    card.style.setProperty('--pc', p.cor);
    card.innerHTML = `
      <div class="pc-header"><span class="pc-sigla">${p.sigla}</span><span class="pc-peso">${Math.round(p.peso * 100)}%</span></div>
      <div class="pc-nome">${p.nome}</div>
      <div class="pc-score">${s !== null ? Math.round(s) : '—'}</div>
      <div class="pc-nivel">${s !== null ? nivelFromScore(s).nome : 'Não avaliado'}</div>
      <div class="pc-bar-track"><div class="pc-bar-fill" style="width:${pct}%"></div></div>
    `;
    card.addEventListener('click', () => navigateTo('pilar', p.id));
    grid.appendChild(card);
  });

  // Top 5 gaps
  renderGapList('#top5-gaps', topGaps(5), '#6B7280');

  // Radar IMD (valores em 0-5)
  renderRadar('radar-imd',
    CONFIG.pilares.map(p => p.sigla),
    CONFIG.pilares.map(p => scores[p.id] !== null ? scores[p.id] / 20 : 0),
    5, '#6366F1', 180, 160, 120
  );

  // Card de Perfil de Maturidade
  renderPerfilCard(scores, imd);

  updateAllSidebarBadges();
}

// ── Radar SVG ─────────────────────────────────────────────
function renderRadar(svgId, labels, values, maxVal, color, cx, cy, maxR) {
  const svg = qs('#' + svgId);
  if (!svg) return;
  svg.innerHTML = '';
  const N = labels.length;
  if (N < 3) return;

  const ang = i => -Math.PI / 2 + (2 * Math.PI * i) / N;
  const pt  = (i, r) => ({ x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)) });

  // Grid
  for (let lv = 1; lv <= 5; lv++) {
    const r    = (lv / 5) * maxR;
    const pts  = Array.from({ length: N }, (_, i) => `${pt(i, r).x.toFixed(1)},${pt(i, r).y.toFixed(1)}`).join(' ');
    const poly = svgEl('polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', lv === 5 ? '#D1D5DB' : '#E5E7EB');
    poly.setAttribute('stroke-width', lv === 5 ? '1.5' : '1');
    svg.appendChild(poly);
  }

  // Eixos
  for (let i = 0; i < N; i++) {
    const p    = pt(i, maxR);
    const line = svgEl('line');
    ['x1', 'y1', 'x2', 'y2'].forEach((a, j) => line.setAttribute(a, [cx, cy, p.x, p.y][j].toFixed(1)));
    line.setAttribute('stroke', '#E5E7EB'); line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // Polígono de dados
  const dataPts = Array.from({ length: N }, (_, i) => {
    const v = Math.max(0, Math.min(maxVal, values[i] || 0));
    const p = pt(i, (v / maxVal) * maxR);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
  const poly = svgEl('polygon');
  poly.setAttribute('points', dataPts);
  poly.setAttribute('fill', color + '30');
  poly.setAttribute('stroke', color);
  poly.setAttribute('stroke-width', '2.5');
  poly.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(poly);

  // Pontos
  for (let i = 0; i < N; i++) {
    const v  = Math.max(0, Math.min(maxVal, values[i] || 0));
    const p  = pt(i, (v / maxVal) * maxR);
    const c  = svgEl('circle');
    c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
    c.setAttribute('r', '4'); c.setAttribute('fill', color);
    c.setAttribute('stroke', 'white'); c.setAttribute('stroke-width', '1.5');
    svg.appendChild(c);
  }

  // Labels
  for (let i = 0; i < N; i++) {
    const p    = pt(i, maxR + 16);
    const text = svgEl('text');
    text.setAttribute('x', p.x.toFixed(1)); text.setAttribute('y', p.y.toFixed(1));
    text.setAttribute('text-anchor', Math.abs(p.x - cx) < 10 ? 'middle' : p.x < cx ? 'end' : 'start');
    text.setAttribute('dominant-baseline', p.y < cy - 10 ? 'auto' : p.y > cy + 10 ? 'hanging' : 'middle');
    text.setAttribute('font-size', '11'); text.setAttribute('font-weight', '600'); text.setAttribute('fill', '#6B7280');
    const lbl = labels[i]; text.textContent = lbl.length > 14 ? lbl.slice(0, 12) + '…' : lbl;
    svg.appendChild(text);
  }
}

// ── Gauge ─────────────────────────────────────────────────
function updateGauge(fillId, score, circ, color) {
  const el = qs('#' + fillId);
  if (!el) return;
  const pct = score !== null ? Math.max(0, Math.min(1, (score - 20) / 80)) : 0;
  el.setAttribute('stroke-dasharray', `${(pct * circ).toFixed(1)} ${circ.toFixed(1)}`);
  if (color) el.style.stroke = color;
}

// ── Sidebar ───────────────────────────────────────────────
function updateSidebarBadge(pilarId) {
  const s = pilarScore(pilarId);
  const b = qs('#badge-' + pilarId);
  if (!b) return;
  b.textContent = s !== null ? Math.round(s) : '';
  b.classList.toggle('hidden', s === null);
}

function updateAllSidebarBadges() {
  PILAR_ORDER.forEach(updateSidebarBadge);
  const imd = CONFIG.calcularIMD(allPilarScores());
  const b   = qs('#badge-imd');
  if (b) { b.textContent = imd !== null ? Math.round(imd) : ''; b.classList.toggle('hidden', imd === null); }
}

function updateScoreHeader(pilarId) {
  const s = pilarScore(pilarId);
  const el = qs('#psw-val');
  el.textContent  = s !== null ? Math.round(s) : '—';
  el.style.color  = s !== null ? CONFIG.getPilar(pilarId).cor : 'var(--text-muted)';
}

function updateProgress(pilar) {
  const done  = pilar.dimensoes.filter(d => { const s = STATE.scores[d.id]; return s && (s.score !== null || s.na); }).length;
  qs('#dim-progress-text').textContent = `${done} de ${pilar.dimensoes.length} dimensões avaliadas`;
}

// ── Utils ─────────────────────────────────────────────────
function scoreColor(n) {
  return ['', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0F766E'][n] || '#6B7280';
}

function nivelFromScore(s) {
  if (s >= 85) return CONFIG.niveis[4];
  if (s >= 68) return CONFIG.niveis[3];
  if (s >= 52) return CONFIG.niveis[2];
  if (s >= 36) return CONFIG.niveis[1];
  return CONFIG.niveis[0];
}

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

function toast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  qs('#toast-container').appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

// ── Events ────────────────────────────────────────────────
function setupEvents() {
  // Config submit
  qs('#form-config').addEventListener('submit', e => {
    e.preventDefault();
    const resp = qs('#responsavel').value.trim();
    const setor = qs('#setor').value;
    const fat  = qs('#faturamento').value;
    const func = qs('#funcionarios').value;
    if (!resp || !setor || !fat || !func) { toast('Preencha todos os campos obrigatórios.', 'error'); return; }

    STATE.config = {
      empresa:        qs('#empresa-nome').value.trim(),
      responsavel:    resp, setor, faturamento: fat, funcionarios: func,
      faturamentoVal:  CONFIG.faturamentoOpcoes.find(f => f.id === fat)?.valorCalculo  || 0,
      funcionariosVal: CONFIG.funcionariosOpcoes.find(f => f.id === func)?.valorCalculo || 0,
    };

    // N/A automático por setor
    CONFIG.pilares.forEach(p => p.dimensoes.forEach(d => {
      if (d.naSugeridoPara?.includes(setor)) STATE.scores[d.id].na = true;
    }));

    // Sidebar footer
    const sLabel = CONFIG.setores.find(s => s.id === setor)?.label || '';
    qs('#sidebar-company').classList.remove('hidden');
    qs('#sc-nome').textContent = STATE.config.empresa || 'Empresa não informada';
    qs('#sc-meta').textContent = `${resp} · ${sLabel}`;

    navigateTo('pilar', 'N');
    toast('Assessment configurado! Avalie os pilares.', 'success');
  });

  // Sidebar navigation
  document.addEventListener('click', e => {
    const nav = e.target.closest('.nav-item');
    if (!nav) return;
    e.preventDefault();
    const { screen, pilar } = nav.dataset;
    if (screen === 'config') { navigateTo('config'); return; }
    if (screen === 'dashboard') { navigateTo('dashboard'); return; }
    if (screen === 'calculadora') { navigateTo('calculadora'); return; }
    if (screen === 'usuarios') { navigateTo('usuarios'); carregarUsuarios(); return; }
    if (screen === 'pilar' && pilar) {
      if (!STATE.config.responsavel) { toast('Configure o assessment primeiro.', 'error'); return; }
      navigateTo('pilar', pilar);
    }
  });

  // Tab switch
  qs('#pilar-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn && !btn.classList.contains('hidden')) switchTab(btn.dataset.tab);
  });

  // Score + N/A (delegation)
  document.addEventListener('click', e => {
    const sb = e.target.closest('.score-btn');
    if (sb) onScore(sb.dataset.id, Number(sb.dataset.nivel));
    const nb = e.target.closest('.btn-na');
    if (nb) onNA(nb.dataset.id);
  });

  // Persist obs/motivo
  document.addEventListener('change', e => {
    if (e.target.classList.contains('dim-obs')) {
      const id = e.target.id.replace('obs-', '');
      if (STATE.scores[id]) STATE.scores[id].obs = e.target.value;
    }
    if (e.target.classList.contains('na-motivo-input')) {
      const id = e.target.id.replace('na-motivo-', '');
      if (STATE.scores[id]) STATE.scores[id].naMotivo = e.target.value;
    }
  });

  // Pilar nav
  qs('#btn-anterior').addEventListener('click', () => {
    const idx = PILAR_ORDER.indexOf(STATE.currentPilar);
    navigateTo(idx === 0 ? 'config' : 'pilar', idx === 0 ? null : PILAR_ORDER[idx - 1]);
  });
  qs('#btn-proximo').addEventListener('click', () => {
    const idx = PILAR_ORDER.indexOf(STATE.currentPilar);
    if (idx === PILAR_ORDER.length - 1) navigateTo('dashboard');
    else navigateTo('pilar', PILAR_ORDER[idx + 1]);
  });

  // Salvar no Google Sheets (GAS)
  qs('#btn-salvar')?.addEventListener('click', onSalvar);

  // Botões IA (conectados ao GAS — requerem GAS_URL + assessment salvo)
  qs('#btn-gerar-resumo')?.addEventListener('click', () => onAcaoIA('gerarResumoIA', 'Resumo Executivo'));
  qs('#btn-gerar-proposta')?.addEventListener('click', () => onAcaoIA('gerarPropostaIA', 'Proposta Comercial'));
  qs('#btn-gerar-apresentacao')?.addEventListener('click', () => toast('Disponível na Fase 2 — Geração de apresentação.', 'info'));
  qs('#btn-gerar-roadmap')?.addEventListener('click', () => onAcaoIA('gerarRoadmapIA', 'Roadmap de 90 Dias'));
  qs('#btn-gerar-relatorio')?.addEventListener('click', () => onAcaoIA('gerarRelatorio', 'Relatório Completo'));

  // Modal
  const closeModal = () => qs('#modal-overlay').classList.add('hidden');
  qs('#modal-close').addEventListener('click', closeModal);
  qs('#btn-modal-fechar').addEventListener('click', closeModal);
  qs('#modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  qs('#btn-modal-copiar').addEventListener('click', () => {
    navigator.clipboard.writeText(qs('#modal-body').textContent)
      .then(() => toast('Texto copiado!', 'success'));
  });
}

// ── Perfil de Maturidade ─────────────────────────────────

/**
 * Mapeia os scores de pilares (escala 20-100) para (escala 1-5)
 * e injeta o card de perfil acima do radar no dashboard.
 *
 * @param {Object} scores  – { N: 60, T: 75, P: 45, G: 55, IA: 40 } (20-100)
 * @param {number|null} imd – IMD consolidado
 */
function renderPerfilCard(scores, imd) {
  const wrap = qs('#perfil-card-wrap');
  if (!wrap) return;
  if (imd === null || !window.PerfilMaturidade) { wrap.innerHTML = ''; return; }

  // Converte 20-100 → 1-5 (null é tratado como 1.0 — nível mínimo)
  const ps = {
    neg:  (scores.N  ?? 20) / 20,
    tec:  (scores.T  ?? 20) / 20,
    proc: (scores.P  ?? 20) / 20,
    gov:  (scores.G  ?? 20) / 20,
    ia:   (scores.IA ?? 20) / 20,
  };

  const resultado = window.PerfilMaturidade.classificarPerfil(ps, Math.round(imd));
  wrap.innerHTML  = window.PerfilMaturidade.gerarCardPerfil(resultado);

  // Armazena resultado para uso posterior (Relatorio.gs, etc.)
  STATE.perfilResultado = resultado;
}

// ── Integração GAS ──────────────────────────────────────

async function api(payload) {
  if (!GAS_URL) throw new Error('GAS_URL não configurada em app.js.');
  // Injeta token automaticamente em todas as chamadas
  if (AUTH_STATE.token && !payload.token) payload.token = AUTH_STATE.token;
  const res  = await fetch(GAS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' }, // GAS não aceita application/json cross-origin
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro HTTP ' + res.status);
  const json = await res.json();
  // Sessão expirada ou inválida — força login
  if (!json.ok && json.erro && json.erro.toLowerCase().includes('sessão')) {
    showLoginOverlay('Sua sessão expirou. Faça login novamente.');
    throw new Error(json.erro);
  }
  if (!json.ok) throw new Error(json.erro || 'Erro desconhecido no servidor.');
  return json;
}

async function onSalvar() {
  if (!GAS_URL) {
    toast('Configure GAS_URL em app.js após o deploy do backend.', 'info');
    return;
  }

  const imd = CONFIG.calcularIMD(allPilarScores());
  if (imd === null) { toast('Avalie ao menos um pilar antes de salvar.', 'error'); return; }

  const loading = qs('#loading-overlay');
  loading.classList.remove('hidden');
  try {
    const resultado = await api({
      action:           'salvarAssessment',
      empresa:          STATE.config.empresa,
      responsavel:      STATE.config.responsavel,
      setor:            STATE.config.setor,
      faturamento:      STATE.config.faturamento,
      funcionarios:     STATE.config.funcionarios,
      faturamentoVal:   STATE.config.faturamentoVal,
      funcionariosVal:  STATE.config.funcionariosVal,
      scores:           STATE.scores,
    });
    STATE.savedId = resultado.id;
    toast(`Assessment salvo! ID: ${resultado.id}`, 'success');
  } catch (e) {
    toast('Erro ao salvar: ' + e.message, 'error');
  } finally {
    loading.classList.add('hidden');
  }
}

async function onAcaoIA(action, titulo) {
  if (!GAS_URL) { toast('Configure GAS_URL em app.js após o deploy do backend.', 'info'); return; }
  if (!STATE.savedId) { toast('Salve o assessment antes de gerar conteúdo com IA.', 'info'); return; }

  const loading = qs('#loading-overlay');
  qs('#loading-text').textContent = 'Gerando ' + titulo + ' com IA...';
  loading.classList.remove('hidden');
  try {
    const res = await api({ action, id: STATE.savedId });
    // Relatório: abre URL do Google Doc
    if (action === 'gerarRelatorio' && res.url) {
      window.open(res.url, '_blank');
      toast('Relatório gerado no Google Docs!', 'success');
      return;
    }
    // Outros: exibe no modal
    qs('#modal-title').textContent = titulo;
    qs('#modal-body').textContent  = res.texto || JSON.stringify(res);
    qs('#modal-overlay').classList.remove('hidden');
  } catch (e) {
    toast('Erro ao gerar: ' + e.message, 'error');
  } finally {
    loading.classList.add('hidden');
    qs('#loading-text').textContent = 'Gerando com IA...';
  }
}

// ── Gestão de usuários (admin) ────────────────────────────

async function carregarUsuarios() {
  const wrap = qs('#usuarios-table-wrap');
  if (!wrap) return;
  wrap.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Carregando...</p>';
  try {
    const res = await api({ action: 'listarUsuarios' });
    renderUsuariosTable(res.usuarios || []);
  } catch (e) {
    wrap.innerHTML = `<p style="font-size:13px;color:var(--danger)">${e.message}</p>`;
  }
}

function renderUsuariosTable(usuarios) {
  const wrap = qs('#usuarios-table-wrap');
  if (!wrap) return;
  if (!usuarios.length) {
    wrap.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Nenhum usuário cadastrado.</p>';
    return;
  }
  const rows = usuarios.map(u => {
    const badgeClass = u.ativo ? `usr-badge-${u.role}` : 'usr-badge-inativo';
    const badgeLabel = u.ativo ? (ROLE_LABELS[u.role] || u.role) : 'Inativo';
    const dtCriado   = u.criadoEm ? new Date(u.criadoEm).toLocaleDateString('pt-BR') : '—';
    const isSelf     = AUTH_STATE.usuario && AUTH_STATE.usuario.id === u.id;
    const uJson      = escAttr(JSON.stringify(u));
    return `
      <tr>
        <td style="font-weight:600">${escHtml(u.username)}</td>
        <td>${escHtml(u.nome)}</td>
        <td><span class="usr-badge ${badgeClass}">${badgeLabel}</span></td>
        <td style="color:var(--text-muted);font-size:12px">${dtCriado}</td>
        <td>
          <div class="usr-actions">
            <button class="usr-btn" onclick="abrirModalEditarUsuarioById('${u.id}')">Editar</button>
            ${isSelf ? '' : `<button class="usr-btn usr-btn-danger" onclick="confirmarDeletarUsuario('${u.id}','${escHtml(u.username)}')">Excluir</button>`}
          </div>
        </td>
      </tr>`;
  }).join('');
  wrap.innerHTML = `
    <table class="usuarios-table">
      <thead><tr>
        <th>Username</th><th>Nome</th><th>Perfil</th><th>Criado em</th><th style="text-align:right">Ações</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Cache dos usuários para edição inline
let _usuariosCache = [];

async function carregarUsuariosComCache() {
  try {
    const res = await api({ action: 'listarUsuarios' });
    _usuariosCache = res.usuarios || [];
    renderUsuariosTable(_usuariosCache);
  } catch (e) {
    const wrap = qs('#usuarios-table-wrap');
    if (wrap) wrap.innerHTML = `<p style="font-size:13px;color:var(--danger)">${e.message}</p>`;
  }
}

// Redefine carregarUsuarios para usar cache
async function carregarUsuarios() {
  const wrap = qs('#usuarios-table-wrap');
  if (wrap) wrap.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Carregando...</p>';
  await carregarUsuariosComCache();
}

function abrirModalEditarUsuarioById(id) {
  const u = _usuariosCache.find(x => x.id === id);
  if (u) abrirModalEditarUsuario(u);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function abrirModalNovoUsuario() {
  qs('#modal-usuario-titulo').textContent = 'Novo Usuário';
  qs('#usr-edit-id').value   = '';
  qs('#usr-username').value  = '';
  qs('#usr-nome').value      = '';
  qs('#usr-senha').value     = '';
  qs('#usr-role').value      = 'consultor';
  qs('#usr-ativo').checked   = true;
  qs('#usr-ativo-wrap').style.display = 'none';
  qs('#senha-hint').textContent = '(obrigatório)';
  qs('#usr-username').disabled  = false;
  qs('#modal-usuario-error').classList.add('hidden');
  qs('#modal-usuario-overlay').classList.remove('hidden');
}

function abrirModalEditarUsuario(u) {
  qs('#modal-usuario-titulo').textContent = 'Editar Usuário';
  qs('#usr-edit-id').value   = u.id;
  qs('#usr-username').value  = u.username;
  qs('#usr-nome').value      = u.nome;
  qs('#usr-senha').value     = '';
  qs('#usr-role').value      = u.role || 'consultor';
  qs('#usr-ativo').checked   = u.ativo !== false;
  qs('#usr-ativo-wrap').style.display = 'flex';
  qs('#senha-hint').textContent = '(deixe vazio para não alterar)';
  qs('#usr-username').disabled  = true;
  qs('#modal-usuario-error').classList.add('hidden');
  qs('#modal-usuario-overlay').classList.remove('hidden');
}

async function salvarUsuarioModal() {
  const id    = qs('#usr-edit-id').value;
  const nome  = qs('#usr-nome').value.trim();
  const senha = qs('#usr-senha').value;
  const role  = qs('#usr-role').value;
  const ativo = qs('#usr-ativo').checked;
  const errEl = qs('#modal-usuario-error');

  if (!id) {
    // NOVO usuário
    const username = qs('#usr-username').value.trim().toLowerCase();
    if (!username || !nome || !senha) {
      errEl.textContent = 'Preencha username, nome e senha.';
      errEl.classList.remove('hidden'); return;
    }
    if (senha.length < 6) {
      errEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
      errEl.classList.remove('hidden'); return;
    }
    const btn = qs('#btn-usuario-salvar');
    btn.disabled = true; btn.textContent = 'Salvando...';
    try {
      await api({ action: 'criarUsuario', dados: { username, nome, senha, role } });
      fecharModalUsuario();
      toast('Usuário criado com sucesso!', 'success');
      carregarUsuarios();
    } catch (e) {
      errEl.textContent = e.message; errEl.classList.remove('hidden');
    } finally { btn.disabled = false; btn.textContent = 'Salvar usuário'; }
  } else {
    // EDITAR usuário
    if (!nome) {
      errEl.textContent = 'Nome é obrigatório.';
      errEl.classList.remove('hidden'); return;
    }
    if (senha && senha.length < 6) {
      errEl.textContent = 'A nova senha precisa ter pelo menos 6 caracteres.';
      errEl.classList.remove('hidden'); return;
    }
    const dados = { id, nome, role, ativo };
    if (senha) dados.senha = senha;
    const btn = qs('#btn-usuario-salvar');
    btn.disabled = true; btn.textContent = 'Salvando...';
    try {
      await api({ action: 'atualizarUsuario', dados });
      fecharModalUsuario();
      toast('Usuário atualizado!', 'success');
      carregarUsuarios();
    } catch (e) {
      errEl.textContent = e.message; errEl.classList.remove('hidden');
    } finally { btn.disabled = false; btn.textContent = 'Salvar usuário'; }
  }
}

async function confirmarDeletarUsuario(id, username) {
  if (!confirm(`Excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await api({ action: 'deletarUsuario', id });
    toast(`Usuário "${username}" excluído.`, 'success');
    carregarUsuarios();
  } catch (e) {
    toast('Erro ao excluir: ' + e.message, 'error');
  }
}

function fecharModalUsuario() {
  qs('#modal-usuario-overlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  qs('#modal-usuario-close')?.addEventListener('click',   fecharModalUsuario);
  qs('#btn-usuario-cancelar')?.addEventListener('click',  fecharModalUsuario);
  qs('#btn-novo-usuario')?.addEventListener('click',      abrirModalNovoUsuario);
  qs('#btn-usuario-salvar')?.addEventListener('click',    salvarUsuarioModal);
});

// ════════════════════════════════════════════════════════
// CALCULADORA ROI & KPIs
// ════════════════════════════════════════════════════════

const KPI_DATA = {
  diagnostico: {
    titulo: 'Diagnóstico Estratégico de IA',
    grupos: [
      {
        grupo: 'Amplitude e Profundidade',
        kpis: [
          { kpi: 'Nº de processos mapeados', meta: '≥ 5 processos', como: 'Workshops + entrevistas' },
          { kpi: 'Nº de oportunidades identificadas', meta: '≥ 8 oportunidades', como: 'Relatório de Oportunidades' },
          { kpi: 'Score de Maturidade Digital (IMD)', meta: '0–100 pontos', como: 'Assessment com 5 pilares' },
        ],
      },
      {
        grupo: 'Valor e Clareza',
        kpis: [
          { kpi: 'ROI potencial total identificado', meta: '≥ 3× o investimento', como: 'Cálculo com dados do cliente' },
          { kpi: 'Prioridades por impacto/esforço', meta: 'Top 3 priorizados', como: 'Matriz 2×2 entregue' },
          { kpi: 'Satisfação do cliente com o diagnóstico', meta: '≥ 8/10', como: 'Formulário pós-entrega' },
        ],
      },
    ],
  },
  operacional: {
    titulo: 'Inteligência Operacional',
    grupos: [
      {
        grupo: 'Grupo A — Eficiência Operacional',
        kpis: [
          { kpi: 'Tempo médio de execução do processo', meta: 'Redução ≥ 40%', como: 'Cronômetro antes/depois' },
          { kpi: 'Horas humanas dedicadas ao processo', meta: 'Redução ≥ 50%', como: 'Registro de horas' },
          { kpi: 'Taxa de erros no processo', meta: 'Redução ≥ 60%', como: 'Log de ocorrências' },
          { kpi: 'Etapas manuais eliminadas', meta: '≥ 3 etapas', como: 'Mapeamento de processo' },
        ],
      },
      {
        grupo: 'Grupo B — Adoção e Qualidade',
        kpis: [
          { kpi: 'Taxa de uso do agente pela equipe', meta: '≥ 80% em 4 semanas', como: 'Logs de acesso' },
          { kpi: 'NPS interno (equipe que usa o agente)', meta: '≥ 7', como: 'Google Forms' },
          { kpi: 'Nº de intervenções manuais necessárias', meta: 'Redução ≥ 70%', como: 'Log de exceções' },
          { kpi: 'Uptime do agente', meta: '≥ 99%', como: 'Monitoramento de sistema' },
        ],
      },
      {
        grupo: 'Grupo C — Resultado de Negócio',
        kpis: [
          { kpi: 'Custo operacional do processo', meta: 'Redução conforme diagnóstico', como: 'Comparativo horas + erros' },
          { kpi: 'Tempo de resposta ao cliente final', meta: 'Redução ≥ 30%', como: 'Registro de SLA' },
          { kpi: 'Capacidade de escala (volume processado)', meta: 'Aumento ≥ 2× sem contratar', como: 'Volume antes/depois' },
        ],
      },
    ],
  },
  produto: {
    titulo: 'Produto Inteligente',
    grupos: [
      {
        grupo: 'Entrega e Qualidade',
        kpis: [
          { kpi: 'Funcionalidades de IA em produção', meta: '100% do escopo', como: 'Por sprint (quinzenal)' },
          { kpi: 'Taxa de adoção pelos usuários finais', meta: '≥ 80% em 30 dias pós go-live', como: 'Semanal no 1º mês' },
          { kpi: 'Satisfação do usuário final (CSAT)', meta: '≥ 8/10', como: 'Pós-onboarding' },
        ],
      },
      {
        grupo: 'Operação e Escala',
        kpis: [
          { kpi: 'Redução de suporte/tickets relacionados', meta: '≥ 40%', como: 'Mensal' },
          { kpi: 'Velocidade de entrega de novas features', meta: '+50% vs. antes', como: 'Por trimestre' },
          { kpi: 'Custo por usuário/transação', meta: 'Redução ≥ 30%', como: 'Dashboard financeiro' },
        ],
      },
    ],
  },
  parceiro: {
    titulo: 'Parceiro Estratégico de IA',
    grupos: [
      {
        grupo: 'Evolução Contínua',
        kpis: [
          { kpi: 'Novos casos de uso implementados', meta: '≥ 1 por trimestre', como: 'Trimestral' },
          { kpi: 'Evolução do Score de Maturidade Digital', meta: '+10 pontos por semestre', como: 'Semestral (reassessment)' },
          { kpi: 'ROI acumulado documentado', meta: '≥ 3× o investimento/ano', como: 'Anual' },
        ],
      },
      {
        grupo: 'Relacionamento e Retenção',
        kpis: [
          { kpi: 'Taxa de retenção do cliente', meta: '100% (contrato ativo)', como: 'Mensal' },
          { kpi: 'NPS do cliente com a Nexus', meta: '≥ 9', como: 'Trimestral' },
          { kpi: 'Horas de consultoria utilizadas vs. contratadas', meta: '≥ 90% de aproveitamento', como: 'Mensal' },
        ],
      },
    ],
  },
};

const JORNADA_STEPS = [
  {
    tempo: '00–05 min',
    emoji: '👋',
    cor: '#2563EB',
    titulo: 'Abertura',
    desc: 'Apresentação dos sócios (2 min). Foco em ouvir, não em vender. Comece com: "Antes de falar de nós, quero entender você."',
    objetivo: 'Criar conexão e mostrar que você ouve antes de propor',
  },
  {
    tempo: '05–20 min',
    emoji: '🔍',
    cor: '#059669',
    titulo: 'Diagnóstico Rápido',
    desc: 'As 5 perguntas essenciais — processo crítico, problema principal, tentativas anteriores, custo do problema e quem decide.',
    objetivo: 'Identificar dor real, maturidade, budget e decisor',
  },
  {
    tempo: '20–35 min',
    emoji: '💡',
    cor: '#D97706',
    titulo: 'Reflexão Estratégica',
    desc: 'Compartilhe 1–2 observações sobre o que ouviu. Cite um caso semelhante. Apresente brevemente o NEXUS AI METHOD™ em 3 pontos.',
    objetivo: 'Mostrar que você pensa antes de propor — não só executar',
  },
  {
    tempo: '35–42 min',
    emoji: '⚖️',
    cor: '#7C3AED',
    titulo: 'Avaliação de Fit',
    desc: '"Deixa eu ser direto: acho que podemos ajudar / não acho que somos a melhor opção agora porque..." — Se houver fit, proponha o Diagnóstico Estratégico.',
    objetivo: 'Credibilidade: indicar outro caminho quando não há fit gera confiança',
  },
  {
    tempo: '42–45 min',
    emoji: '🚀',
    cor: '#DC2626',
    titulo: 'Próximo Passo',
    desc: '"O próximo passo é um Diagnóstico Estratégico de 15 dias onde..." — Apresente escopo, prazo e investimento do produto de entrada.',
    objetivo: 'Sair da call com uma ação clara: proposta em até 24h',
  },
];

// ── Estado da calculadora ──────────────────────────────────
const CALC = {
  pessoas: 0, horas: 0, custoHora: 0, erros: 0, custoErro: 0,
  investimento: 0, reducao: 60,
  custoMensal: 0, economiaMensal: 0,
};

let _calcInitialized = false;

// ── Entry point ───────────────────────────────────────────
function renderCalculadora() {
  if (!_calcInitialized) {
    _calcInitialized = true;
    _setupCalcTabs();
    _setupROICalc();
    _setupKPITab();
    _setupJornadaTab();
    _setupRelatorioTab();
  }
  // Sync tipo with KPI tab if already selected
  const tipo = qs('#ci-tipo')?.value;
  if (tipo) qs('#kpi-tipo').value = tipo;
  _calcROI();
  _updateRelatorio();
}

// ── Tab switching ─────────────────────────────────────────
function _setupCalcTabs() {
  qs('#screen-calculadora').addEventListener('click', e => {
    const tab = e.target.closest('.calc-tab');
    if (!tab) return;
    const ctab = tab.dataset.ctab;
    qsa('.calc-tab').forEach(t => t.classList.toggle('active', t.dataset.ctab === ctab));
    qsa('.calc-panel').forEach(p => p.classList.toggle('hidden', p.id !== 'ctab-' + ctab));
    if (ctab === 'relatorio') _updateRelatorio();
    if (ctab === 'jornada' && !qs('#jornada-timeline-el').children.length) _renderJornada();
  });
}

// ── ROI Calculator ────────────────────────────────────────
function _setupROICalc() {
  const ids = ['ci-pessoas','ci-horas','ci-custo-hora','ci-erros','ci-custo-erro','ci-investimento','ci-tipo'];
  ids.forEach(id => qs('#' + id)?.addEventListener('input', _calcROI));

  const range = qs('#ci-reducao');
  if (range) {
    const _updateRangeGradient = () => {
      const min = +range.min || 10, max = +range.max || 90, val = +range.value;
      const pct = ((val - min) / (max - min)) * 100;
      range.style.background = `linear-gradient(to right,#6366F1 0%,#6366F1 ${pct}%,#E2E8F0 ${pct}%,#E2E8F0 100%)`;
    };
    range.addEventListener('input', () => {
      qs('#ci-reducao-lbl').textContent = range.value + '%';
      _updateRangeGradient();
      _calcROI();
    });
    _updateRangeGradient(); // init
  }
}

function _calcROI() {
  const v = id => parseFloat(qs('#' + id)?.value) || 0;

  CALC.pessoas     = v('ci-pessoas');
  CALC.horas       = v('ci-horas');
  CALC.custoHora   = v('ci-custo-hora');
  CALC.erros       = v('ci-erros');
  CALC.custoErro   = v('ci-custo-erro');
  CALC.investimento = v('ci-investimento');
  CALC.reducao     = parseFloat(qs('#ci-reducao')?.value) || 60;

  CALC.custoMensal   = (CALC.pessoas * CALC.horas * 4.33 * CALC.custoHora) + (CALC.erros * CALC.custoErro);
  CALC.economiaMensal = CALC.custoMensal * (CALC.reducao / 100);

  const custoEl    = qs('#cr-custo');
  const subCusto   = qs('#cr-custo-sub');
  const econEl     = qs('#cr-economia');
  const subEcon    = qs('#cr-economia-sub');
  const roiEl      = qs('#cr-roi');
  const subROI     = qs('#cr-roi-sub');
  const pbEl       = qs('#cr-payback');
  const pbRamp     = qs('#cr-payback-ramp');
  const tlCard     = qs('#calc-timeline-card');

  if (CALC.custoMensal > 0) {
    custoEl.textContent  = fmtBRL(CALC.custoMensal);
    subCusto.textContent = fmtBRL(CALC.custoMensal * 12) + '/ano';
    custoEl.classList.remove('ckc-empty');
  } else {
    custoEl.textContent  = 'R$ —';
    subCusto.textContent = 'Preencha os dados do processo';
    custoEl.classList.add('ckc-empty');
  }

  if (CALC.economiaMensal > 0) {
    econEl.textContent  = fmtBRL(CALC.economiaMensal);
    subEcon.textContent = fmtBRL(CALC.economiaMensal * 12) + '/ano';
    econEl.classList.remove('ckc-empty');
  } else {
    econEl.textContent  = 'R$ —';
    subEcon.textContent = '—/ano';
    econEl.classList.add('ckc-empty');
  }

  if (CALC.investimento > 0 && CALC.economiaMensal > 0) {
    const ganho12  = CALC.economiaMensal * 12;
    const roi      = ((ganho12 - CALC.investimento) / CALC.investimento) * 100;
    roiEl.textContent  = (roi >= 0 ? '+' : '') + Math.round(roi) + '%';
    roiEl.classList.remove('ckc-empty');
    subROI.textContent = roi >= 0
      ? `R$ ${((roi / 100) * CALC.investimento / 1000).toFixed(1)}k de retorno para cada R$ 1k investido`
      : 'Projeto ainda não se paga em 12 meses com estes parâmetros';

    const pb = CALC.investimento / CALC.economiaMensal;
    pbEl.textContent = pb <= 120 ? pb.toFixed(1) + ' meses' : '> 10 anos';
    pbEl.classList.remove('ckc-empty');

    const pbRampVal = _calcPaybackRampup(CALC.investimento, CALC.economiaMensal);
    pbRamp.textContent = 'Com ramp-up: ' + (pbRampVal <= 120 ? pbRampVal.toFixed(1) + ' meses' : '> 10 anos');

    tlCard.style.display = '';
    _renderTimeline(CALC.investimento, CALC.economiaMensal);
  } else {
    roiEl.textContent  = '—';
    roiEl.classList.add('ckc-empty');
    subROI.textContent = 'Informe o investimento e o custo do processo';
    pbEl.textContent   = '— meses';
    pbEl.classList.add('ckc-empty');
    pbRamp.textContent = 'Com ramp-up: —';
    tlCard.style.display = 'none';
  }
}

function _calcPaybackRampup(inv, ganhoMes) {
  const ramp = [0.30, 0.60, 0.90, 1.00];
  let acum = 0, mes = 0;
  while (acum < inv && mes < 240) {
    mes++;
    const fator = mes <= ramp.length ? ramp[mes - 1] : 1.00;
    acum += ganhoMes * fator;
  }
  return mes;
}

function _renderTimeline(inv, ganhoMes) {
  const tl = qs('#calc-timeline');
  if (!tl) return;
  const ramp = [0.30, 0.60, 0.90, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00];
  let acum = 0;
  let rows = '';
  let paybackMes = null;
  const maxAcum = ganhoMes * 12;
  // Show only first 6 months + last month where payback happens (max 12)
  const shown = [1,2,3,4,5,6];

  for (let m = 1; m <= 12; m++) {
    const fator = ramp[m - 1] ?? 1.00;
    acum += ganhoMes * fator;
    if (paybackMes === null && acum >= inv) paybackMes = m;
    if (!shown.includes(m) && m !== 12 && m !== paybackMes) continue;

    const pct   = Math.min(100, (acum / (maxAcum || 1)) * 100);
    const isPb  = paybackMes === m;
    const paid  = acum >= inv;
    const grad  = paid
      ? 'linear-gradient(to right,#16A34A,#4ADE80)'
      : 'linear-gradient(to right,#6366F1,#A78BFA)';

    rows += `<div class="calc-timeline-row">
      <span class="calc-timeline-label">Mês ${m}</span>
      <div class="calc-timeline-track">
        <div class="calc-timeline-fill" style="width:${pct}%;background:${grad}"></div>
      </div>
      <span class="calc-timeline-val" style="color:${paid ? '#15803D' : 'var(--text)'}">
        ${fmtBRL(acum)}${isPb ? `&nbsp;<span class="calc-timeline-payback">✓ Payback</span>` : ''}
      </span>
    </div>`;
  }
  tl.innerHTML = rows;
}

// ── KPIs tab ──────────────────────────────────────────────
function _setupKPITab() {
  qs('#kpi-tipo')?.addEventListener('change', e => _renderKPIs(e.target.value));
  qs('#btn-copiar-kpis')?.addEventListener('click', () => {
    const el = qs('#kpis-content');
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => toast('KPIs copiados!', 'success'));
  });
  // Sync com o tipo selecionado na aba ROI
  qs('#ci-tipo')?.addEventListener('change', e => {
    const tipo = e.target.value;
    if (qs('#kpi-tipo')) qs('#kpi-tipo').value = tipo;
    _renderKPIs(tipo);
  });
}

function _renderKPIs(tipo) {
  const wrap = qs('#kpis-content');
  if (!wrap) return;
  const data = KPI_DATA[tipo];
  if (!data) {
    wrap.innerHTML = `<div class="calc-empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-light);margin-bottom:12px"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      <p>Selecione o tipo de projeto para ver os KPIs sugeridos.</p>
    </div>`;
    return;
  }

  let html = `<h3 style="font-size:15px;font-weight:700;margin-bottom:var(--sp-5);color:var(--text)">${data.titulo}</h3>`;

  data.grupos.forEach(g => {
    html += `<div class="kpi-group">
      <div class="kpi-group-title">${g.grupo}</div>
      <table class="kpi-table">
        <thead><tr>
          <th style="width:38%">KPI</th>
          <th style="width:27%">Meta padrão</th>
          <th>Como medir</th>
        </tr></thead>
        <tbody>`;
    g.kpis.forEach(k => {
      html += `<tr>
        <td>${k.kpi}</td>
        <td><span class="kpi-meta-badge">${k.meta}</span></td>
        <td style="color:var(--text-muted)">${k.como}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  });

  wrap.innerHTML = html;
}

// ── Jornada tab ───────────────────────────────────────────
function _setupJornadaTab() { /* rendered on first click */ }

function _renderJornada() {
  const el = qs('#jornada-timeline-el');
  if (!el) return;
  el.innerHTML = JORNADA_STEPS.map(s => `
    <div class="jornada-step">
      <div class="jornada-step-left">
        <div class="jornada-step-dot" style="background:${s.cor}20;color:${s.cor}">${s.emoji}</div>
        <div class="jornada-step-line"></div>
      </div>
      <div class="jornada-step-body">
        <div class="jornada-step-time" style="color:${s.cor}">${s.tempo}</div>
        <div class="jornada-step-title">${s.titulo}</div>
        <div class="jornada-step-desc">${s.desc}</div>
        <span class="jornada-step-goal">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Objetivo: ${s.objetivo}
        </span>
      </div>
    </div>`).join('');
}

// ── Relatório Antes × Depois ──────────────────────────────
function _setupRelatorioTab() {
  qs('#btn-copiar-relatorio')?.addEventListener('click', () => {
    const ta = qs('#calc-relatorio-text');
    if (!ta) return;
    navigator.clipboard.writeText(ta.value).then(() => toast('Relatório copiado!', 'success'));
  });
}

function _updateRelatorio() {
  const ta = qs('#calc-relatorio-text');
  if (!ta) return;

  const empresa    = STATE.config.empresa || '[Nome da Empresa]';
  const resp       = STATE.config.responsavel || '[Consultor]';
  const hoje       = new Date().toLocaleDateString('pt-BR');
  const tipo       = qs('#ci-tipo')?.value;
  const tipoLabel  = { diagnostico: 'Diagnóstico Estratégico', operacional: 'Inteligência Operacional', produto: 'Produto Inteligente', parceiro: 'Parceiro Estratégico' }[tipo] || '[Tipo de Projeto]';

  const hasCusto   = CALC.custoMensal > 0;
  const hasEcon    = CALC.economiaMensal > 0;
  const hasInv     = CALC.investimento > 0;

  const pb         = (hasInv && hasEcon) ? (CALC.investimento / CALC.economiaMensal).toFixed(1) : 'N/A';
  const pbRamp     = (hasInv && hasEcon) ? _calcPaybackRampup(CALC.investimento, CALC.economiaMensal).toFixed(1) : 'N/A';
  const roi12      = (hasInv && hasEcon) ? Math.round(((CALC.economiaMensal * 12 - CALC.investimento) / CALC.investimento) * 100) : null;

  ta.value = `RELATÓRIO DE RESULTADO — ${empresa.toUpperCase()} — ${hoje}
${'═'.repeat(60)}
Projeto: ${tipoLabel}
Consultor responsável: ${resp}
Processo analisado: [Nome do processo]

${'─'.repeat(60)}
ANTES (situação pré-projeto):
${'─'.repeat(60)}
  Pessoas envolvidas:         ${CALC.pessoas || '—'}
  Horas/semana por pessoa:    ${CALC.horas || '—'}
  Custo/hora (salário+enc.):  ${CALC.custoHora ? 'R$ ' + CALC.custoHora : '—'}
  Erros por mês:              ${CALC.erros || '—'}
  Custo médio por erro:       ${CALC.custoErro ? 'R$ ' + CALC.custoErro : '—'}
  CUSTO MENSAL DO PROCESSO:   ${hasCusto ? fmtBRL(CALC.custoMensal) : '—'}
  Custo anual do processo:    ${hasCusto ? fmtBRL(CALC.custoMensal * 12) : '—'}

${'─'.repeat(60)}
DEPOIS (projeção pós-implantação):
${'─'.repeat(60)}
  Redução esperada:           ${CALC.reducao}%
  Economia mensal estimada:   ${hasEcon ? fmtBRL(CALC.economiaMensal) : '—'}
  Economia anual projetada:   ${hasEcon ? fmtBRL(CALC.economiaMensal * 12) : '—'}

${'─'.repeat(60)}
ANÁLISE DE RETORNO:
${'─'.repeat(60)}
  Investimento total:         ${hasInv ? fmtBRL(CALC.investimento) : '—'}
  ROI em 12 meses:            ${roi12 !== null ? (roi12 >= 0 ? '+' : '') + roi12 + '%' : '—'}
  Payback simples:            ${pb} meses
  Payback com ramp-up:        ${pbRamp} meses

${'─'.repeat(60)}
FONTE DOS DADOS:
${'─'.repeat(60)}
  Dados fornecidos por:       [Nome do responsável no cliente]
  Data de referência:         ${hoje}
  Premissas consideradas:     [Listar premissas]

${'─'.repeat(60)}
PRÓXIMOS PASSOS:
  1. [Definir data de kick-off]
  2. [Mapear stakeholders internos]
  3. [Agendar workshop de imersão]
${'═'.repeat(60)}
Documento gerado pelo Assessment Nexus — Nexus Consultoria
`;
}

document.addEventListener('DOMContentLoaded', init);
