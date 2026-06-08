// ============================================================
// IA.gs — Integração com Claude API  v2.0
// Modelo: claude-sonnet-4-6
// Grounding: todos os dados do assessment são injetados no prompt.
// O modelo é proibido de usar qualquer informação fora dos dados fornecidos.
// ============================================================

const CLAUDE_API_URL    = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL      = 'claude-sonnet-4-6';
const CLAUDE_MAX_TOKENS = 2500;

// ── System Prompt — regras absolutas para todos os outputs ───────────────
// Este prompt é enviado no parâmetro "system" (separado do "user"),
// o que faz o Claude tratar as regras com prioridade máxima.
const SYSTEM_PROMPT = `Você é um analista sênior de maturidade digital da Nexus Consultoria.
Sua função é interpretar dados de assessments IMD e gerar documentos que provocam decisões — não relatórios que ficam em gavetas.

REGRAS ABSOLUTAS DE CONTEÚDO — qualquer violação invalida a resposta:

1. USE EXCLUSIVAMENTE os dados do assessment fornecidos no prompt do usuário.
   Não invente scores, percentuais, tendências ou fatos que não estejam nos dados.

2. NÃO mencione ferramentas, softwares, fornecedores ou empresas específicas
   (ex: SAP, Salesforce, AWS, OpenAI) a menos que o consultor tenha registrado
   isso explicitamente nas observações do assessment.

3. CADA diagnóstico ou recomendação deve referenciar a dimensão ou pilar de origem
   com seu score. Exemplo correto: "A dimensão T4 — Segurança e LGPD (score 1,8/5)
   indica ausência de controles básicos de acesso."

4. SE um dado relevante não estiver disponível no assessment, escreva
   "dado não coletado neste assessment" — NUNCA invente ou estime.

5. NÃO faça comparações com o mercado, concorrentes ou médias do setor
   a menos que esses dados estejam explicitamente no assessment.

6. NÃO invente planos de ação, cronogramas ou investimentos baseados em suposições.
   Todas as recomendações devem derivar de um score abaixo de 3,0 em alguma dimensão.

REGRAS ABSOLUTAS DE TOM E ESTILO — para todos os documentos:

7. Escreva para o CEO, não para o consultor.
   O CEO tem 5 minutos. Cada parágrafo precisa ganhar o direito de ser lido.
   Se uma frase não muda uma decisão ou não provoca uma reação, corte-a.

8. PROIBIDO usar estas expressões (são genéricas e não dizem nada):
   "é fundamental", "é essencial", "é importante", "recomendamos fortemente",
   "é necessário", "deve-se considerar", "de forma estratégica", "agregar valor",
   "transformação digital", "ecossistema", "sinergia", "melhores práticas".

9. USE linguagem direta e provocadora:
   - Substitua "há oportunidades de melhoria em processos" por
     "a operação depende de 2 pessoas. Se elas saírem, a empresa para."
   - Substitua "recomendamos investir em segurança" por
     "um ex-funcionário demitido amanhã ainda tem acesso aos sistemas."
   - Traduza scores em consequências reais de negócio, não em conceitos.

10. ESTRUTURA de frase preferida: [Fato dos dados] → [Consequência concreta].
    Exemplo: "G2 tem score 1,4/5 — isso significa que a empresa não sabe
    quais cláusulas contratuais não consegue defender se questionadas."

11. Comece o documento com a informação mais impactante, nunca com apresentação.
    CEOs param de ler se o primeiro parágrafo for introdução.`;

// ── Handlers públicos ─────────────────────────────────────────────────────

function gerarResumoExecutivo(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);
  const prompt    = _buildPromptResumo(assessment);
  const resultado = _chamarClaude(SYSTEM_PROMPT, prompt);
  // Persiste o resumo na planilha para consulta futura
  try { salvarResumoIA(assessmentId, resultado.texto); } catch (_) {}
  return resultado;
}

function gerarProposta(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);
  const prompt = _buildPromptProposta(assessment);
  return _chamarClaude(SYSTEM_PROMPT, prompt);
}

function gerarRoadmap(assessmentId) {
  const assessment = buscarAssessmentPorIdInterno(assessmentId);
  if (!assessment) throw new Error('Assessment não encontrado: ' + assessmentId);
  const prompt = _buildPromptRoadmap(assessment);
  return _chamarClaude(SYSTEM_PROMPT, prompt);
}

// ── Bloco de dados do assessment (injetado em todos os prompts) ───────────
// Centralizar aqui garante que nenhum prompt omita dados críticos.

