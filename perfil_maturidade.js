/**
 * ============================================================
 * ASSESSMENT NEXUS — Algoritmo de Perfil de Maturidade
 * Arquivo: perfil_maturidade.js
 * Versão: 1.0
 *
 * COMO USAR NO PROJETO:
 * 1. Copie este arquivo para:
 *    C:\Users\fernando.oliveira\Downloads\Assessment Nexus\
 * 2. Importe no app.js:
 *    const { classificarPerfil, gerarCardPerfil } = require('./perfil_maturidade');
 * 3. No AppScript (Code.gs), copie as funções classificarPerfil() e
 *    getPerfilDefinitions() — o resto é frontend.
 *
 * FLUXO DE USO:
 *   const scores = { neg: 3.2, tec: 4.1, proc: 2.8, gov: 1.9, ia: 1.5 };
 *   const imd = 58;
 *   const resultado = classificarPerfil(scores, imd);
 *   // resultado.perfil  → objeto completo do perfil
 *   // resultado.html    → HTML pronto para injetar no dashboard
 * ============================================================
 */

'use strict';

// ── CONSTANTES ──────────────────────────────────────────────────────────
const PILAR_PESOS = { neg: 0.15, tec: 0.25, proc: 0.25, gov: 0.15, ia: 0.20 };

const NIVEL_LABELS = {
  1: 'Caótico',
  2: 'Básico',
  3: 'Estruturado',
  4: 'Gerenciado',
  5: 'Otimizado',
};

// ── DEFINIÇÕES DOS PERFIS ────────────────────────────────────────────────
/**
 * Cada perfil tem:
 * - id          → identificador único
 * - nome        → nome do perfil (exibido ao CEO)
 * - icone       → emoji representativo
 * - cor         → cor primária do perfil
 * - corLight    → cor de fundo suave
 * - imdMin/Max  → faixa típica de IMD (orientativa, não determinística)
 * - descricao   → frase curta para o card
 * - narrativa   → parágrafo para o relatório executivo
 * - sinais      → lista de sinais que caracterizam o perfil
 * - risco       → risco principal descrito em linguagem executiva
 * - recomendacao→ recomendação principal
 * - urgencia    → nível de urgência de ação
 * - regras      → critérios de classificação (usados pelo algoritmo)
 *   Cada regra tem: pilar, operador, valor, peso
 *   Operadores: 'lt' (<), 'lte' (<=), 'gt' (>), 'gte' (>=), 'between'
 */
