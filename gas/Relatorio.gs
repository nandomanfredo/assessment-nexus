// ============================================================
// Relatorio.gs — Geração de Relatório no Google Docs
// Usa PerfilMaturidade.gs + dados do assessment para montar
// um relatório executivo completo em Google Docs.
// ============================================================

const DOC_FOLDER_NAME = 'Assessment Nexus — Relatórios';

// Handler chamado pelo Code.gs
function gerarRelatorio(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);

  const docId = _criarDocRelatorio(assessment);
  const url   = DriveApp.getFileById(docId).getUrl();
  return { docId, url };
}

// ── Builder principal ────────────────────────────────────

function _criarDocRelatorio(a) {
  // Classificar perfil de maturidade
  const scoresPerfil = {
    neg:  (a.scoresPorPilar.N  || 20) / 20,
    tec:  (a.scoresPorPilar.T  || 20) / 20,
    proc: (a.scoresPorPilar.P  || 20) / 20,
    gov:  (a.scoresPorPilar.G  || 20) / 20,
    ia:   (a.scoresPorPilar.IA || 20) / 20,
  };
  const resultado    = classificarPerfil(scoresPerfil, Math.round(a.imd));
  const textoRelat   = gerarTextoRelatorio(resultado);

  // Criar documento
  const titulo = 'Relatório IMD — ' + (a.empresa || 'Empresa') + ' — ' + _formatarData(a.dataHora);
  const doc    = DocumentApp.create(titulo);
  const body   = doc.getBody();

  _moverParaPasta(doc.getId());
  _estilosBasicos(doc);
  body.clear();

  // ── Cabeçalho ────────────────────────────────────────
  _addTitulo(body, 'Relatório de Maturidade Digital');
  _addSubtitulo(body, (a.empresa || 'Empresa') + ' · ' + _formatarData(a.dataHora));
  _addSeparador(body);

  // ── Dados da empresa ─────────────────────────────────
  _addHeading(body, '1. Dados da Empresa');
  const tabelaEmpresa = body.appendTable([
    ['Empresa',        a.empresa     || '—'],
    ['Responsável',    a.responsavel || '—'],
    ['Setor',          a.setor       || '—'],
    ['Faturamento',    a.faturamento || '—'],
    ['Nº Funcionários', a.funcionarios || '—'],
    ['Data',           _formatarData(a.dataHora)],
  ]);
  _estilizarTabelaSimples(tabelaEmpresa);

  // ── Score IMD ────────────────────────────────────────
  _addHeading(body, '2. Resultado IMD');

  const tabelaIMD = body.appendTable([
    ['IMD Consolidado', String(Math.round(a.imd)) + ' / 100'],
    ['Classificação',   a.faixa],
    ['Perfil',          textoRelat.titulo],
    ['Urgência',        textoRelat.urgencia],
  ]);
  _estilizarTabelaIMD(tabelaIMD, a.imd);
  body.appendParagraph('');

  // Scores por pilar
  body.appendParagraph('Scores por Pilar:').setHeading(DocumentApp.ParagraphHeading.NORMAL).setBold(true);
  const linhasPilares = [['Pilar', 'Score', 'Nível']];
  const nomePilares   = { N: 'Negócio (15%)', T: 'Tecnologia (25%)', P: 'Processos (25%)', G: 'Governança (15%)', IA: 'Int. Artificial (20%)' };
  Object.entries(a.scoresPorPilar).forEach(function([pilar, score]) {
    const nivel = score >= 84 ? 'Otimizado' : score >= 68 ? 'Gerenciado' : score >= 52 ? 'Estruturado' : score >= 36 ? 'Básico' : 'Caótico';
    linhasPilares.push([nomePilares[pilar] || pilar, String(Math.round(score || 0)), nivel]);
  });
  const tabelaPilares = body.appendTable(linhasPilares);
  _estilizarTabelaComCabecalho(tabelaPilares);

  // ── Perfil de Maturidade ─────────────────────────────
  _addHeading(body, '3. Perfil de Maturidade Digital');

  _addParagrafo(body, textoRelat.narrativa);

  if (textoRelat.assimetria) {
    body.appendParagraph('Assimetria identificada:').setHeading(DocumentApp.ParagraphHeading.NORMAL).setBold(true);
    _addParagrafo(body, textoRelat.insight);
  }

  if (textoRelat.temSecundario) {
    _addParagrafo(body, 'Traços secundários identificados: ' + textoRelat.perfilSecundario);
  }

  // Sinais confirmados
  body.appendParagraph('Sinais Identificados:').setHeading(DocumentApp.ParagraphHeading.NORMAL).setBold(true);
  textoRelat.sinais.forEach(function(sinal) {
    const p = body.appendListItem('✓ ' + sinal);
    p.setGlyphType(DocumentApp.GlyphType.BULLET);
  });

  // ── Risco e Recomendação ─────────────────────────────
  _addHeading(body, '4. Risco Principal e Recomendação');

  body.appendParagraph('Risco Principal:').setHeading(DocumentApp.ParagraphHeading.NORMAL).setBold(true);
  _addParagrafo(body, textoRelat.risco);

  body.appendParagraph('Recomendação Estratégica:').setHeading(DocumentApp.ParagraphHeading.NORMAL).setBold(true);
  _addParagrafo(body, textoRelat.recomendacao);

  // ── Análise de Gaps ──────────────────────────────────
  _addHeading(body, '5. Análise de Gaps');

  const linhasGaps = [['Dimensão', 'Pilar', 'Score', 'Gap']];
  const scores     = a.scores || {};
  Object.entries(scores).forEach(function([dimId, s]) {
    if (!s || s.na || !s.score) return;
    const gap = 5 - s.score;
    if (gap > 0) linhasGaps.push([dimId, dimId.replace(/\d/, ''), String(s.score), String(gap) + ' pontos']);
  });

  if (linhasGaps.length > 1) {
    const tabelaGaps = body.appendTable(linhasGaps);
    _estilizarTabelaComCabecalho(tabelaGaps);
  } else {
    _addParagrafo(body, 'Nenhum gap registrado.');
  }

  // ── Rodapé do documento ──────────────────────────────
  body.appendParagraph('');
  _addSeparador(body);
  const rodape = body.appendParagraph('Gerado por Assessment Nexus · Nexus Consultoria · ' + _formatarData(new Date().toISOString()));
  rodape.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  rodape.setForegroundColor('#9CA3AF');
  rodape.setFontSize(9);

  doc.saveAndClose();
  return doc.getId();
}