function _buildContextoAssessment(a) {
  const pilares = {
    N:  'Visão Estratégica do Negócio',
    T:  'Tecnologia',
    P:  'Processos',
    G:  'Governança',
    IA: 'Inteligência Artificial',
  };

  // Scores por pilar (escala 20–100)
  const scoresPilarTexto = Object.entries(a.scoresPorPilar)
    .map(([p, s]) => {
      const nome  = pilares[p] || p;
      const val   = s ? s.toFixed(1) : 'não avaliado';
      const nivel = s ? (s / 20).toFixed(1) : '—';
      return `  • ${p} — ${nome}: ${val}/100 (nível ${nivel}/5)`;
    })
    .join('\n');

  // Scores por dimensão (escala 1–5)
  let scoresDimensaoTexto = '';
  if (a.scores && typeof a.scores === 'object') {
    scoresDimensaoTexto = Object.entries(a.scores)
      .filter(([, v]) => v && !v.na && v.score !== null)
      .map(([id, v]) => {
        const obs = v.obs ? ` | Obs. consultor: "${v.obs}"` : '';
        return `  • ${id}: ${v.score}/5${obs}`;
      })
      .join('\n');
  }

  return `=== DADOS DO ASSESSMENT ===
Empresa:      ${a.empresa}
Setor:        ${a.setor}
Responsável:  ${a.responsavel || 'não informado'}
Faturamento:  ${a.faturamento || 'não informado'}
Funcionários: ${a.funcionarios || 'não informado'}
Data:         ${a.dataHora ? a.dataHora.substring(0, 10) : 'não informado'}

IMD GERAL: ${a.imd}/100 — Faixa: ${a.faixa ? a.faixa.nome : a.faixa || '—'}

SCORES POR PILAR (escala 20–100 | nível 1–5):
${scoresPilarTexto}

SCORES POR DIMENSÃO (escala 1–5):
${scoresDimensaoTexto || '  (detalhamento por dimensão não disponível)'}
=== FIM DOS DADOS ===`;
}

// ── Builders de prompt ────────────────────────────────────────────────────

function _buildPromptResumo(a) {
  const ctx = _buildContextoAssessment(a);

  // Pré-calcula as dimensões críticas para ajudar o modelo a focar
  const criticas = a.scores
    ? Object.entries(a.scores)
        .filter(([, v]) => v && !v.na && v.score !== null && v.score <= 2)
        .sort(([, a], [, b]) => (a.score || 5) - (b.score || 5))
        .slice(0, 3)
        .map(([id, v]) => `${id} (score ${v.score}/5)`)
        .join(', ')
    : 'não disponível';

  const fortes = a.scores
    ? Object.entries(a.scores)
        .filter(([, v]) => v && !v.na && v.score !== null && v.score >= 3.5)
        .sort(([, a], [, b]) => (b.score || 0) - (a.score || 0))
        .slice(0, 3)
        .map(([id, v]) => `${id} (score ${v.score}/5)`)
        .join(', ')
    : 'não disponível';

  return `${ctx}

Dimensões críticas identificadas (score ≤ 2,0): ${criticas || 'nenhuma abaixo de 2,0'}
Dimensões mais fortes (score ≥ 3,5): ${fortes || 'nenhuma acima de 3,5'}

TAREFA: Gere um Resumo Executivo de Maturidade Digital escrito DIRETAMENTE para o CEO da empresa.
Este documento será o primeiro que o CEO vai ler. Ele precisa provocar uma reação, não ser arquivado.

ESTRUTURA OBRIGATÓRIA — use exatamente estes títulos e siga as instruções de cada seção:

## O que os dados revelam sobre ${a.empresa}
Comece com a constatação mais impactante que os dados mostram — não com o IMD.
Apresente o IMD (${a.imd}/100 — ${a.faixa ? a.faixa.nome : a.faixa}) apenas como contexto, não como abertura.
Este parágrafo deve fazer o CEO pensar "eu não tinha visto dessa forma."
Máximo 4 frases. Cada frase deve ser um fato dos dados ou uma consequência direta dele.

## Os 3 riscos que merecem atenção imediata
Escolha as 3 dimensões com score mais baixo. Para cada uma:
- **[ID — Nome da dimensão] — score X/5**
  Uma frase descrevendo o risco em linguagem de negócio (não técnica).
  Não escreva "há oportunidade de melhoria." Escreva o que pode dar errado se nada mudar.
  Exemplo do formato esperado: "Com score 1,4, a empresa não tem visibilidade de quem acessa
  o quê nos sistemas — um funcionário demitido pode continuar com acesso por semanas."

## O que já funciona e merece proteção
Liste 2 ou 3 dimensões com score ≥ 3,0 (as mais altas disponíveis).
Para cada uma, explique por que isso é um ativo que não pode ser perdido durante mudanças.
Se não houver nenhuma acima de 3,0, escreva: "Nenhuma dimensão atingiu patamar de solidez
neste assessment — a prioridade é estabilização antes de evolução."

## As 3 próximas decisões (não tarefas)
Não liste atividades. Liste DECISÕES que o CEO precisa tomar nos próximos 60 dias.
Cada decisão deve:
- Ser vinculada a uma dimensão específica com seu score
- Ter consequência clara se adiada
- Caber em uma frase
Formato: "Decisão 1: [o que decidir] — porque [dimensão X, score Y/5] indica [risco concreto]."

RESTRIÇÕES FINAIS:
- Máximo 500 palavras no total.
- Zero jargão de consultoria. Zero frases genéricas.
- Se uma frase não tiver dado do assessment como âncora, corte-a.
- Tom: direto, respeitoso, sem alarmismo desnecessário — mas sem suavizar riscos reais.`;
}