function getPerfilDefinitions() {
  return [
    {
      id: 'negocio_em_risco',
      nome: 'Negócio em Risco',
      icone: '🚨',
      cor: '#E24B4A',
      corLight: '#FFF0F0',
      urgencia: 'Crítica',
      urgenciaCor: '#E24B4A',
      imdMin: 20,
      imdMax: 39,
      descricao: 'Todos os pilares críticos. Operação vulnerável e dependente de pessoas-chave.',
      narrativa: 'A empresa opera em modo de alto risco operacional. A ausência de processos documentados, sistemas integrados e indicadores de performance cria uma dependência crítica de pessoas-chave. Um único evento — saída de colaborador, incidente técnico ou mudança de mercado — pode comprometer a continuidade do negócio.',
      sinais: [
        'Operação depende de 1 a 2 pessoas-chave para funcionar',
        'Sistemas isolados ou inexistentes — gestão por planilhas e e-mail',
        'Processos não documentados e não repetíveis',
        'Sem indicadores ou métricas de performance',
        'Decisões tomadas por intuição, sem dados',
        'Alta exposição a riscos de segurança e LGPD',
      ],
      risco: 'A saída de uma pessoa-chave ou um incidente técnico pode paralisar a operação por dias ou semanas. Sem processos documentados e sistemas integrados, o negócio não escala e cada crise é resolvida de forma diferente, sem aprendizado acumulado.',
      recomendacao: 'Antes de qualquer automação ou IA, é fundamental construir a base: documentar os 3 processos mais críticos, implantar um sistema de gestão básico (ERP ou CRM) e criar um plano mínimo de contingência. O foco deve ser em resiliência, não em inovação.',
      // REGRAS: alta pontuação se todos os pilares forem baixos
      regras: [
        { pilar: 'neg',  operador: 'lte', valor: 2.0, peso: 2 },
        { pilar: 'tec',  operador: 'lte', valor: 2.0, peso: 2 },
        { pilar: 'proc', operador: 'lte', valor: 2.0, peso: 2 },
        { pilar: 'gov',  operador: 'lte', valor: 2.0, peso: 1 },
        { pilar: 'ia',   operador: 'lte', valor: 2.0, peso: 1 },
        // Penalidade se algum pilar for alto (não é este perfil)
        { pilar: 'tec',  operador: 'gte', valor: 3.5, peso: -3 },
        { pilar: 'proc', operador: 'gte', valor: 3.5, peso: -3 },
      ],
    },

    {
      id: 'em_construcao',
      nome: 'Em Construção',
      icone: '🏗️',
      cor: '#BA7517',
      corLight: '#FFF7E6',
      urgencia: 'Alta',
      urgenciaCor: '#BA7517',
      imdMin: 40,
      imdMax: 54,
      descricao: 'Base sendo formada. Investimentos feitos mas não totalmente aproveitados.',
      narrativa: 'A empresa fez investimentos em tecnologia e está estruturando seus processos, mas ainda não consegue extrair o valor completo dessas iniciativas. Existe um gap entre o que foi implantado e o que está sendo efetivamente utilizado. O maior risco é continuar investindo em novas ferramentas antes de consolidar as existentes.',
      sinais: [
        'ERP ou CRM implantado, mas com baixa adoção',
        'Processos existem mas não são seguidos consistentemente',
        'Algumas métricas acompanhadas, sem cadência regular',
        'Governança corporativa inexistente ou informal',
        'Integrações manuais entre sistemas apesar de ter tecnologia',
        'IA não está no radar da liderança',
      ],
      risco: 'O maior risco é o desperdício de investimentos já realizados. Sistemas foram adquiridos mas subutilizados. A empresa continua dependente de planilhas e processos manuais mesmo tendo sistemas capazes de automatizá-los.',
      recomendacao: 'Focar em adoção e não em aquisição. Antes de comprar novas ferramentas, extrair o máximo valor do que já existe. Definir KPIs mínimos por área, estabelecer uma rotina de gestão semanal e criar governança básica de TI.',
      regras: [
        { pilar: 'neg',  operador: 'between', valor: [1.5, 3.0], peso: 2 },
        { pilar: 'tec',  operador: 'between', valor: [1.5, 3.0], peso: 2 },
        { pilar: 'proc', operador: 'between', valor: [1.5, 3.0], peso: 2 },
        { pilar: 'gov',  operador: 'lte',     valor: 2.5,        peso: 1 },
        { pilar: 'ia',   operador: 'lte',     valor: 2.5,        peso: 1 },
        // Penalidade se os pilares forem muito baixos (é o perfil anterior)
        { pilar: 'tec',  operador: 'lte', valor: 1.5, peso: -2 },
        { pilar: 'proc', operador: 'lte', valor: 1.5, peso: -2 },
      ],
    },

    {
      id: 'tecnologia_forte_gestao_fraca',
      nome: 'Tecnologia Forte, Gestão Fraca',
      icone: '🔧',
      cor: '#1D9E75',
      corLight: '#E8F7F2',
      urgencia: 'Moderada',
      urgenciaCor: '#1D9E75',
      imdMin: 48,
      imdMax: 65,
      descricao: 'Infraestrutura avançada, mas processos e governança não acompanham o nível técnico.',
      narrativa: 'A empresa possui uma infraestrutura técnica sofisticada — cloud, sistemas modernos, integrações — mas a operação e a gestão não aproveitam esse potencial. Há um gap significativo entre o que a tecnologia permite e o que os processos e a governança entregam. Essa assimetria gera frustração no time de TI e desperdício de investimento.',
      sinais: [
        'Infraestrutura cloud bem estruturada',
        'Sistemas modernos implantados (ERP/CRM atualizados)',
        'Processos operacionais caóticos ou informais',
        'Governança de TI existe, mas governança corporativa é fraca',
        'TI resolve problemas que deveriam ser de processo',
        'Decisões de negócio sem dados mesmo com sistemas disponíveis',
      ],
      risco: 'Tecnologia sem processo é custo, não investimento. A empresa paga por ferramentas sofisticadas que são usadas como se fossem planilhas avançadas. O gap entre TI e negócio cria tensão organizacional e impede o ROI dos investimentos em tecnologia.',
      recomendacao: 'Mapear os processos críticos para aproveitar a tecnologia disponível. Criar um programa de capacitação para que as áreas de negócio usem os sistemas corretamente. Estabelecer governança corporativa básica e alinhar TI à estratégia.',
      regras: [
        // Score de tecnologia alto é o marcador principal
        { pilar: 'tec',  operador: 'gte',     valor: 3.8,        peso: 4 },
        // Processos e governança claramente abaixo da tecnologia
        { pilar: 'proc', operador: 'lte',     valor: 2.8,        peso: 3 },
        { pilar: 'gov',  operador: 'lte',     valor: 2.5,        peso: 2 },
        // IA moderada é ok para este perfil
        { pilar: 'ia',   operador: 'between', valor: [1.5, 3.5], peso: 1 },
        // Penalidade se proc também for alto (não é este perfil)
        { pilar: 'proc', operador: 'gte',     valor: 3.5,        peso: -3 },
      ],
    },

    {
      id: 'operacao_funcional',
      nome: 'Operação Funcional',
      icone: '⚙️',
      cor: '#3B8BD4',
      corLight: '#EBF4FF',
      urgencia: 'Moderada',
      urgenciaCor: '#3B8BD4',
      imdMin: 55,
      imdMax: 67,
      descricao: 'Processos e tecnologia sólidos. Cresce por esforço, não por sistema. IA ausente.',
      narrativa: 'A empresa tem uma operação funcional e previsível. Processos são seguidos, sistemas estão em uso e há métricas básicas. No entanto, o crescimento ainda depende de aumento de headcount em vez de automação e eficiência. A ausência de IA e automação avançada cria um teto de crescimento que se aproxima.',
      sinais: [
        'Processos documentados e razoavelmente seguidos',
        'Sistemas integrados na maioria das áreas',
        'KPIs básicos monitorados com cadência',
        'Governança corporativa iniciando',
        'IA inexistente ou usada de forma informal',
        'Crescimento requer contratar mais pessoas',
      ],
      risco: 'A empresa cresce por força de trabalho, não por eficiência de sistema. O teto de crescimento está próximo: mais volume significa mais gente, não mais automação. Concorrentes que adotarem IA nos próximos 12–18 meses terão vantagem de custo significativa.',
      recomendacao: 'É o momento ideal para investir em IA — a base está pronta para absorver automação avançada. Começar pelos quick wins de maior ROI (atendimento, operações, geração de conteúdo) e paralelamente estruturar governança para suportar o crescimento.',
      regras: [
        { pilar: 'proc', operador: 'between', valor: [3.0, 4.5], peso: 3 },
        { pilar: 'tec',  operador: 'between', valor: [3.0, 4.5], peso: 2 },
        { pilar: 'neg',  operador: 'between', valor: [2.5, 4.0], peso: 2 },
        // IA baixa é marcador deste perfil
        { pilar: 'ia',   operador: 'lte',     valor: 2.5,        peso: 2 },
        // Gov pode estar começando
        { pilar: 'gov',  operador: 'between', valor: [2.0, 3.5], peso: 1 },
        // Penalidade se IA for alta (é outro perfil)
        { pilar: 'ia',   operador: 'gte',     valor: 3.5,        peso: -3 },
      ],
    },

    {
      id: 'estruturado_para_crescer',
      nome: 'Estruturado para Crescer',
      icone: '📈',
      cor: '#7F77DD',
      corLight: '#F0EFFF',
      urgencia: 'Estratégica',
      urgenciaCor: '#7F77DD',
      imdMin: 65,
      imdMax: 80,
      descricao: 'Base sólida em todos os pilares. Pronto para escalar com IA e automação avançada.',
      narrativa: 'A empresa atingiu maturidade operacional consistente. Processos são seguidos, sistemas estão integrados, governança está ativa e há uma cultura nascente de dados. O próximo passo natural é escalar com inteligência: usar IA para multiplicar a capacidade operacional sem crescimento proporcional de custos.',
      sinais: [
        'Todos os pilares em nível 3 ou acima',
        'Dados disponíveis e confiáveis para decisão',
        'Governança corporativa estruturada',
        'Liderança com visão estratégica clara',
        'IA sendo explorada ou com projetos em andamento',
        'Crescimento limitado por capacidade, não por caos',
      ],
      risco: 'O risco é a estagnação por conforto. A empresa está bem — e isso pode criar resistência à mudança. Enquanto isso, concorrentes menores e mais ágeis que adotarem IA de forma agressiva podem capturar mercado nos próximos 24 meses.',
      recomendacao: 'Momento ideal para uma agenda de transformação digital acelerada. Definir um roadmap de IA em 3 horizontes (30/90/180 dias), começar pelos quick wins de maior ROI e criar uma cultura de experimentação e melhoria contínua.',
      regras: [
        // Todos os pilares relativamente equilibrados e acima de 3
        { pilar: 'neg',  operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'tec',  operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'proc', operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'gov',  operador: 'gte', valor: 3.0, peso: 2 },
        // IA pode estar começando (diferencia de Referência Digital)
        { pilar: 'ia',   operador: 'between', valor: [2.5, 4.0], peso: 2 },
        // Penalidade se algum pilar crítico for baixo
        { pilar: 'tec',  operador: 'lte', valor: 2.5, peso: -2 },
        { pilar: 'proc', operador: 'lte', valor: 2.5, peso: -2 },
        { pilar: 'gov',  operador: 'lte', valor: 2.0, peso: -2 },
      ],
    },

    {
      id: 'referencia_digital',
      nome: 'Referência Digital',
      icone: '🚀',
      cor: '#1a1a1a',
      corLight: '#F5F5F5',
      urgencia: 'Inovação',
      urgenciaCor: '#1D9E75',
      imdMin: 80,
      imdMax: 100,
      descricao: 'Alta maturidade em todos os pilares. IA como vantagem competitiva estratégica.',
      narrativa: 'A empresa atingiu maturidade digital de referência. A operação é eficiente, os dados guiam as decisões, a governança é robusta e a IA já está integrada como vantagem competitiva. O foco agora é manter a liderança e identificar os próximos vetores de inovação antes que a concorrência os descubra.',
      sinais: [
        'IA integrada à operação em múltiplas áreas',
        'Decisões baseadas em dados em tempo real',
        'Governança corporativa e de TI robustas',
        'Cultura de melhoria contínua e experimentação',
        'Processos automatizados e monitorados',
        'Liderança com visão de longo prazo e execução estruturada',
      ],
      risco: 'O risco é a arrogância digital. Empresas neste nível tendem a subestimar concorrentes menores e mais ágeis que inovam de forma disruptiva. A manutenção da vantagem competitiva exige reinvestimento contínuo em inovação e atenção constante ao ecossistema.',
      recomendacao: 'Focar em inovação de produto e diferenciação competitiva com IA — não apenas em eficiência operacional. Explorar IA generativa em novos produtos e serviços, criar um programa de inovação estruturado e considerar tornar a maturidade digital um ativo de marca e recrutamento.',
      regras: [
        { pilar: 'neg',  operador: 'gte', valor: 4.0, peso: 2 },
        { pilar: 'tec',  operador: 'gte', valor: 4.0, peso: 2 },
        { pilar: 'proc', operador: 'gte', valor: 4.0, peso: 2 },
        { pilar: 'gov',  operador: 'gte', valor: 3.5, peso: 2 },
        { pilar: 'ia',   operador: 'gte', valor: 3.5, peso: 3 },
        // Penalidade se qualquer pilar crítico for baixo
        { pilar: 'tec',  operador: 'lte', valor: 3.0, peso: -4 },
        { pilar: 'proc', operador: 'lte', valor: 3.0, peso: -4 },
        { pilar: 'ia',   operador: 'lte', valor: 3.0, peso: -3 },
      ],
    },
  ];
}

