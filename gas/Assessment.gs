// ============================================================
// Assessment.gs — Lógica de negócio do Assessment
// Espelha as funções de cálculo do config.js no servidor GAS
// ============================================================

// ---- Handlers chamados pelo Code.gs ----

function salvarAssessment(payload) {
  _validarPayloadAssessment(payload);

  const resultados = _calcularResultados(payload);

  const id = inserirAssessment({
    empresa:      payload.empresa,
    responsavel:  payload.responsavel,
    setor:        payload.setor,
    faturamento:  payload.faturamento,
    funcionarios: payload.funcionarios,
    imd:          resultados.imd,
    faixa:        resultados.faixa.nome,
    scoresPorPilar: resultados.scoresPorPilar,
    scores:       payload.scores,
    resultados,
  });

  return { id, resultados };
}

function buscarHistorico(empresa) {
  if (!empresa) throw new Error('Empresa é obrigatória.');
  const historico = buscarAssessmentsPorEmpresa(empresa);
  return {
    empresa,
    total:    historico.length,
    historico: historico.sort((a, b) => b.dataHora.localeCompare(a.dataHora)),
  };
}

function buscarAssessmentPorId(id) {
  if (!id) throw new Error('ID é obrigatório.');
  const assessment = buscarAssessmentPorIdInterno(id);
  if (!assessment) throw new Error('Assessment não encontrado: ' + id);
  return { assessment };
}

function listarEmpresas() {
  return { empresas: listarEmpresasUnicas() };
}

function deletarAssessment(id) {
  if (!id) throw new Error('ID é obrigatório.');
  const removido = deletarAssessmentPorId(id);
  if (!removido) throw new Error('Assessment não encontrado: ' + id);
  return { removido: true };
}

// ---- Cálculo de resultados (espelho server-side do config.js) ----

// Pesos dos pilares
const PESOS_PILAR = { N: 0.15, T: 0.25, P: 0.25, G: 0.15, IA: 0.20 };

// Dimensões e pesos por pilar — v2.0 (N6, T7, IA7 adicionados; P7 e G6 reformulados)
const DIMENSOES_PILAR = {
  N:  ['N1','N2','N3','N4','N5','N6'],
  T:  ['T1','T2','T3','T4','T5','T6','T7'],
  P:  ['P1','P2','P3','P4','P5','P6','P7'],  // P7: Talentos e Cultura de Alta Performance
  G:  ['G1','G2','G3','G4','G5','G6'],        // G6: Reputação Digital e ESG Mínimo
  IA: ['IA1','IA2','IA3','IA4','IA5','IA6','IA7'],
};

const PESOS_DIMENSAO = {
  N:  { N1:0.20, N2:0.16, N3:0.16, N4:0.20, N5:0.14, N6:0.14 },
  T:  { T1:0.13, T2:0.16, T3:0.13, T4:0.16, T5:0.14, T6:0.14, T7:0.14 },
  P:  { P1:0.18, P2:0.15, P3:0.15, P4:0.15, P5:0.12, P6:0.12, P7:0.13 },
  G:  { G1:0.18, G2:0.16, G3:0.18, G4:0.16, G5:0.16, G6:0.16 },
  IA: { IA1:0.18, IA2:0.16, IA3:0.16, IA4:0.15, IA5:0.13, IA6:0.12, IA7:0.10 },
};

const FATORES_GAP = { 1:1.00, 2:0.70, 3:0.40, 4:0.15, 5:0.00 };
const FATORES_IA  = { 1:1.00, 2:0.75, 3:0.50, 4:0.25, 5:0.05 };

function _calcularScorePilar(pilarId, scores) {
  const dims    = DIMENSOES_PILAR[pilarId];
  const pesos   = PESOS_DIMENSAO[pilarId];
  let   soma    = 0;
  let   pesosAtivos = 0;

  dims.forEach(dimId => {
    const s = scores[dimId];
    if (!s || s.na || s.score === null || s.score === undefined) return;
    const peso = pesos[dimId] || 0;
    soma        += s.score * peso;
    pesosAtivos += peso;
  });

  if (pesosAtivos === 0) return null;
  return (soma / pesosAtivos) * 20; // escala 1-5 → 20-100
}

function _calcularIMD(scoresPorPilar) {
  let soma  = 0;
  let total = 0;
  Object.entries(PESOS_PILAR).forEach(([pilar, peso]) => {
    const s = scoresPorPilar[pilar];
    if (s === null || s === undefined) return;
    soma  += s * peso;
    total += peso;
  });
  if (total === 0) return null;
  return soma / total;
}

function _getFaixaIMD(imd) {
  if (imd < 40)      return { nome: 'Crítico',    cor: '#E24B4A' };
  if (imd < 55)      return { nome: 'Inicial',    cor: '#E2894B' };
  if (imd < 70)      return { nome: 'Moderado',   cor: '#E2CC4B' };
  if (imd < 85)      return { nome: 'Avançado',   cor: '#4BE27F' };
  return               { nome: 'Referência',  cor: '#4B8BE2' };
}

function _calcularResultados(payload) {
  const scores   = payload.scores || {};
  const faturam  = Number(payload.faturamentoVal)  || 0;
  const funcs    = Number(payload.funcionariosVal) || 0;

  const scoresPorPilar = {};
  Object.keys(PESOS_PILAR).forEach(p => {
    scoresPorPilar[p] = _calcularScorePilar(p, scores);
  });

  const imd  = _calcularIMD(scoresPorPilar) || 20;
  const faixa = _getFaixaIMD(imd);

  return {
    imd:            Math.round(imd * 10) / 10,
    faixa,
    scoresPorPilar,
  };
}

function _validarPayloadAssessment(payload) {
  if (!payload.empresa)  throw new Error('Campo empresa é obrigatório.');
  if (!payload.setor)    throw new Error('Campo setor é obrigatório.');
  if (!payload.scores || typeof payload.scores !== 'object') {
    throw new Error('Scores são obrigatórios.');
  }
}
