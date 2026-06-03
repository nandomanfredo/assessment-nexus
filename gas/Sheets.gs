// ============================================================
// Sheets.gs — Acesso ao Google Sheets
// Estrutura:
//   Aba "Assessments" — um registro por linha
//   Aba "Config"      — par chave/valor para metadados
// ============================================================

const SHEET_NAME_ASSESSMENTS = 'Assessments';
const SHEET_NAME_CONFIG       = 'Config';

// ID da planilha — definir após criar manualmente no Google Drive,
// ou usar a função setupPlanilha() que cria automaticamente.
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';

// Colunas da aba Assessments (índices 0-based)
const COL = {
  ID:            0,
  DATA_HORA:     1,
  EMPRESA:       2,
  RESPONSAVEL:   3,
  SETOR:         4,
  FATURAMENTO:   5,
  FUNCIONARIOS:  6,
  IMD:           7,
  FAIXA:         8,
  SCORE_N:       9,
  SCORE_T:      10,
  SCORE_P:      11,
  SCORE_G:      12,
  SCORE_IA:     13,
  SCORES_JSON:  14,  // JSON completo dos scores por dimensão
  RESULTADOS_JSON: 15, // JSON com resultados calculados (gaps, potencial IA etc.)
};

const HEADERS = [
  'ID', 'Data/Hora', 'Empresa', 'Responsável', 'Setor',
  'Faturamento', 'Funcionários', 'IMD', 'Faixa',
  'Score N', 'Score T', 'Score P', 'Score G', 'Score IA',
  'Scores JSON', 'Resultados JSON',
];

// ---- Acesso à planilha ----

function _getSpreadsheet() {
  if (!SPREADSHEET_ID) {
    throw new Error('SPREADSHEET_ID não configurado. Execute setupPlanilha() primeiro.');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function _getSheet(nome) {
  const ss    = _getSpreadsheet();
  let   sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
    if (nome === SHEET_NAME_ASSESSMENTS) _initHeadersAssessments(sheet);
    if (nome === SHEET_NAME_CONFIG)       _initHeadersConfig(sheet);
  }
  return sheet;
}

function _initHeadersAssessments(sheet) {
  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#2d3748')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

function _initHeadersConfig(sheet) {
  sheet.appendRow(['Chave', 'Valor', 'Atualizado em']);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// ---- CRUD Assessments ----

function inserirAssessment(dados) {
  const sheet = _getSheet(SHEET_NAME_ASSESSMENTS);
  const id    = _gerarId();
  const agora = new Date().toISOString();

  const row = new Array(HEADERS.length).fill('');
  row[COL.ID]              = id;
  row[COL.DATA_HORA]       = agora;
  row[COL.EMPRESA]         = dados.empresa         || '';
  row[COL.RESPONSAVEL]     = dados.responsavel     || '';
  row[COL.SETOR]           = dados.setor           || '';
  row[COL.FATURAMENTO]     = dados.faturamento     || '';
  row[COL.FUNCIONARIOS]    = dados.funcionarios    || '';
  row[COL.IMD]             = dados.imd             || 0;
  row[COL.FAIXA]           = dados.faixa           || '';
  row[COL.SCORE_N]         = dados.scoresPorPilar?.N  || 0;
  row[COL.SCORE_T]         = dados.scoresPorPilar?.T  || 0;
  row[COL.SCORE_P]         = dados.scoresPorPilar?.P  || 0;
  row[COL.SCORE_G]         = dados.scoresPorPilar?.G  || 0;
  row[COL.SCORE_IA]        = dados.scoresPorPilar?.IA || 0;
  row[COL.SCORES_JSON]     = JSON.stringify(dados.scores     || {});
  row[COL.RESULTADOS_JSON] = JSON.stringify(dados.resultados || {});

  sheet.appendRow(row);
  return id;
}

function buscarTodosAssessments() {
  const sheet  = _getSheet(SHEET_NAME_ASSESSMENTS);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1).map(_rowToObj).filter(r => r.id);
}

function buscarAssessmentsPorEmpresa(empresa) {
  return buscarTodosAssessments().filter(
    a => a.empresa.toLowerCase() === empresa.toLowerCase()
  );
}

function buscarAssessmentPorIdInterno(id) {
  return buscarTodosAssessments().find(a => a.id === id) || null;
}

function deletarAssessmentPorId(id) {
  const sheet  = _getSheet(SHEET_NAME_ASSESSMENTS);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][COL.ID] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function listarEmpresasUnicas() {
  const todos    = buscarTodosAssessments();
  const empresas = [...new Set(todos.map(a => a.empresa))].sort();
  return empresas.map(e => ({
    nome:    e,
    total:   todos.filter(a => a.empresa === e).length,
    ultimo:  todos.filter(a => a.empresa === e).sort((x, y) => y.dataHora.localeCompare(x.dataHora))[0]?.dataHora || '',
    ultimoImd: todos.filter(a => a.empresa === e).sort((x, y) => y.dataHora.localeCompare(x.dataHora))[0]?.imd || 0,
  }));
}

// ---- Config (chave/valor) ----

function getConfig(chave) {
  const sheet  = _getSheet(SHEET_NAME_CONFIG);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === chave) return values[i][1];
  }
  return null;
}

function setConfig(chave, valor) {
  const sheet  = _getSheet(SHEET_NAME_CONFIG);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === chave) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[valor, new Date().toISOString()]]);
      return;
    }
  }
  sheet.appendRow([chave, valor, new Date().toISOString()]);
}

// ---- Setup inicial ----

/**
 * Execute esta função UMA VEZ manualmente pelo editor GAS para criar a planilha.
 * Depois copie o ID gerado para a propriedade SPREADSHEET_ID do script.
 */
function setupPlanilha() {
  const ss = SpreadsheetApp.create('Assessment Nexus — Dados');
  const id = ss.getId();

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
  console.log('Planilha criada. ID:', id);
  console.log('URL:', ss.getUrl());

  // Renomear aba padrão e criar aba Config
  ss.getSheets()[0].setName(SHEET_NAME_ASSESSMENTS);
  _initHeadersAssessments(ss.getSheets()[0]);

  const configSheet = ss.insertSheet(SHEET_NAME_CONFIG);
  _initHeadersConfig(configSheet);

  setConfig('versao_app', '1.0.0');
  setConfig('criado_em', new Date().toISOString());

  return { id, url: ss.getUrl() };
}

// ---- Helpers internos ----

function _gerarId() {
  return Utilities.getUuid();
}

function _rowToObj(row) {
  let scores     = {};
  let resultados = {};
  try { scores     = JSON.parse(row[COL.SCORES_JSON]     || '{}'); } catch (_) {}
  try { resultados = JSON.parse(row[COL.RESULTADOS_JSON] || '{}'); } catch (_) {}

  return {
    id:          row[COL.ID],
    dataHora:    row[COL.DATA_HORA],
    empresa:     row[COL.EMPRESA],
    responsavel: row[COL.RESPONSAVEL],
    setor:       row[COL.SETOR],
    faturamento: row[COL.FATURAMENTO],
    funcionarios: row[COL.FUNCIONARIOS],
    imd:         Number(row[COL.IMD]) || 0,
    faixa:       row[COL.FAIXA],
    scoresPorPilar: {
      N:  Number(row[COL.SCORE_N])  || 0,
      T:  Number(row[COL.SCORE_T])  || 0,
      P:  Number(row[COL.SCORE_P])  || 0,
      G:  Number(row[COL.SCORE_G])  || 0,
      IA: Number(row[COL.SCORE_IA]) || 0,
    },
    scores,
    resultados,
  };
}