// ── ALGORITMO DE CLASSIFICAÇÃO ───────────────────────────────────────────
/**
 * Avalia uma regra contra o score de um pilar.
 * Retorna true se a regra for satisfeita.
 */
function avaliarRegra(scoresPorPilar, regra) {
  const score = scoresPorPilar[regra.pilar] || 0;
  switch (regra.operador) {
    case 'lt':      return score <  regra.valor;
    case 'lte':     return score <= regra.valor;
    case 'gt':      return score >  regra.valor;
    case 'gte':     return score >= regra.valor;
    case 'between': return score >= regra.valor[0] && score <= regra.valor[1];
    default:        return false;
  }
}

/**
 * Calcula a pontuação de afinidade de uma empresa com cada perfil.
 * Retorna um número — quanto maior, mais alinhado ao perfil.
 */
function calcularAfinidade(scoresPorPilar, perfil) {
  let afinidade = 0;
  for (const regra of perfil.regras) {
    if (avaliarRegra(scoresPorPilar, regra)) {
      afinidade += regra.peso;
    }
  }
  return afinidade;
}

/**
 * Detecta automaticamente o gap dominante entre os pilares.
 * Usado para personalizar a narrativa do perfil.
 */
function detectarGapDominante(scoresPorPilar) {
  const nomesPilares = {
    neg: 'Visão Estratégica',
    tec: 'Tecnologia',
    proc: 'Processos',
    gov: 'Governança',
    ia: 'Inteligência Artificial',
  };

  let pilarMaisBaixo  = null;
  let pilarMaisAlto   = null;
  let menorScore      = Infinity;
  let maiorScore      = -Infinity;

  for (const [pilar, score] of Object.entries(scoresPorPilar)) {
    if (score < menorScore) { menorScore = score; pilarMaisBaixo = pilar; }
    if (score > maiorScore) { maiorScore = score; pilarMaisAlto  = pilar; }
  }

  const gap = maiorScore - menorScore;
  return {
    pilarMaisBaixo,
    pilarMaisAlto,
    nomeMaisBaixo:  nomesPilares[pilarMaisBaixo],
    nomeMaisAlto:   nomesPilares[pilarMaisAlto],
    scoreMaisBaixo: menorScore,
    scoreMaisAlto:  maiorScore,
    gap: parseFloat(gap.toFixed(2)),
    temAssimetria: gap >= 1.5,
  };
}