// ── Estilização ───────────────────────────────────────────

function _estilosBasicos(doc) {
  const styles = {};
  styles[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  styles[DocumentApp.Attribute.FONT_SIZE]   = 10;
  doc.getBody().setAttributes(styles);
}

function _addTitulo(body, texto) {
  const p = body.appendParagraph(texto);
  p.setHeading(DocumentApp.ParagraphHeading.TITLE);
  p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function _addSubtitulo(body, texto) {
  const p = body.appendParagraph(texto);
  p.setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
  p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function _addHeading(body, texto) {
  body.appendParagraph('').setHeading(DocumentApp.ParagraphHeading.NORMAL);
  const p = body.appendParagraph(texto);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
}

function _addParagrafo(body, texto) {
  const p = body.appendParagraph(texto);
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  p.setLineSpacing(1.5);
}

function _addSeparador(body) {
  body.appendHorizontalRule();
}

function _estilizarTabelaSimples(tabela) {
  const nLinhas = tabela.getNumRows();
  for (let i = 0; i < nLinhas; i++) {
    const row = tabela.getRow(i);
    const cel0 = row.getCell(0);
    cel0.setBold(true);
    cel0.setBackgroundColor('#F3F4F6');
    cel0.setPaddingTop(5); cel0.setPaddingBottom(5);
    cel0.setPaddingLeft(8); cel0.setPaddingRight(8);
    row.getCell(1).setPaddingTop(5); row.getCell(1).setPaddingBottom(5);
    row.getCell(1).setPaddingLeft(8); row.getCell(1).setPaddingRight(8);
  }
}

function _estilizarTabelaIMD(tabela, imd) {
  const cor = imd >= 85 ? '#9B6DD4' : imd >= 70 ? '#3B8BD4' : imd >= 55 ? '#1D9E75' : imd >= 40 ? '#BA7517' : '#E24B4A';
  const nLinhas = tabela.getNumRows();
  for (let i = 0; i < nLinhas; i++) {
    const row  = tabela.getRow(i);
    const cel0 = row.getCell(0);
    cel0.setBold(true);
    cel0.setBackgroundColor('#F3F4F6');
    cel0.setPaddingTop(5); cel0.setPaddingBottom(5);
    cel0.setPaddingLeft(8); cel0.setPaddingRight(8);
    row.getCell(1).setPaddingTop(5); row.getCell(1).setPaddingBottom(5);
    row.getCell(1).setPaddingLeft(8); row.getCell(1).setPaddingRight(8);
    // Destaca linha do IMD
    if (row.getCell(0).getText() === 'IMD Consolidado') {
      row.getCell(1).setForegroundColor(cor).setBold(true).setFontSize(14);
    }
  }
}

function _estilizarTabelaComCabecalho(tabela) {
  const headerRow = tabela.getRow(0);
  for (let j = 0; j < headerRow.getNumCells(); j++) {
    const cel = headerRow.getCell(j);
    cel.setBold(true);
    cel.setBackgroundColor('#2D3748');
    cel.setForegroundColor('#FFFFFF');
    cel.setPaddingTop(6); cel.setPaddingBottom(6);
    cel.setPaddingLeft(8); cel.setPaddingRight(8);
  }
  for (let i = 1; i < tabela.getNumRows(); i++) {
    const bg = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
    for (let j = 0; j < tabela.getRow(i).getNumCells(); j++) {
      const cel = tabela.getRow(i).getCell(j);
      cel.setBackgroundColor(bg);
      cel.setPaddingTop(5); cel.setPaddingBottom(5);
      cel.setPaddingLeft(8); cel.setPaddingRight(8);
    }
  }
}

// ── Utilitários ───────────────────────────────────────────

function _formatarData(iso) {
  try {
    const d = new Date(iso);
    return Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
  } catch (_) {
    return iso || '—';
  }
}

function _moverParaPasta(docId) {
  try {
    const pastas = DriveApp.getFoldersByName(DOC_FOLDER_NAME);
    const pasta  = pastas.hasNext() ? pastas.next() : DriveApp.createFolder(DOC_FOLDER_NAME);
    const file   = DriveApp.getFileById(docId);
    pasta.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  } catch (e) {
    console.warn('Não foi possível mover o arquivo para a pasta:', e.message);
  }
}
