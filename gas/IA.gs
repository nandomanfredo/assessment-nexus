// ============================================================
// IA.gs — Integração com Claude API (Phase 2)
// ============================================================

const CLAUDE_API_URL   = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL     = 'claude-sonnet-4-20250514';
const CLAUDE_MAX_TOKENS = 2000;

function gerarResumoExecutivo(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);

  const prompt = _buildPromptResumo(assessment);
  return _chamarClaude(prompt);
}

function gerarProposta(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);

  const prompt = _buildPromptProposta(assessment);
  return _chamarClaude(prompt);
}

function gerarRoadmap(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);

  const prompt = _buildPromptRoadmap(assessment);
  return _chamarClaude(prompt);
}

// ---- Builders de prompt ----

function _buildPromptResumo(a) {
  return `Você é um consultor sênior de transformação digital da Nexus Consultoria.

Analise o assessment de maturidade digital da empresa "${a.empresa}" (setor: ${a.setor}) e elabore um resumo executivo em português brasileiro com:
1. Diagnóstico geral do IMD (${a.imd} — ${a.faixa.nome})
2. Principais pontos fortes (pilares com score > 65)
3. Principais lacunas críticas (pilares com score < 50)
4. Recomendação estratégica de curto prazo (3-6 meses)

Scores por pilar:
${Object.entries(a.scoresPorPilar).map(([p, s]) => `- ${p}: ${s?.toFixed(1) || 'N/A'}`).join('\n')}

Seja objetivo e prático. Máximo 400 palavras.`;
}

function _buildPromptProposta(a) {
  return `Você é um consultor sênior de transformação digital da Nexus Consultoria.

Com base no assessment da empresa "${a.empresa}" (IMD: ${a.imd} — ${a.faixa.nome}), elabore uma proposta comercial estruturada em português com:
1. Escopo proposto de serviços (3 frentes prioritárias)
2. Metodologia e entregáveis por frente
3. Cronograma estimado (semanas)
4. Investimento estimado (ranges por frente, baseado em complexidade)

Scores por pilar: ${JSON.stringify(a.scoresPorPilar)}
Faturamento: ${a.faturamento} | Funcionários: ${a.funcionarios}

Tom: profissional, consultivo, orientado a resultados. Máximo 600 palavras.`;
}

function _buildPromptRoadmap(a) {
  return `Você é um especialista em transformação digital da Nexus Consultoria.

Crie um roadmap de evolução de maturidade digital em português para "${a.empresa}" com horizonte de 12 meses dividido em:
- Fase 1 (M1-M3): Estabilização e quick wins
- Fase 2 (M4-M8): Evolução estruturada
- Fase 3 (M9-M12): Consolidação e inovação

Para cada fase liste: objetivos, iniciativas concretas e métricas de sucesso.

IMD atual: ${a.imd} (${a.faixa.nome})
Scores: ${JSON.stringify(a.scoresPorPilar)}
Setor: ${a.setor}

Máximo 700 palavras.`;
}

// ---- Chamada à API Claude ----

function _chamarClaude(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) throw new Error('CLAUDE_API_KEY não configurada nas propriedades do script.');

  const options = {
    method:      'post',
    contentType: 'application/json',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      messages:   [{ role: 'user', content: prompt }],
    }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(CLAUDE_API_URL, options);
  const code     = response.getResponseCode();
  const body     = JSON.parse(response.getContentText());

  if (code !== 200) {
    throw new Error('Claude API erro ' + code + ': ' + JSON.stringify(body));
  }

  return { texto: body.content[0].text };
}