/**
 * Verifica quais sinais do perfil são confirmados pelos scores reais.
 * Retorna os sinais confirmados (para exibir no card) e os ausentes.
 */
function verificarSinaisConfirmados(scoresPorPilar, perfil) {
  // Mapeamento simples de sinais para condições de score
  // Expandível conforme a metodologia evolui
  const condicoes = {
    neg:  scoresPorPilar.neg,
    tec:  scoresPorPilar.tec,
    proc: scoresPorPilar.proc,
    gov:  scoresPorPilar.gov,
    ia:   scoresPorPilar.ia,
  };

  // Por ora retorna todos os sinais do perfil como confirmados
  // Em v2 pode ser refinado com mapeamento individual de sinais
  return {
    confirmados: perfil.sinais,
    ausentes: [],
  };
}

/**
 * FUNÇÃO PRINCIPAL — Classifica o perfil de maturidade.
 *
 * @param {Object} scoresPorPilar - { neg: 3.2, tec: 4.1, proc: 2.8, gov: 1.9, ia: 1.5 }
 * @param {number} imd            - Score IMD consolidado (0–100)
 * @returns {Object}              - Resultado completo com perfil, afinidades e insights
 */
function classificarPerfil(scoresPorPilar, imd) {
  const perfis = getPerfilDefinitions();

  // 1. Calcular afinidade com cada perfil
  const afinidades = perfis.map(perfil => ({
    perfil,
    afinidade: calcularAfinidade(scoresPorPilar, perfil),
  }));

  // 2. Ordenar por afinidade decrescente
  afinidades.sort((a, b) => b.afinidade - a.afinidade);

  // 3. Perfil principal = maior afinidade
  const perfilPrincipal = afinidades[0].perfil;
  const perfilSecundario = afinidades[1]?.perfil || null;

  // 4. Detectar gap dominante
  const gap = detectarGapDominante(scoresPorPilar);

  // 5. Verificar sinais
  const sinais = verificarSinaisConfirmados(scoresPorPilar, perfilPrincipal);

  // 6. Calcular distribuição de pilares por faixa
  const distribuicao = {
    criticos:     Object.entries(scoresPorPilar).filter(([,s]) => s < 2).map(([p]) => p),
    emDesenv:     Object.entries(scoresPorPilar).filter(([,s]) => s >= 2 && s < 3).map(([p]) => p),
    estruturados: Object.entries(scoresPorPilar).filter(([,s]) => s >= 3 && s < 4).map(([p]) => p),
    avancados:    Object.entries(scoresPorPilar).filter(([,s]) => s >= 4).map(([p]) => p),
  };

  // 7. Gerar insight personalizado sobre o gap
  let insightGap = '';
  if (gap.temAssimetria) {
    insightGap = `A empresa apresenta uma assimetria relevante: ${gap.nomeMaisAlto} está significativamente mais maduro (${gap.scoreMaisAlto.toFixed(1)}/5) do que ${gap.nomeMaisBaixo} (${gap.scoreMaisBaixo.toFixed(1)}/5). Esse gap de ${gap.gap} pontos é o principal vetor de intervenção.`;
  } else {
    insightGap = `Os pilares apresentam desenvolvimento relativamente equilibrado, com variação de ${gap.gap} pontos entre o mais forte e o mais fraco.`;
  }

  return {
    // Dados principais
    perfil:          perfilPrincipal,
    perfilSecundario,
    imd,

    // Análise
    afinidades:      afinidades.map(a => ({ id: a.perfil.id, nome: a.perfil.nome, afinidade: a.afinidade })),
    gapDominante:    gap,
    sinaisConfirmados: sinais.confirmados,
    distribuicao,
    insightGap,

    // Metadados
    totalPilaresAvaliados: Object.keys(scoresPorPilar).length,
    scoresPorPilar,
  };
}

