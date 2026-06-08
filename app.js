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

// ── Init ─────────────────────────────────────────────────
function init() {
  CONFIG.pilares.forEach(p =>
    p.dimensoes.forEach(d => {
      STATE.scores[d.id] = { score: null, na: false, naMotivo: '', obs: '' };
    })
  );

  // Popula selects
  CONFIG.setores.forEach(s => qs('#setor').add(new Option(s.label, s.id)));
  CONFIG.faturamentoOpcoes.forEach(f => qs('#faturamento').add(new Option(f.label, f.id)));
  CONFIG.funcionariosOpcoes.forEach(f => qs('#funcionarios').add(new Option(f.label, f.id)));

  setupEvents();
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
  const res  = await fetch(GAS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' }, // GAS não aceita application/json cross-origin
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro HTTP ' + res.status);
  const json = await res.json();
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

document.addEventListener('DOMContentLoaded', init);
