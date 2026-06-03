// ============================================================
// PerfilMaturidade.gs — Classificação de Perfil (server-side)
// Espelho do perfil_maturidade.js para uso no GAS / Relatorio.gs
// ============================================================

// ── Definições dos Perfis ──────────────────────────────────

function getPerfilDefinitions() {
  return [
    {
      id: 'negocio_em_risco',
      nome: 'Negócio em Risco',
      icone: '🚨',
      cor: '#E24B4A',
      urgencia: 'Crítica',
      imdMin: 20, imdMax: 39,
      descricao: 'Todos os pilares críticos. Operação vulnerável e dependente de pessoas-chave.',
      narrativa: 'A empresa opera em modo de alto risco operacional. A ausência de processos documentados, sistemas integrados e indicadores de performance cria uma dependência crítica de pessoas-chave. Um único evento pode comprometer a continuidade do negócio.',
      sinais: [
        'Operação depende de 1 a 2 pessoas-chave para funcionar',
        'Sistemas isolados ou inexistentes — gestão por planilhas e e-mail',
        'Processos não documentados e não repetíveis',
        'Sem indicadores ou métricas de performance',
        'Decisões tomadas por intuição, sem dados',
        'Alta exposição a riscos de segurança e LGPD',
      ],
      risco: 'A saída de uma pessoa-chave ou um incidente técnico pode paralisar a operação por dias ou semanas.',
      recomendacao: 'Documentar os 3 processos mais críticos, implantar um sistema de gestão básico (ERP ou CRM) e criar um plano mínimo de contingência.',
      regras: [
        { pilar: 'neg',  operador: 'lte', valor: 2.0, peso: 2 },
        { pilar: 'tec',  operador: 'lte', valor: 2.0, peso: 2 },
        { pilar: 'proc', operador: 'lte', valor: 2.0, peso: 2 },
        { pilar: 'gov',  operador: 'lte', valor: 2.0, peso: 1 },
        { pilar: 'ia',   operador: 'lte', valor: 2.0, peso: 1 },
        { pilar: 'tec',  operador: 'gte', valor: 3.5, peso: -3 },
        { pilar: 'proc', operador: 'gte', valor: 3.5, peso: -3 },
      ],
    },
    {
      id: 'em_construcao',
      nome: 'Em Construção',
      icone: '🏗️',
      cor: '#BA7517',
      urgencia: 'Alta',
      imdMin: 40, imdMax: 54,
      descricao: 'Base sendo formada. Investimentos feitos mas não totalmente aproveitados.',
      narrativa: 'A empresa fez investimentos em tecnologia e está estruturando seus processos, mas ainda não consegue extrair o valor completo dessas iniciativas. O maior risco é continuar investindo em novas ferramentas antes de consolidar as existentes.',
      sinais: [
        'ERP ou CRM implantado, mas com baixa adoção',
        'Processos existem mas não são seguidos consistentemente',
        'Algumas métricas acompanhadas, sem cadência regular',
        'Governança corporativa inexistente ou informal',
        'Integrações manuais entre sistemas apesar de ter tecnologia',
        'IA não está no radar da liderança',
      ],
      risco: 'Desperdício de investimentos já realizados. Sistemas adquiridos mas subutilizados.',
      recomendacao: 'Focar em adoção e não em aquisição. Extrair o máximo valor do que já existe antes de comprar novas ferramentas.',
      regras: [
        { pilar: 'neg',  operador: 'between', valor: [1.5, 3.0], peso: 2 },
        { pilar: 'tec',  operador: 'between', valor: [1.5, 3.0], peso: 2 },
        { pilar: 'proc', operador: 'between', valor: [1.5, 3.0], peso: 2 },
        { pilar: 'gov',  operador: 'lte',     valor: 2.5,        peso: 1 },
        { pilar: 'ia',   operador: 'lte',     valor: 2.5,        peso: 1 },
        { pilar: 'tec',  operador: 'lte',     valor: 1.5,        peso: -2 },
        { pilar: 'proc', operador: 'lte',     valor: 1.5,        peso: -2 },
      ],
    },
    {
      id: 'tecnologia_forte_gestao_fraca',
      nome: 'Tecnologia Forte, Gestão Fraca',
      icone: '🔧',
      cor: '#1D9E75',
      urgencia: 'Moderada',
      imdMin: 48, imdMax: 65,
      descricao: 'Infraestrutura avançada, mas processos e governança não acompanham.',
      narrativa: 'A empresa possui uma infraestrutura técnica sofisticada, mas a operação não aproveita esse potencial. Há um gap significativo entre o que a tecnologia permite e o que os processos entregam.',
      sinais: [
        'Infraestrutura cloud bem estruturada',
        'Sistemas modernos implantados (ERP/CRM atualizados)',
        'Processos operacionais caóticos ou informais',
        'Governança de TI existe, mas governança corporativa é fraca',
        'TI resolve problemas que deveriam ser de processo',
        'Decisões de negócio sem dados mesmo com sistemas disponíveis',
      ],
      risco: 'Tecnologia sem processo é custo, não investimento. A empresa paga por ferramentas sofisticadas que são usadas como planilhas avançadas.',
      recomendacao: 'Mapear os processos críticos para aproveitar a tecnologia disponível e criar um programa de capacitação para as áreas de negócio.',
      regras: [
        { pilar: 'tec',  operador: 'gte',     valor: 3.8,        peso: 4 },
        { pilar: 'proc', operador: 'lte',     valor: 2.8,        peso: 3 },
        { pilar: 'gov',  operador: 'lte',     valor: 2.5,        peso: 2 },
        { pilar: 'ia',   operador: 'between', valor: [1.5, 3.5], peso: 1 },
        { pilar: 'proc', operador: 'gte',     valor: 3.5,        peso: -3 },
      ],
    },
    {
      id: 'operacao_funcional',
      nome: 'Operação Funcional',
      icone: '⚙️',
      cor: '#3B8BD4',
      urgencia: 'Moderada',
      imdMin: 55, imdMax: 67,
      descricao: 'Processos e tecnologia sólidos. Cresce por esforço, não por sistema. IA ausente.',
      narrativa: 'A empresa tem uma operação funcional e previsível. No entanto, o crescimento ainda depende de aumento de headcount em vez de automação. A ausência de IA cria um teto de crescimento que se aproxima.',
      sinais: [
        'Processos documentados e razoavelmente seguidos',
        'Sistemas integrados na maioria das áreas',
        'KPIs básicos monitorados com cadência',
        'Governança corporativa iniciando',
        'IA inexistente ou usada de forma informal',
        'Crescimento requer contratar mais pessoas',
      ],
      risco: 'A empresa cresce por força de trabalho, não por eficiência. Concorrentes que adotarem IA nos próximos 12-18 meses terão vantagem de custo significativa.',
      recomendacao: 'Momento ideal para investir em IA — a base está pronta. Começar pelos quick wins de maior ROI: atendimento, operações, geração de conteúdo.',
      regras: [
        { pilar: 'proc', operador: 'between', valor: [3.0, 4.5], peso: 3 },
        { pilar: 'tec',  operador: 'between', valor: [3.0, 4.5], peso: 2 },
        { pilar: 'neg',  operador: 'between', valor: [2.5, 4.0], peso: 2 },
        { pilar: 'ia',   operador: 'lte',     valor: 2.5,        peso: 2 },
        { pilar: 'gov',  operador: 'between', valor: [2.0, 3.5], peso: 1 },
        { pilar: 'ia',   operador: 'gte',     valor: 3.5,        peso: -3 },
      ],
    },
    {
      id: 'estruturado_para_crescer',
      nome: 'Estruturado para Crescer',
      icone: '📈',
      cor: '#7F77DD',
      urgencia: 'Estratégica',
      imdMin: 65, imdMax: 80,
      descricao: 'Base sólida em todos os pilares. Pronto para escalar com IA e automação avançada.',
      narrativa: 'A empresa atingiu maturidade operacional consistente. O próximo passo é escalar com inteligência: usar IA para multiplicar a capacidade operacional sem crescimento proporcional de custos.',
      sinais: [
        'Todos os pilares em nível 3 ou acima',
        'Dados disponíveis e confiáveis para decisão',
        'Governança corporativa estruturada',
        'Liderança com visão estratégica clara',
        'IA sendo explorada ou com projetos em andamento',
        'Crescimento limitado por capacidade, não por caos',
      ],
      risco: 'O risco é a estagnação por conforto. Concorrentes menores e mais ágeis que adotarem IA agressivamente podem capturar mercado nos próximos 24 meses.',
      recomendacao: 'Definir um roadmap de IA em 3 horizontes (30/90/180 dias), começar pelos quick wins de maior ROI e criar uma cultura de experimentação.',
      regras: [
        { pilar: 'neg',  operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'tec',  operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'proc', operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'gov',  operador: 'gte', valor: 3.0, peso: 2 },
        { pilar: 'ia',   operador: 'between', valor: [2.5, 4.0], peso: 2 },
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
      urgencia: 'Inovação',
      imdMin: 80, imdMax: 100,
      descricao: 'Alta maturidade em todos os pilares. IA como vantagem competitiva estratégica.',
      narrativa: 'A empresa atingiu maturidade digital de referência. A operação é eficiente, os dados guiam as decisões e a IA já está integrada como vantagem competitiva. O foco agora é manter a liderança e identificar os próximos vetores de inovação.',
      sinais: [
        'IA integrada à operação em múltiplas áreas',
        'Decisões baseadas em dados em tempo real',
        'Governança corporativa e de TI robustas',
        'Cultura de melhoria contínua e experimentação',
        'Processos automatizados e monitorados',
        'Liderança com visão de longo prazo e execução estruturada',
      ],
      risco: 'O risco é a arrogância digital. Empresas neste nível tendem a subestimar concorrentes menores e mais ágeis.',
      recomendacao: 'Focar em inovação de produto com IA — não apenas em eficiência operacional. Explorar IA generativa em novos produtos e criar um programa de inovação estruturado.',
      regras: [
        { pilar: 'neg',  operador: 'gte', valor: 4.0, peso: 2 },
        { pilar: 'tec',  operador: 'gte', valor: 4.0, peso: 2 },
        { pilar: 'proc', operador: 'gte', valor: 4.0, peso: 2 },
        { pilar: 'gov',  operador: 'gte', valor: 3.5, peso: 2 },
        { pilar: 'ia',   operador: 'gte', valor: 3.5, peso: 3 },
        { pilar: 'tec',  operador: 'lte', valor: 3.0, peso: -4 },
        { pilar: 'proc', operador: 'lte', valor: 3.0, peso: -4 },
        { pilar: 'ia',   operador: 'lte', valor: 3.0, peso: -3 },
      ],
    },
  ];
}

// ── Algoritmo de Classificação ─────────────────────────────

function _avaliarRegra(scoresPorPilar, regra) {
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

function _calcularAfinidade(scoresPorPilar, perfil) {
  let afinidade = 0;
  perfil.regras.forEach(function(regra) {
    if (_avaliarRegra(scoresPorPilar, regra)) afinidade += regra.peso;
  });
  return afinidade;
}

function _detectarGapDominante(scoresPorPilar) {
  const nomes = { neg: 'Visão Estratégica', tec: 'Tecnologia', proc: 'Processos', gov: 'Governança', ia: 'Inteligência Artificial' };
  let pilarMaisBaixo = null, pilarMaisAlto = null, menorScore = Infinity, maiorScore = -Infinity;
  Object.keys(scoresPorPilar).forEach(function(pilar) {
    const score = scoresPorPilar[pilar];
    if (score < menorScore) { menorScore = score; pilarMaisBaixo = pilar; }
    if (score > maiorScore) { maiorScore = score; pilarMaisAlto  = pilar; }
  });
  const gap = maiorScore - menorScore;
  return {
    pilarMaisBaixo, pilarMaisAlto,
    nomeMaisBaixo:  nomes[pilarMaisBaixo],
    nomeMaisAlto:   nomes[pilarMaisAlto],
    scoreMaisBaixo: menorScore,
    scoreMaisAlto:  maiorScore,
    gap: Math.round(gap * 100) / 100,
    temAssimetria: gap >= 1.5,
  };
}

/**
 * Classifica o perfil de maturidade digital.
 * @param {Object} scoresPorPilar - { neg: 3.2, tec: 4.1, proc: 2.8, gov: 1.9, ia: 1.5 }
 * @param {number} imd            - Score IMD 0–100
 */
function classificarPerfil(scoresPorPilar, imd) {
  const perfis = getPerfilDefinitions();
  const afinidades = perfis.map(function(perfil) {
    return { perfil: perfil, afinidade: _calcularAfinidade(scoresPorPilar, perfil) };
  });
  afinidades.sort(function(a, b) { return b.afinidade - a.afinidade; });

  const perfilPrincipal  = afinidades[0].perfil;
  const perfilSecundario = afinidades[1] ? afinidades[1].perfil : null;
  const gap              = _detectarGapDominante(scoresPorPilar);

  let insightGap = '';
  if (gap.temAssimetria) {
    insightGap = 'A empresa apresenta assimetria relevante: ' + gap.nomeMaisAlto + ' está significativamente mais maduro (' + gap.scoreMaisAlto.toFixed(1) + '/5) do que ' + gap.nomeMaisBaixo + ' (' + gap.scoreMaisBaixo.toFixed(1) + '/5). Esse gap de ' + gap.gap + ' pontos é o principal vetor de intervenção.';
  } else {
    insightGap = 'Os pilares apresentam desenvolvimento equilibrado, com variação de ' + gap.gap + ' pontos entre o mais forte e o mais fraco.';
  }

  return {
    perfil:           perfilPrincipal,
    perfilSecundario: perfilSecundario,
    imd:              imd,
    gapDominante:     gap,
    insightGap:       insightGap,
    afinidades:       afinidades.map(function(a) { return { id: a.perfil.id, nome: a.perfil.nome, afinidade: a.afinidade }; }),
    sinaisConfirmados: perfilPrincipal.sinais,
    scoresPorPilar:   scoresPorPilar,
  };
}

/**
 * Gera objeto de texto estruturado para uso no Relatorio.gs.
 * @param {Object} resultado - Retorno de classificarPerfil()
 */
function gerarTextoRelatorio(resultado) {
  const perfil     = resultado.perfil;
  const imd        = resultado.imd;
  const gap        = resultado.gapDominante;
  const secundario = resultado.perfilSecundario;

  return {
    titulo:          perfil.icone + ' ' + perfil.nome,
    imdFormatado:    imd + '/100',
    urgencia:        perfil.urgencia,
    descricao:       perfil.descricao,
    narrativa:       perfil.narrativa,
    insight:         resultado.insightGap,
    sinais:          perfil.sinais,
    risco:           perfil.risco,
    recomendacao:    perfil.recomendacao,
    pilarForte:      gap.nomeMaisAlto + ' (' + gap.scoreMaisAlto.toFixed(1) + '/5)',
    pilarFraco:      gap.nomeMaisBaixo + ' (' + gap.scoreMaisBaixo.toFixed(1) + '/5)',
    assimetria:      gap.temAssimetria,
    temSecundario:   !!secundario,
    perfilSecundario: secundario ? secundario.icone + ' ' + secundario.nome : '',
  };
}