// ── GERAÇÃO DE HTML DO CARD ──────────────────────────────────────────────
/**
 * Gera o HTML completo do card de perfil para injetar no dashboard IMD.
 * Compatível com o sistema de variáveis CSS do Assessment Nexus.
 *
 * @param {Object} resultado - Retorno de classificarPerfil()
 * @returns {string}         - HTML pronto para injetar
 */
function gerarCardPerfil(resultado) {
  const { perfil, imd, insightGap, sinaisConfirmados, gapDominante, perfilSecundario } = resultado;

  const sinaisHtml = sinaisConfirmados.map(s => `
    <span style="
      display:inline-flex;align-items:center;gap:4px;
      padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;
      background:${perfil.corLight};color:${perfil.cor};
      border:0.5px solid ${perfil.cor};margin:0 4px 4px 0;
    ">✓ ${s}</span>`).join('');

  const secundarioHtml = perfilSecundario ? `
    <div style="font-size:11px;color:var(--color-text-secondary);margin-top:6px">
      Traços de: <strong style="color:${perfilSecundario.cor}">${perfilSecundario.icone} ${perfilSecundario.nome}</strong>
    </div>` : '';

  const urgenciaHtml = `
    <span style="
      padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;
      background:${perfil.urgenciaCor}22;color:${perfil.urgenciaCor};
      border:0.5px solid ${perfil.urgenciaCor};
    ">Urgência: ${perfil.urgencia}</span>`;

  return `
  <div id="card-perfil-maturidade" style="
    border:0.5px solid ${perfil.cor};
    border-radius:12px;
    overflow:hidden;
    background:var(--color-background-primary);
    margin-bottom:12px;
  ">
    <!-- CABEÇALHO -->
    <div style="
      background:${perfil.cor};
      padding:18px 20px;
      display:flex;align-items:center;gap:14px;
    ">
      <span style="font-size:32px">${perfil.icone}</span>
      <div style="flex:1">
        <div style="font-size:11px;font-weight:600;color:#ffffff99;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">
          Perfil de maturidade digital
        </div>
        <div style="font-size:20px;font-weight:500;color:#fff;margin-bottom:2px">
          ${perfil.nome}
        </div>
        <div style="font-size:13px;color:#ffffffbb">
          ${perfil.descricao}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:36px;font-weight:300;color:#fff;line-height:1">${imd}</div>
        <div style="font-size:11px;color:#ffffffbb">IMD / 100</div>
      </div>
    </div>

    <!-- CORPO -->
    <div style="padding:18px 20px">

      <!-- Narrativa -->
      <p style="font-size:13px;color:var(--color-text-primary);line-height:1.7;margin-bottom:14px">
        ${perfil.narrativa}
      </p>

      <!-- Insight do gap -->
      ${gapDominante.temAssimetria ? `
      <div style="
        padding:10px 14px;border-radius:8px;
        background:${perfil.corLight};
        border-left:3px solid ${perfil.cor};
        font-size:12px;color:var(--color-text-secondary);
        line-height:1.6;margin-bottom:14px;
      ">
        <strong style="color:${perfil.cor}">Assimetria identificada:</strong> ${insightGap}
      </div>` : ''}

      <!-- Sinais confirmados -->
      <div style="font-size:11px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">
        Sinais identificados
      </div>
      <div style="margin-bottom:16px;line-height:2">${sinaisHtml}</div>

      <!-- Risco e recomendação -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="
          padding:12px 14px;border-radius:8px;
          background:var(--color-background-secondary);
          border:0.5px solid var(--color-border-tertiary);
        ">
          <div style="font-size:11px;font-weight:600;color:#A32D2D;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">
            ⚠ Risco principal
          </div>
          <div style="font-size:12px;color:var(--color-text-secondary);line-height:1.6">
            ${perfil.risco}
          </div>
        </div>
        <div style="
          padding:12px 14px;border-radius:8px;
          background:${perfil.corLight};
          border:0.5px solid ${perfil.cor};
        ">
          <div style="font-size:11px;font-weight:600;color:${perfil.cor};text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">
            → Recomendação
          </div>
          <div style="font-size:12px;color:var(--color-text-primary);line-height:1.6">
            ${perfil.recomendacao}
          </div>
        </div>
      </div>

      <!-- Footer do card -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        ${urgenciaHtml}
        ${secundarioHtml}
      </div>

    </div>
  </div>`;
}