function _buildPromptProposta(a) {
  const ctx = _buildContextoAssessment(a);

  // Identifica as 3 dimensões com pior score para construir o escopo
  const dimensoesOrdenadas = a.scores
    ? Object.entries(a.scores)
        .filter(([, v]) => v && !v.na && v.score !== null)
        .sort(([, a], [, b]) => (a.score || 5) - (b.score || 5))
        .slice(0, 5)
        .map(([id, v]) => `${id} (score ${v.score}/5)`)
        .join(', ')
    : 'dados de dimensão não disponíveis';

  return `${ctx}

As 5 dimensões com pior score identificadas: ${dimensoesOrdenadas}

TAREFA: Gere uma Proposta Comercial de Consultoria estruturada para esta empresa.

ESTRUTURA OBRIGATÓRIA:

## Contexto e Diagnóstico
1 parágrafo resumindo o IMD e as principais oportunidades identificadas.
Baseie-se nos dados acima — não acrescente contexto externo.

## Escopo Proposto — 3 Frentes
Para cada frente:
- Nome da frente (derivado de uma lacuna real identificada)
- Dimensões que endereça (citar IDs e scores)
- Entregáveis concretos (mínimo 3 por frente)
- Duração estimada (semanas)

## Cronograma Macro
Tabela simples: Frente | Semana Início | Semana Fim | Responsável Nexus

## Premissas e Exclusões
O que está incluído e o que não está, baseado no escopo definido.

RESTRIÇÕES:
- Máximo 600 palavras.
- Não inclua valores ou preços — isso é definido em reunião.
- Não cite ferramentas ou fornecedores específicos.
- Cada frente deve referenciar dimensões reais do assessment com seus scores.`;
}

function _buildPromptRoadmap(a) {
  const ctx = _buildContextoAssessment(a);

  return `${ctx}

TAREFA: Gere um Roadmap de Evolução de Maturidade Digital para 12 meses.

ESTRUTURA OBRIGATÓRIA:

## Ponto de Partida
Síntese do estado atual: IMD ${a.imd}/100, faixa "${a.faixa ? a.faixa.nome : a.faixa}",
os 2 pilares mais fortes e os 2 mais fracos com seus scores.

## Fase 1 — Estabilização (Mês 1 ao 3)
Foco: Quick wins e eliminação dos riscos críticos.
- Objetivos: (máx. 3, cada um vinculado a uma dimensão com score ≤ 2,0)
- Iniciativas: (ações concretas, não genéricas)
- Métrica de sucesso: (como saber que esta fase foi concluída com sucesso)

## Fase 2 — Evolução Estruturada (Mês 4 ao 8)
Foco: Consolidar processos e avançar nos pilares intermediários.
- Objetivos: (máx. 3, vinculados a dimensões com score entre 2,0 e 3,5)
- Iniciativas
- Métrica de sucesso

## Fase 3 — Consolidação e Alavancagem (Mês 9 ao 12)
Foco: IA, automação e melhoria contínua.
- Objetivos: (máx. 3, focados em elevar score IA e pilares já estruturados)
- Iniciativas
- Métrica de sucesso

## Score Alvo ao Final de 12 Meses
Para cada pilar, estime o score alvo realista (não otimista) baseado nas iniciativas
descritas acima. Formato: "N: 45 → 68 | T: 60 → 80 | ..."

RESTRIÇÕES:
- Máximo 700 palavras.
- Toda iniciativa deve referenciar uma dimensão específica com seu score atual.
- Não cite ferramentas ou fornecedores.
- Os scores alvo devem ser conservadores — não prometa mais de +25 pontos por pilar em 12 meses.`;
}