/**
 * Gera o texto do perfil formatado para o relatório no Google Docs.
 * Retorna um objeto com seções prontas para o Relatorio.gs montar.
 */
function gerarTextoRelatorio(resultado) {
  const { perfil, imd, insightGap, sinaisConfirmados, gapDominante } = resultado;

  return {
    titulo:     `Perfil de Maturidade: ${perfil.nome}`,
    imd:        `${imd}/100`,
    descricao:  perfil.descricao,
    narrativa:  perfil.narrativa,
    insight:    insightGap,
    sinais:     sinaisConfirmados,
    risco:      perfil.risco,
    recomendacao: perfil.recomendacao,
    urgencia:   perfil.urgencia,
    pilarForte: gapDominante.nomeMaisAlto,
    pilarFraco: gapDominante.nomeMaisBaixo,
  };
}

// ── EXPORTS ─────────────────────────────────────────────────────────────
// Para uso no Node.js / frontend via require()
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    classificarPerfil,
    gerarCardPerfil,
    gerarTextoRelatorio,
    getPerfilDefinitions,
    detectarGapDominante,
    // Utilitários expostos para testes
    calcularAfinidade,
    avaliarRegra,
  };
}

// Para uso direto no browser (AppScript Web App ou script inline)
if (typeof window !== 'undefined') {
  window.PerfilMaturidade = {
    classificarPerfil,
    gerarCardPerfil,
    gerarTextoRelatorio,
    getPerfilDefinitions,
    detectarGapDominante,
  };
}


// ══════════════════════════════════════════════════════════════════════════
// TESTES INTERNOS — rodar com: node perfil_maturidade.js
// ══════════════════════════════════════════════════════════════════════════
if (require.main === module) {
  const casos = [
    {
      label: 'Empresa de serviços — todos os pilares baixos',
      scores: { neg: 1.8, tec: 1.5, proc: 1.6, gov: 1.2, ia: 1.0 },
      imd: 32,
    },
    {
      label: 'E-commerce em crescimento — investiu em tech mas processos caóticos',
      scores: { neg: 2.8, tec: 4.2, proc: 2.3, gov: 1.8, ia: 2.0 },
      imd: 55,
    },
    {
      label: 'Indústria — operação funcional, sem IA',
      scores: { neg: 3.2, tec: 3.5, proc: 3.8, gov: 2.8, ia: 1.5 },
      imd: 62,
    },
    {
      label: 'Serviços B2B — estruturado e pronto para IA',
      scores: { neg: 3.8, tec: 3.5, proc: 3.9, gov: 3.4, ia: 3.0 },
      imd: 72,
    },
    {
      label: 'Empresa avançada — referência digital',
      scores: { neg: 4.5, tec: 4.8, proc: 4.5, gov: 4.2, ia: 4.3 },
      imd: 90,
    },
  ];

  console.log('\n══ TESTES DE CLASSIFICAÇÃO DE PERFIL ══\n');

  casos.forEach(({ label, scores, imd }) => {
    const resultado = classificarPerfil(scores, imd);
    console.log(`📊 ${label}`);
    console.log(`   IMD: ${imd}/100`);
    console.log(`   Scores: neg=${scores.neg} | tec=${scores.tec} | proc=${scores.proc} | gov=${scores.gov} | ia=${scores.ia}`);
    console.log(`   Perfil: ${resultado.perfil.icone} ${resultado.perfil.nome}`);
    if (resultado.perfilSecundario) {
      console.log(`   Secundário: ${resultado.perfilSecundario.icone} ${resultado.perfilSecundario.nome}`);
    }
    console.log(`   Gap dominante: ${resultado.gapDominante.nomeMaisAlto} (${resultado.gapDominante.scoreMaisAlto}) → ${resultado.gapDominante.nomeMaisBaixo} (${resultado.gapDominante.scoreMaisBaixo})`);
    console.log(`   Afinidades: ${resultado.afinidades.map(a => `${a.id.split('_')[0]}:${a.afinidade}`).join(' | ')}`);
    console.log();
  });
}