// ── Chamada à API Claude ──────────────────────────────────────────────────

/**
 * Chama a Claude API com system + user prompt separados.
 * O parâmetro "system" garante que as regras de grounding tenham
 * prioridade máxima — o modelo não pode ignorá-las via user prompt.
 *
 * @param {string} systemPrompt - Regras absolutas e persona
 * @param {string} userPrompt   - Dados do assessment + instrução de tarefa
 * @returns {{ texto: string }}
 */
function _chamarClaude(systemPrompt, userPrompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error(
      'CLAUDE_API_KEY não configurada. ' +
      'Acesse o editor GAS → Configurações do projeto → Propriedades do script → ' +
      'adicione a chave CLAUDE_API_KEY com o valor da sua chave da Anthropic.'
    );
  }

  const payload = {
    model:      CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system:     systemPrompt,          // ← persona + regras de grounding
    messages:   [{ role: 'user', content: userPrompt }],
  };

  const options = {
    method:      'post',
    contentType: 'application/json',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload:            JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(CLAUDE_API_URL, options);
  const code     = response.getResponseCode();
  const body     = JSON.parse(response.getContentText());

  if (code !== 200) {
    const msg = body.error ? body.error.message : JSON.stringify(body);
    throw new Error('Claude API — erro ' + code + ': ' + msg);
  }

  return {
    texto:          body.content[0].text,
    tokens_entrada: body.usage ? body.usage.input_tokens  : null,
    tokens_saida:   body.usage ? body.usage.output_tokens : null,
  };
}

// ── Função de teste — execute direto pelo editor GAS ─────────────────────
/**
 * COMO USAR:
 * 1. Abra o editor GAS
 * 2. Selecione "testarResumoExecutivo" no seletor de funções
 * 3. Clique em ▶ Executar
 * 4. Veja o resultado no painel "Registro de execução"
 *
 * Esta função usa dados simulados — não precisa de assessment salvo na planilha.
 * Útil para validar o prompt e a qualidade do output antes de testar com dados reais.
 */
function testarResumoExecutivo() {
  // Dados simulados de uma empresa real de serviços B2B
  const assessmentMock = {
    empresa:      'Distribuidora Forte Ltda',
    responsavel:  'Carlos Mendes',
    setor:        'servicos_b2b',
    faturamento:  'R$ 1,5M – R$ 5M',
    funcionarios: '20 – 100',
    dataHora:     new Date().toISOString(),
    imd:          41.2,
    faixa:        { nome: 'Em Desenvolvimento' },
    scoresPorPilar: {
      N:  52.0,
      T:  38.0,
      P:  44.0,
      G:  30.0,
      IA: 24.0,
    },
    scores: {
      // Pilar N — Negócio
      N1: { score: 3, na: false, obs: 'Margens conhecidas informalmente pelo dono' },
      N2: { score: 2, na: false, obs: '' },
      N3: { score: 3, na: false, obs: 'Vende por 3 canais mas sem métricas por canal' },
      N4: { score: 2, na: false, obs: 'Gargalos descobertos em reuniões, não em dashboards' },
      N5: { score: 2, na: false, obs: '' },
      N6: { score: 2, na: false, obs: 'NPS nunca medido. Churn percebido só quando cliente para de comprar' },
      // Pilar T — Tecnologia
      T1: { score: 2, na: false, obs: 'Servidor local sem backup automatizado. Já tiveram perda de dados em 2023' },
      T2: { score: 2, na: false, obs: 'ERP implantado há 2 anos, mas apenas 40% da equipe usa' },
      T3: { score: 1, na: false, obs: 'Sistemas não se comunicam. Dados inseridos manualmente em 3 sistemas' },
      T4: { score: 1, na: false, obs: 'Sem MFA. Ex-funcionários com acesso ativo descobertos na entrevista' },
      T5: { score: 2, na: false, obs: '' },
      T6: { score: 2, na: false, obs: '' },
      T7: { score: 1, na: false, obs: 'Faturamento no ERP não bate com o do financeiro. Diferença de R$30k/mês' },
      // Pilar P — Processos
      P1: { score: 2, na: false, obs: 'Processo comercial na cabeça do vendedor principal' },
      P2: { score: 3, na: false, obs: 'Fluxo de caixa atualizado semanalmente' },
      P3: { score: 2, na: false, obs: 'Atendimento por WhatsApp pessoal do dono' },
      P4: { score: 3, na: false, obs: '' },
      P5: { score: 2, na: false, obs: '' },
      P6: { score: 2, na: false, obs: '' },
      P7: { score: 2, na: false, obs: 'Turnover de 40% ao ano. Nenhum processo de onboarding documentado' },
      // Pilar G — Governança
      G1: { score: 2, na: false, obs: 'Todas as decisões passam pelo sócio fundador' },
      G2: { score: 1, na: false, obs: 'Contratos com clientes sem revisão jurídica desde 2020' },
      G3: { score: 1, na: false, obs: 'Sem plano de continuidade. Não sabem o que fariam se o servidor caísse' },
      G4: { score: 1, na: false, obs: 'Credenciais de sistemas compartilhadas por WhatsApp entre a equipe' },
      G5: { score: 2, na: false, obs: '' },
      G6: { score: 2, na: false, obs: 'Sem monitoramento de reputação online. 2 reviews negativas sem resposta no Google' },
      // Pilar IA — Inteligência Artificial
      IA1: { score: 1, na: false, obs: 'Atendimento 100% manual. Sem nenhuma automação' },
      IA2: { score: 1, na: false, obs: 'Equipe de vendas não usa IA. Propostas feitas no Word manualmente' },
      IA3: { score: 1, na: false, obs: '' },
      IA4: { score: 1, na: false, obs: 'Sem BI. Relatórios gerados em Excel uma vez por mês' },
      IA5: { score: 2, na: false, obs: '' },
      IA6: { score: 1, na: false, obs: 'IA não está no radar da liderança. Sem budget, sem estratégia' },
      IA7: { score: 1, na: false, obs: 'RH manual. Turnover alto sem análise de causa' },
    },
  };

  console.log('=== INICIANDO TESTE DE RESUMO EXECUTIVO ===');
  console.log('Empresa:', assessmentMock.empresa);
  console.log('IMD:', assessmentMock.imd, '|', assessmentMock.faixa.nome);
  console.log('---');

  try {
    const prompt = _buildPromptResumo(assessmentMock);

    console.log('--- PROMPT ENVIADO AO CLAUDE (primeiros 500 chars) ---');
    console.log(prompt.substring(0, 500) + '...');
    console.log('---');

    const resultado = _chamarClaude(SYSTEM_PROMPT, prompt);

    console.log('=== RESUMO EXECUTIVO GERADO ===');
    console.log(resultado.texto);
    console.log('---');
    console.log('Tokens entrada:', resultado.tokens_entrada);
    console.log('Tokens saída:', resultado.tokens_saida);
    console.log('=== FIM DO TESTE ===');

    return resultado;
  } catch (e) {
    console.error('ERRO:', e.message);
    throw e;
  }
}

/**
 * Teste com assessment REAL salvo na planilha.
 * Selecione esta função no editor e clique em ▶ Executar.
 */
function testarResumoComDadosReais() {
  const ID_REAL = 'c7b3ab7b-6d7c-40ed-a6bd-bcf50877d563';

  console.log('=== TESTE COM DADOS REAIS ===');
  console.log('ID:', ID_REAL);

  try {
    // Busca o assessment direto da planilha
    const assessment = buscarAssessmentPorIdInterno(ID_REAL);
    if (!assessment) {
      console.error('Assessment não encontrado na planilha. Verifique o ID.');
      return;
    }

    console.log('Empresa:', assessment.empresa);
    console.log('IMD:', assessment.imd, '|', assessment.faixa || '—');
    console.log('Scores por pilar:', JSON.stringify(assessment.scoresPorPilar));
    console.log('--- GERANDO RESUMO COM CLAUDE ---');

    const resultado = gerarResumoExecutivo(ID_REAL);

    console.log('');
    console.log('════════════════════════════════════════');
    console.log('RESUMO EXECUTIVO — ' + assessment.empresa);
    console.log('════════════════════════════════════════');
    console.log(resultado.texto);
    console.log('════════════════════════════════════════');
    console.log('Tokens entrada:', resultado.tokens_entrada);
    console.log('Tokens saída  :', resultado.tokens_saida);

    return resultado;
  } catch (e) {
    console.error('ERRO:', e.message);
    throw e;
  }
}
