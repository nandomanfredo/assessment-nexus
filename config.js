/**
 * Assessment Nexus — config.js
 * Fonte única de verdade: pilares, dimensões, critérios, pesos, perguntas-guia e cálculos.
 * Altere aqui para atualizar a metodologia sem tocar na lógica do app.
 */

const CONFIG = {
  versao: "1.0",
  metodologia: "IMD — Índice de Maturidade Digital",
  empresa: "Nexus Consultoria",

  // ─── Opções de formulário ────────────────────────────────────────────────

  setores: [
    { id: "ecommerce",   label: "E-commerce" },
    { id: "industria",   label: "Indústria" },
    { id: "servicos_b2b",label: "Serviços B2B" },
    { id: "saude",       label: "Saúde" },
    { id: "outro",       label: "Outro" },
  ],

  faturamentoOpcoes: [
    { id: "ate_300k",      label: "Até R$ 300k",         valorCalculo: 150000  },
    { id: "300k_1_5m",     label: "R$ 300k – R$ 1,5M",   valorCalculo: 900000  },
    { id: "1_5m_5m",       label: "R$ 1,5M – R$ 5M",     valorCalculo: 3250000 },
    { id: "acima_5m",      label: "Acima de R$ 5M",       valorCalculo: 7500000 },
  ],

  funcionariosOpcoes: [
    { id: "ate_20",        label: "Até 20",       valorCalculo: 10  },
    { id: "20_100",        label: "20 – 100",     valorCalculo: 60  },
    { id: "100_300",       label: "100 – 300",    valorCalculo: 200 },
    { id: "acima_300",     label: "Acima de 300", valorCalculo: 350 },
  ],

  // ─── Faixas de resultado IMD ─────────────────────────────────────────────

  faixasIMD: [
    { min: 20,  max: 39,  nome: "Crítico",           diagnostico: "Riscos imediatos. Intervenção urgente necessária.",                          cor: "#E24B4A" },
    { min: 40,  max: 54,  nome: "Em Desenvolvimento", diagnostico: "Base existente mas frágil. Oportunidades de estruturação.",                 cor: "#BA7517" },
    { min: 55,  max: 69,  nome: "Estruturado",        diagnostico: "Fundação sólida. Pronto para escalar com suporte.",                         cor: "#1D9E75" },
    { min: 70,  max: 84,  nome: "Avançado",           diagnostico: "Operação madura. Foco em otimização e IA.",                                 cor: "#3B8BD4" },
    { min: 85,  max: 100, nome: "Referência Digital",  diagnostico: "Alto desempenho. Modelo a ser replicado.",                                  cor: "#9B6DD4" },
  ],

  // ─── Níveis de maturidade ────────────────────────────────────────────────

  niveis: [
    { nivel: 1, nome: "Caótico",      descricao: "Sem processos. Tudo na cabeça de pessoas-chave. Alto risco operacional." },
    { nivel: 2, nome: "Básico",       descricao: "Processos existem mas são informais. Dependência de planilhas e e-mail." },
    { nivel: 3, nome: "Estruturado",  descricao: "Documentado e repetível. Sistemas implantados, mas pouco integrados." },
    { nivel: 4, nome: "Gerenciado",   descricao: "Monitorado com indicadores. Decisões baseadas em dados. Integrações ativas." },
    { nivel: 5, nome: "Otimizado",    descricao: "Melhoria contínua. Automação avançada. IA integrada à operação." },
  ],

  // ─── Fatores de custo de gap por nível ───────────────────────────────────

  fatoresGap: { 1: 1.00, 2: 0.70, 3: 0.40, 4: 0.15, 5: 0.00 },
  fatoresIA:  { 1: 1.00, 2: 0.75, 3: 0.50, 4: 0.25, 5: 0.05 },

  // ─── Pilares ─────────────────────────────────────────────────────────────

  pilares: [

    // ════════════════════════════════════════════════════════════════════════
    // PILAR 1 — VISÃO ESTRATÉGICA DO NEGÓCIO
    // ════════════════════════════════════════════════════════════════════════
    {
      id: "N",
      sigla: "N",
      nome: "Visão Estratégica do Negócio",
      peso: 0.15,
      cor: "#3B8BD4",
      objetivo: "Entender como a empresa opera e ganha dinheiro, e o quanto a liderança tem clareza e controle estratégico sobre o negócio.",
      entregas: [
        "Mapa operacional do negócio",
        "Visão executiva da maturidade estratégica",
        "Riscos estratégicos identificados",
        "Score de clareza estratégica (IMD parcial)",
      ],
      dimensoes: [
        {
          id: "N1",
          nome: "Modelo de negócio e receita",
          peso: 0.22,
          naSugeridoPara: [],
          descricao: "Clareza sobre como a empresa gera receita, quais produtos/serviços são mais rentáveis e qual é o modelo de precificação.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Receita não está mapeada. Não há clareza sobre produtos/serviços mais rentáveis. Precificação é intuitiva e sem análise de margem." },
            2: { nome: "Básico",      descricao: "Produtos e serviços listados informalmente. Precificação existe mas sem análise de margem sistemática. Receita monitorada apenas no fechamento do mês." },
            3: { nome: "Estruturado", descricao: "Modelo de negócio documentado. Produtos categorizados com margem conhecida. Projeções básicas existem e são revisadas periodicamente." },
            4: { nome: "Gerenciado",  descricao: "Análise ativa de mix de receita. Decisões de precificação baseadas em dados de margem e mercado. Ciclo de vida de produtos gerenciado." },
            5: { nome: "Otimizado",   descricao: "Modelo de negócio em revisão contínua. Simulações de cenário e precificação dinâmica. IA aplicada na análise de rentabilidade e mix ideal." },
          },
          perguntas: [
            "Quais são os principais produtos ou serviços da empresa, e qual a margem aproximada de cada um?",
            "Como é definida a precificação? Existe análise de custo + margem ou é baseada em mercado/intuição?",
            "Existem diferentes fontes de receita (recorrente, projeto, produto)? Qual é a mais relevante?",
            "A empresa sabe quais clientes ou contratos são mais rentáveis? Essa informação orienta decisões comerciais?",
            "Com que frequência o modelo de negócio é revisado pela liderança?",
          ],
          benchmark: "Empresas do mesmo porte e setor geralmente atingem nível 3 (modelo documentado com margens conhecidas) em até 3 anos de operação.",
          custoGap: null,
        },
        {
          id: "N2",
          nome: "Diferencial competitivo",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Clareza e comunicação do posicionamento da empresa frente à concorrência, e como esse diferencial é protegido e monitorado.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem clareza do diferencial. Produto/serviço percebido como similar ao da concorrência. Não há posicionamento definido ou comunicado." },
            2: { nome: "Básico",      descricao: "Diferencial percebido pelo fundador mas não comunicado sistematicamente. Não está na cultura da equipe nem no marketing." },
            3: { nome: "Estruturado", descricao: "Diferencial documentado e presente nas mensagens de venda e marketing. A equipe conhece e consegue articular o posicionamento." },
            4: { nome: "Gerenciado",  descricao: "Diferencial medido (NPS, análise win/loss). Estratégia de posicionamento ativa com atualização periódica baseada em dados de mercado." },
            5: { nome: "Otimizado",   descricao: "Diferencial sustentável e protegido (marca, tecnologia proprietária, rede). Monitoramento contínuo de mercado e concorrência com IA." },
          },
          perguntas: [
            "Por que um cliente escolhe vocês e não um concorrente? Esse motivo é documentado e comunicado?",
            "Qual é o posicionamento da empresa no mercado? Isso está formalizado em algum documento ou pitch?",
            "A empresa realiza análise de win/loss (por que ganhou ou perdeu negócios)?",
            "Como é monitorado o que os concorrentes estão fazendo?",
            "O diferencial competitivo é único ou facilmente copiável?",
          ],
          benchmark: "Empresas com posicionamento claro crescem em média 20% mais rápido do que concorrentes sem diferencial articulado.",
          custoGap: null,
        },
        {
          id: "N3",
          nome: "Gestão de canais e operação",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Estrutura e gestão dos canais de venda e distribuição, com métricas e responsáveis definidos por canal.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Canais não mapeados. Vendas acontecem por indicação ou oportunidade sem estrutura. Sem responsáveis definidos por canal." },
            2: { nome: "Básico",      descricao: "Canais identificados mas sem gestão ativa. Sem métricas por canal. Alta dependência de um único canal de aquisição." },
            3: { nome: "Estruturado", descricao: "Canais documentados com responsáveis e metas básicas. Métricas de volume e receita por canal. Operação padronizada por canal." },
            4: { nome: "Gerenciado",  descricao: "Performance por canal monitorada com KPIs detalhados. Testes A/B e otimização contínua. Mix de canais balanceado e diversificado." },
            5: { nome: "Otimizado",   descricao: "Orquestração omnichannel com automação. IA na atribuição de canal ideal por perfil de cliente. Canais integrados end-to-end." },
          },
          perguntas: [
            "Quais são os canais de venda e atendimento da empresa (direto, parceiros, marketplace, digital)?",
            "Existe um responsável por cada canal? Há metas específicas por canal?",
            "A empresa mede a performance de cada canal individualmente? Quais métricas usa?",
            "Como a operação é coordenada entre canais diferentes quando o mesmo cliente usa mais de um?",
            "Qual canal traz mais receita e qual tem melhor margem? A empresa age sobre esse dado?",
          ],
          benchmark: "Empresas com gestão estruturada de canais reduzem o CAC em até 35% ao eliminar canais ineficientes.",
          custoGap: null,
        },
        {
          id: "N4",
          nome: "Visibilidade de gargalos e crescimento",
          peso: 0.22,
          naSugeridoPara: [],
          descricao: "Capacidade da liderança de identificar, priorizar e resolver gargalos operacionais e de planejar o crescimento com base em dados.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Gargalos percebidos mas nunca mapeados formalmente. Crescimento reativo. Problemas são resolvidos apenas no momento da crise." },
            2: { nome: "Básico",      descricao: "Principais gargalos conhecidos informalmente pela liderança. Oportunidades de crescimento identificadas por intuição, sem análise estruturada." },
            3: { nome: "Estruturado", descricao: "Gargalos documentados e priorizados. Plano de crescimento com metas anuais. Reuniões periódicas de revisão estratégica." },
            4: { nome: "Gerenciado",  descricao: "Análise de causa raiz para gargalos recorrentes. OKRs ou metodologia similar com acompanhamento mensal. Forecasting de crescimento ativo." },
            5: { nome: "Otimizado",   descricao: "Detecção proativa de gargalos com dados em tempo real. Modelo preditivo de crescimento. IA na identificação de oportunidades e riscos emergentes." },
          },
          perguntas: [
            "Quais são hoje os 3 maiores gargalos que impedem o crescimento da empresa?",
            "Existe um plano de crescimento formal com metas para os próximos 12 meses?",
            "Como a liderança identifica novos gargalos? Existe algum processo ou é percepção do dia a dia?",
            "A empresa tem visibilidade do que acontece na operação sem precisar perguntar para a equipe?",
            "Quais foram os gargalos resolvidos nos últimos 6 meses? O resultado foi medido?",
          ],
          benchmark: "Empresas que identificam e resolvem gargalos sistematicamente crescem 2x mais rápido do que as que reagem a crises.",
          custoGap: null,
        },
        {
          id: "N5",
          nome: "Gestão de performance",
          peso: 0.20,
          naSugeridoPara: [],
          descricao: "Existência e uso de indicadores de performance estratégica, com rituais de revisão e cultura de decisão baseada em dados.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem KPIs definidos. Performance avaliada subjetivamente pelo fundador. Sem reuniões estruturadas de resultado." },
            2: { nome: "Básico",      descricao: "KPIs básicos existem (faturamento, número de clientes). Revisão informal e irregular. Metas não compartilhadas com a equipe." },
            3: { nome: "Estruturado", descricao: "KPIs definidos por área funcional. Revisão mensal estruturada com pauta. Dashboard básico de performance acessível à liderança." },
            4: { nome: "Gerenciado",  descricao: "OKRs ou Balanced Scorecard implementado. Revisão semanal ou quinzenal. Metas em cascata por equipe com responsáveis definidos." },
            5: { nome: "Otimizado",   descricao: "Performance em tempo real com alertas automáticos de desvio. IA na análise de causas e sugestão de ações corretivas. Cultura de dados consolidada." },
          },
          perguntas: [
            "Quais são os 5 principais indicadores que a liderança acompanha hoje?",
            "Com que frequência são revisados os resultados? Existe uma reunião de ritmo para isso?",
            "As metas de desempenho são conhecidas por toda a equipe ou apenas pela liderança?",
            "Quando um indicador sai do esperado, existe um processo definido de análise e resposta?",
            "A empresa usa algum dashboard ou ferramenta de BI para acompanhar performance?",
          ],
          benchmark: "Empresas com OKRs bem implementados reportam 30% mais foco e 25% menos retrabalho do que sem metodologia de gestão.",
          custoGap: null,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PILAR 2 — TECNOLOGIA
    // ════════════════════════════════════════════════════════════════════════
    {
      id: "T",
      sigla: "T",
      nome: "Tecnologia",
      peso: 0.25,
      cor: "#1D9E75",
      objetivo: "Avaliar a maturidade técnica da infraestrutura, sistemas, integrações e segurança — ângulo de implementação técnica.",
      entregas: [
        "Score técnico com mapa de risco",
        "Mapa de sistemas e integrações",
        "Oportunidades de modernização priorizadas",
      ],
      dimensoes: [
        {
          id: "T1",
          nome: "Infraestrutura e cloud",
          peso: 0.15,
          naSugeridoPara: [],
          descricao: "Maturidade da infraestrutura tecnológica: cloud, backups, redundância e política de segurança de dados.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Infraestrutura local sem redundância. Sem backups regulares ou automatizados. Alto risco de perda de dados em caso de falha." },
            2: { nome: "Básico",      descricao: "Mix de local e cloud sem estratégia definida. Backups manuais e ocasionais. Sem política de segurança documentada." },
            3: { nome: "Estruturado", descricao: "Infraestrutura majoritariamente em cloud com backups automáticos. Política básica de segurança documentada e comunicada." },
            4: { nome: "Gerenciado",  descricao: "Cloud-first com ambientes separados (produção, dev, staging). Backups testados regularmente. SLAs de infraestrutura definidos e monitorados." },
            5: { nome: "Otimizado",   descricao: "Infraestrutura como código (IaC). Multi-cloud ou failover automático. Segurança zero-trust implementada com conformidade certificada." },
          },
          perguntas: [
            "Onde estão hospedados os sistemas críticos da empresa — servidores locais, cloud ou híbrido?",
            "Com que frequência os dados são copiados (backup)? Esse processo é automático ou manual?",
            "A empresa já passou por perda de dados ou indisponibilidade de sistema? Como foi resolvido?",
            "Existe política formal de segurança da informação? Quando foi revisada pela última vez?",
            "Os colaboradores acessam sistemas da empresa de dispositivos pessoais? Existe controle disso?",
          ],
          benchmark: "80% das PMEs em crescimento migraram para cloud em 2023. Empresas sem cloud têm 3x mais incidentes de disponibilidade.",
          custoGap: null,
        },
        {
          id: "T2",
          nome: "ERP e CRM — sistemas internos",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Uso e maturidade de sistemas de gestão (ERP) e de relacionamento com clientes (CRM), e a qualidade dos dados neles.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem ERP ou CRM. Gestão por planilhas, e-mail e WhatsApp. Dados fragmentados entre pessoas e ferramentas distintas." },
            2: { nome: "Básico",      descricao: "Sistemas básicos existem mas são subutilizados. Dados duplicados ou inconsistentes entre ferramentas. Adoção parcial pela equipe." },
            3: { nome: "Estruturado", descricao: "ERP e CRM implantados com uso regular pela equipe. Dados centralizados. Treinamento realizado e processos adaptados aos sistemas." },
            4: { nome: "Gerenciado",  descricao: "ERP e CRM integrados entre si. Dados limpos e confiáveis. Relatórios automáticos de gestão disponíveis para liderança." },
            5: { nome: "Otimizado",   descricao: "Suite integrada com IA embarcada. Automações ativas entre sistemas. Dados em tempo real para decisão estratégica e operacional." },
          },
          perguntas: [
            "A empresa usa algum ERP (Totvs, SAP, Omie, Conta Azul etc.)? Qual e desde quando?",
            "Existe CRM implementado? Como a equipe de vendas registra interações com clientes?",
            "Os sistemas de gestão se comunicam entre si ou os dados precisam ser inseridos manualmente em mais de um lugar?",
            "Com que nível de confiança a liderança usa os dados do ERP/CRM para tomar decisões?",
            "Existem dados de clientes ou vendas em planilhas fora dos sistemas principais?",
          ],
          benchmark: "Empresas com ERP e CRM integrados reduzem o tempo de fechamento financeiro em 60% e aumentam a taxa de renovação de clientes em 25%.",
          custoGap: null,
        },
        {
          id: "T3",
          nome: "Integrações e APIs",
          peso: 0.15,
          naSugeridoPara: [],
          descricao: "Nível de integração entre os sistemas da empresa e o uso de APIs para automatizar fluxos de dados entre ferramentas.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sistemas sem integrações. Dados transferidos manualmente entre ferramentas — cópia, planilha, e-mail. Alto risco de erro e retrabalho." },
            2: { nome: "Básico",      descricao: "Algumas integrações pontuais sem documentação. Dependência de pessoas específicas para manter os fluxos funcionando." },
            3: { nome: "Estruturado", descricao: "Integrações documentadas e mapeadas. Processo de onboarding de novas integrações definido. Monitoramento básico de falhas." },
            4: { nome: "Gerenciado",  descricao: "Arquitetura de integração planejada. APIs documentadas. Webhooks e automações reduzem trabalho manual em processos críticos." },
            5: { nome: "Otimizado",   descricao: "Plataforma de integração (iPaaS como Make, n8n, Zapier Enterprise). APIs abertas e governadas. Eventos em tempo real entre todos os sistemas." },
          },
          perguntas: [
            "Quais sistemas da empresa se comunicam automaticamente? Quais ainda precisam de entrada manual de dados?",
            "Existe algum processo que exige copiar informações de um sistema para outro? Com que frequência?",
            "A empresa usa alguma ferramenta de integração como Zapier, Make, n8n ou similar?",
            "Quando uma integração falha, como a equipe descobre? Existe monitoramento ou é percebido pelo cliente?",
            "Existe documentação de quais sistemas dependem de quais integrações?",
          ],
          benchmark: "Empresas com integrações bem estruturadas economizam em média 12 horas/mês por colaborador em inserção manual de dados.",
          custoGap: null,
        },
        {
          id: "T4",
          nome: "Segurança e LGPD técnica",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Maturidade das práticas de segurança da informação e conformidade técnica com a Lei Geral de Proteção de Dados.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem política de segurança. Dados de clientes armazenados sem proteção adequada. Nenhuma conformidade com LGPD implementada." },
            2: { nome: "Básico",      descricao: "Senhas básicas sem gestão centralizada. LGPD conhecida mas não implementada. Sem auditoria de acesso ou inventário de dados pessoais." },
            3: { nome: "Estruturado", descricao: "Política de segurança básica documentada. Controle de acesso por função. DPO designado. Mapeamento de dados pessoais realizado." },
            4: { nome: "Gerenciado",  descricao: "MFA implementado para sistemas críticos. LGPD com processo de consentimento e atendimento a titulares. Auditorias de acesso periódicas." },
            5: { nome: "Otimizado",   descricao: "Security by design em todos os sistemas. Testes de penetração regulares. Automação de compliance LGPD. Gestão ativa de vulnerabilidades." },
          },
          perguntas: [
            "A empresa tem política de senha e autenticação em dois fatores nos sistemas críticos?",
            "Existe um inventário de quais dados pessoais de clientes/colaboradores a empresa armazena e onde?",
            "A empresa tem um DPO (Encarregado de Proteção de Dados) designado, mesmo que seja informal?",
            "Como é realizado o descarte seguro de dados quando um contrato com cliente é encerrado?",
            "Já houve algum incidente de segurança ou vazamento de dados na empresa? Como foi tratado?",
          ],
          benchmark: "Multas da ANPD por violação da LGPD podem chegar a 2% do faturamento anual. Empresas com nível 3+ têm risco reduzido em 80%.",
          custoGap: null,
        },
        {
          id: "T5",
          nome: "Documentação e dependência técnica",
          peso: 0.16,
          naSugeridoPara: [],
          descricao: "Existência de documentação técnica atualizada e ausência de dependência crítica de pessoas ou fornecedores únicos.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem documentação técnica. Todo o conhecimento na cabeça de 1-2 pessoas. Alta dependência de fornecedor ou desenvolvedor único sem substituto." },
            2: { nome: "Básico",      descricao: "Documentação superficial e desatualizada. Dependência de pessoa-chave para questões técnicas críticas. Troca de fornecedor é traumática." },
            3: { nome: "Estruturado", descricao: "Documentação técnica básica mantida atualizada. Runbooks operacionais. Mais de uma pessoa conhece cada sistema crítico." },
            4: { nome: "Gerenciado",  descricao: "Documentação como parte do processo de desenvolvimento. Wikis técnicas ativas. Gestão estruturada de fornecedores com contratos e SLAs." },
            5: { nome: "Otimizado",   descricao: "Documentação automática e código autodocumentado. Knowledge base com IA para busca. Zero single point of failure técnico ou humano." },
          },
          perguntas: [
            "Se o principal responsável técnico saísse amanhã, quanto tempo levaria para outra pessoa entender os sistemas?",
            "Existe documentação atualizada dos sistemas, integrações e credenciais de acesso da empresa?",
            "A empresa tem dependência de um único fornecedor de tecnologia para algum sistema crítico?",
            "Como novos membros técnicos da equipe são integrados aos sistemas e processos?",
            "Onde ficam armazenadas as senhas, chaves de API e acessos críticos da empresa?",
          ],
          benchmark: "Empresas sem documentação técnica gastam 40% mais tempo em onboarding de novos desenvolvedores e têm 3x mais incidentes de suporte.",
          custoGap: null,
        },
        {
          id: "T6",
          nome: "Monitoramento e disponibilidade",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Capacidade de detectar e responder a falhas de sistemas antes que impactem clientes, com SLAs definidos e métricas de disponibilidade.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem monitoramento. Problemas são descobertos pelos clientes. Sem SLA de disponibilidade. Tempo de resposta a incidentes imprevisível." },
            2: { nome: "Básico",      descricao: "Monitoramento manual e reativo. Alertas básicos de uptime (ex: ping). RTO/RPO não definidos. Incidentes tratados sem processo formal." },
            3: { nome: "Estruturado", descricao: "Monitoramento automatizado com alertas configurados. Dashboard de disponibilidade. SLAs básicos definidos e comunicados." },
            4: { nome: "Gerenciado",  descricao: "Observabilidade completa (logs, métricas, rastreamento). On-call estruturado. Post-mortems documentados e aplicados para melhoria." },
            5: { nome: "Otimizado",   descricao: "AIOps — detecção proativa de anomalias antes do impacto. Auto-healing de incidentes. SLAs de 99,9%+ cumpridos e reportados." },
          },
          perguntas: [
            "Como a empresa descobre que um sistema está fora do ar — alerta automático, reclamação de cliente ou internamente?",
            "Existe um SLA de disponibilidade definido para os sistemas críticos? Ele é monitorado?",
            "Quanto tempo em média leva para resolver uma falha crítica de sistema? Esse tempo é registrado?",
            "Existe alguém de plantão (on-call) para incidentes fora do horário comercial?",
            "A empresa já perdeu receita diretamente por indisponibilidade de sistema? Com que frequência isso ocorre?",
          ],
          benchmark: "1 hora de indisponibilidade custa em média 1,5% do faturamento diário. Empresas com monitoramento ativo reduzem o MTTR em 70%.",
          custoGap: null,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PILAR 3 — PROCESSOS
    // ════════════════════════════════════════════════════════════════════════
    {
      id: "P",
      sigla: "P",
      nome: "Processos",
      peso: 0.25,
      cor: "#BA7517",
      objetivo: "Identificar gargalos operacionais, dependência de pessoas e oportunidades de automação nos fluxos de trabalho.",
      entregas: [
        "Mapa AS-IS dos processos críticos",
        "Oportunidades TO-BE priorizadas",
        "Automações prioritárias com ROI estimado",
      ],
      dimensoes: [
        {
          id: "P1",
          nome: "Comercial e onboarding",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Estrutura e eficiência do processo de vendas, da geração de proposta ao onboarding do novo cliente.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Processo de venda não estruturado. Proposta criada do zero por pedido. Onboarding de cliente sem padrão — cada um é feito de forma diferente." },
            2: { nome: "Básico",      descricao: "Funil de vendas básico mas sem CRM. Template de proposta existe mas é adaptado arbitrariamente. Onboarding improvisado por e-mail." },
            3: { nome: "Estruturado", descricao: "Funil documentado e registrado no CRM. Proposta padronizada por tipo de serviço. Checklist de onboarding com responsáveis definidos." },
            4: { nome: "Gerenciado",  descricao: "Métricas de funil acompanhadas (taxa de conversão, CAC, ciclo de venda). Onboarding automatizado com marcos e notificações." },
            5: { nome: "Otimizado",   descricao: "IA na qualificação e priorização de leads. Proposta personalizada gerada automaticamente. Onboarding self-service com orquestração digital." },
          },
          perguntas: [
            "Como funciona o processo de venda da empresa — do primeiro contato até o fechamento?",
            "Existe um CRM onde todas as oportunidades são registradas e acompanhadas?",
            "Qual é o tempo médio entre o primeiro contato e o fechamento de uma venda?",
            "Como é feito o onboarding de um novo cliente? Existe checklist ou processo documentado?",
            "Quais etapas do processo comercial são feitas manualmente e poderiam ser automatizadas?",
          ],
          benchmark: "Empresas com processo comercial estruturado convertem 35% mais leads do que as que operam de forma ad hoc.",
          custoGap: {
            tipo: "percentual_faturamento",
            base: 0.04,
            descricao: "4% do faturamento mensal estimado como perda por ineficiência comercial e onboarding",
          },
        },
        {
          id: "P2",
          nome: "Financeiro e faturamento",
          peso: 0.15,
          naSugeridoPara: [],
          descricao: "Maturidade dos processos de controle financeiro, faturamento, fluxo de caixa e conciliação contábil.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Controle financeiro em planilhas pessoais ou na cabeça do dono. Faturamento manual com erros frequentes. Fluxo de caixa inexistente." },
            2: { nome: "Básico",      descricao: "Planilhas de controle básico. Faturamento com algum processo mas sujeito a atrasos e erros. DRE só no fechamento contábil." },
            3: { nome: "Estruturado", descricao: "Sistema financeiro implantado. Faturamento padronizado e rastreável. Fluxo de caixa mensal atualizado com projeção a 30 dias." },
            4: { nome: "Gerenciado",  descricao: "ERP financeiro integrado ao comercial. DRE e fluxo de caixa em tempo real. Conciliação automática. Orçamento vs. realizado acompanhado." },
            5: { nome: "Otimizado",   descricao: "Gestão financeira com IA preditiva. Previsão de recebíveis e inadimplência automatizada. Alertas de desvio em tempo real." },
          },
          perguntas: [
            "Como é feita a gestão do fluxo de caixa? Com que frequência a liderança consulta esse dado?",
            "O processo de faturamento é manual ou automático? Quais são os erros mais comuns?",
            "A empresa tem visibilidade da DRE (Demonstração de Resultado) em tempo real ou só no fechamento?",
            "Existem inadimplências recorrentes? Como elas são gerenciadas e cobradas?",
            "O financeiro está integrado ao sistema de vendas ou os dados precisam ser inseridos manualmente?",
          ],
          benchmark: "Empresas com gestão financeira estruturada reduzem inadimplência em 40% e identificam oportunidades de redução de custo 2x mais rápido.",
          custoGap: {
            tipo: "percentual_faturamento",
            base: 0.025,
            descricao: "2,5% do faturamento mensal estimado como perda por ineficiência financeira e faturamento",
          },
        },
        {
          id: "P3",
          nome: "Suporte e atendimento",
          peso: 0.15,
          naSugeridoPara: [],
          descricao: "Estrutura do processo de atendimento ao cliente, com canais definidos, SLAs e métricas de qualidade.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Atendimento por WhatsApp pessoal ou e-mail informal sem rastreamento. Sem SLA. Solicitações perdidas com frequência." },
            2: { nome: "Básico",      descricao: "Canal de suporte definido mas sem sistema de tickets. Tempo de resposta variável. Sem métricas de atendimento. Histórico por cliente inexistente." },
            3: { nome: "Estruturado", descricao: "Sistema de tickets implantado. SLAs básicos definidos e comunicados. Histórico de atendimento registrado e consultável." },
            4: { nome: "Gerenciado",  descricao: "Métricas acompanhadas regularmente (CSAT, TMA, FCR). Base de conhecimento ativa usada pela equipe. Escalação por gravidade definida." },
            5: { nome: "Otimizado",   descricao: "Atendimento omnichannel com IA. Chatbot resolve nível 1 automaticamente. Análise de sentimento e prevenção proativa de churn." },
          },
          perguntas: [
            "Como os clientes entram em contato para suporte? Existe um canal oficial e rastreável?",
            "Existe SLA de atendimento definido? A empresa consegue medir se está cumprindo?",
            "Com que frequência os clientes repetem a mesma dúvida ou problema? Existe base de conhecimento para isso?",
            "Como é medida a satisfação dos clientes com o atendimento?",
            "Qual é o tempo médio de resolução de um chamado? Esse dado é monitorado?",
          ],
          benchmark: "Empresas com sistema de tickets reduzem o tempo médio de resolução em 45% e aumentam o CSAT em 30%.",
          custoGap: {
            tipo: "percentual_faturamento",
            base: 0.03,
            descricao: "3% do faturamento mensal estimado como perda por ineficiência em suporte e atendimento",
          },
        },
        {
          id: "P4",
          nome: "Logística e operação",
          peso: 0.15,
          naSugeridoPara: ["servicos_b2b", "saude"],
          descricao: "Maturidade dos processos de logística, gestão de estoque, expedição e controle de operações físicas.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Processo logístico sem rastreamento. Entregas com atrasos frequentes. Inventário sem controle — rupturas e excessos são comuns." },
            2: { nome: "Básico",      descricao: "Processo básico de expedição documentado. Rastreamento manual de entregas. Inventário controlado em planilha desatualizada." },
            3: { nome: "Estruturado", descricao: "WMS básico ou integração com transportadoras. SLAs de entrega definidos e monitorados. Inventário atualizado regularmente." },
            4: { nome: "Gerenciado",  descricao: "Rastreamento de entrega em tempo real com visibilidade para o cliente. KPIs logísticos (on-time, custo por entrega, avarias). Reposição semi-automática." },
            5: { nome: "Otimizado",   descricao: "Otimização de rotas com IA. Previsão de demanda automática reduzindo rupturas. Supply chain end-to-end integrado e visível." },
          },
          perguntas: [
            "Como é gerenciado o processo de expedição — do pedido confirmado até a entrega ao cliente?",
            "A empresa tem visibilidade em tempo real do estoque? Como é feita a contagem e reposição?",
            "Quais são os principais problemas de logística hoje — atrasos, avarias, rupturas, custos elevados?",
            "Existe integração entre o sistema de pedidos e o processo de separação e expedição?",
            "Como o cliente acompanha o status da entrega? Existe comunicação proativa de atrasos?",
          ],
          benchmark: "Empresas com gestão logística estruturada reduzem o custo de entrega em 20% e o índice de devolução em 35%.",
          custoGap: {
            tipo: "percentual_faturamento",
            base: 0.035,
            descricao: "3,5% do faturamento mensal estimado como perda por ineficiência logística e operacional",
          },
        },
        {
          id: "P5",
          nome: "Marketing e geração de demanda",
          peso: 0.12,
          naSugeridoPara: [],
          descricao: "Estrutura da operação de marketing, com estratégia, budget definido e mensuração de resultado por canal.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Marketing inexistente ou baseado em indicações sem estrutura. Sem budget definido. Sem mensuração de resultado de qualquer ação." },
            2: { nome: "Básico",      descricao: "Presença básica em redes sociais. Ações pontuais sem estratégia definida. Budget informal. Resultados medidos apenas por feeling." },
            3: { nome: "Estruturado", descricao: "Estratégia de marketing documentada com calendário. Budget definido por canal. Métricas básicas de campanha monitoradas (leads, alcance)." },
            4: { nome: "Gerenciado",  descricao: "Funil de marketing integrado ao CRM. ROI por canal mensurado. Testes A/B ativos. Automação de e-mail e nurturing de leads implementada." },
            5: { nome: "Otimizado",   descricao: "Growth marketing com IA. Personalização em escala. Previsão de LTV e churn. Conteúdo gerado e otimizado com IA de forma contínua." },
          },
          perguntas: [
            "Qual é a principal fonte de novos clientes hoje — inbound, outbound, indicações, eventos?",
            "Existe um orçamento formal de marketing? Como é decidido quanto investir em cada canal?",
            "A empresa consegue medir o ROI das ações de marketing — custo por lead, custo de aquisição?",
            "Existe automação de marketing (e-mail marketing, régua de nutrição, reengajamento)?",
            "Qual canal de marketing gerou mais clientes nos últimos 6 meses?",
          ],
          benchmark: "Empresas com funil de marketing integrado ao CRM reduzem o CAC em 30% e aumentam a taxa de conversão em 25%.",
          custoGap: {
            tipo: "percentual_faturamento",
            base: 0.02,
            descricao: "2% do faturamento mensal estimado como perda por ineficiência em marketing e geração de demanda",
          },
        },
        {
          id: "P6",
          nome: "Indicadores e performance",
          peso: 0.12,
          naSugeridoPara: [],
          descricao: "Existência de KPIs operacionais com rituais de acompanhamento e capacidade de agir rapidamente sobre desvios.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem indicadores operacionais. Decisões tomadas por intuição. Nenhuma visibilidade sobre eficiência dos processos." },
            2: { nome: "Básico",      descricao: "Alguns KPIs básicos existem mas sem acompanhamento regular. Dados coletados manualmente com esforço. Sem responsável por cada indicador." },
            3: { nome: "Estruturado", descricao: "KPIs operacionais definidos por área. Relatórios mensais com responsáveis. Reuniões de resultado periódicas com pauta estruturada." },
            4: { nome: "Gerenciado",  descricao: "Dashboard operacional em tempo real acessível à equipe. Metas em cascata. Reuniões de ritmo semanais com agenda de dados e ações." },
            5: { nome: "Otimizado",   descricao: "BI com alertas preditivos. Cultura de dados — decisões em todos os níveis baseadas em evidências. Anomalias detectadas antes de virarem problema." },
          },
          perguntas: [
            "Quais indicadores operacionais a empresa acompanha hoje — produtividade, qualidade, prazo?",
            "Existe um dashboard operacional? Quem tem acesso e com que frequência é consultado?",
            "Quando um indicador fica abaixo da meta, qual é o processo de análise e resposta?",
            "Os KPIs operacionais são do conhecimento de toda a equipe ou apenas da liderança?",
            "Com que frequência são definidas ou revisadas as metas operacionais?",
          ],
          benchmark: "Equipes com KPIs claros e acompanhados regularmente são 20% mais produtivas e têm 30% menos retrabalho.",
          custoGap: {
            tipo: "percentual_faturamento",
            base: 0.015,
            descricao: "1,5% do faturamento mensal estimado como perda por falta de visibilidade operacional",
          },
        },
        {
          id: "P7",
          nome: "Automação e integração",
          peso: 0.13,
          naSugeridoPara: [],
          descricao: "Nível de automação de tarefas repetitivas e integração entre sistemas para eliminar trabalho manual desnecessário.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Zero automação na empresa. Tudo feito manualmente. Equipe sobrecarregada com tarefas repetitivas e previsíveis." },
            2: { nome: "Básico",      descricao: "Automações pontuais e não documentadas (macros de planilha, regras básicas). Dependência de pessoas específicas para manter funcionando." },
            3: { nome: "Estruturado", descricao: "Automações mapeadas e documentadas. Algumas integrações ativas entre sistemas. Ferramenta de automação adotada (Zapier, Make, n8n)." },
            4: { nome: "Gerenciado",  descricao: "Plataforma de automação com fluxos complexos. Integrações entre todos os sistemas críticos. RPA em processos selecionados de alto volume." },
            5: { nome: "Otimizado",   descricao: "Hyperautomation: IA + RPA + integração nativa. Processos manuais residuais < 10% do volume. Centro de excelência em automação ativo." },
          },
          perguntas: [
            "Quais tarefas a equipe realiza hoje que são repetitivas e poderiam ser automatizadas?",
            "A empresa usa alguma ferramenta de automação como Zapier, Make ou n8n?",
            "Existe algum processo que exige que um colaborador transfira dados de um sistema para outro manualmente?",
            "Quanto tempo por semana a equipe gasta em tarefas de baixo valor que poderiam ser automatizadas?",
            "Já foram tentadas automações que falharam? O que aconteceu?",
          ],
          benchmark: "Empresas com automação estruturada liberam em média 15 horas/mês por colaborador para atividades de maior valor agregado.",
          custoGap: {
            tipo: "horas_funcionarios",
            horasPorSemana: 3,
            semanasPorMes: 4.3,
            valorHora: 25,
            proporcao: 1.0,
            descricao: "Horas manuais desperdiçadas: Nº funcionários × 3h/semana × 4,3 semanas × R$25/h",
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PILAR 4 — GOVERNANÇA
    // ════════════════════════════════════════════════════════════════════════
    {
      id: "G",
      sigla: "G",
      nome: "Governança",
      peso: 0.15,
      cor: "#9B6DD4",
      objetivo: "Avaliar a maturidade corporativa: políticas, controles, compliance e capacidade de gestão de riscos.",
      entregas: [
        "Matriz de maturidade corporativa",
        "Gaps críticos de governança",
        "Roadmap de governança em 3 horizontes",
      ],
      dimensoes: [
        {
          id: "G1",
          nome: "Tomada de decisão e estrutura",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Clareza da estrutura organizacional, delegação de autoridade e processo de tomada de decisão na empresa.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Decisões totalmente centralizadas no fundador. Sem organograma definido. Sem delegação formal — tudo depende de aprovação do topo." },
            2: { nome: "Básico",      descricao: "Organograma existe mas papéis pouco claros. Decisões importantes sempre sobem para a liderança. Delegação informal e inconsistente." },
            3: { nome: "Estruturado", descricao: "Estrutura organizacional documentada. Matriz RACI básica. Algumas decisões delegadas formalmente com alçadas definidas." },
            4: { nome: "Gerenciado",  descricao: "Comitê de gestão ativo com reuniões regulares. Decisões tomadas com dados e processo definido. Alçadas claras por nível hierárquico." },
            5: { nome: "Otimizado",   descricao: "Governança ágil com OKRs em cascata. Decisões distribuídas com autonomia guiada por princípios. Board advisory funcional e ativo." },
          },
          perguntas: [
            "Como é a estrutura hierárquica da empresa? Existe organograma atualizado?",
            "Quais decisões precisam da aprovação do CEO/fundador? Existem alçadas formais para outros níveis?",
            "Existe algum comitê de gestão ou reunião executiva regular para decisões estratégicas?",
            "Quando há discordância sobre uma decisão importante, como ela é resolvida?",
            "A empresa usa alguma metodologia de gestão (OKR, BSC, MBO)?",
          ],
          benchmark: "Empresas com governança de decisão estruturada são 40% mais rápidas em implementar mudanças estratégicas.",
          custoGap: null,
        },
        {
          id: "G2",
          nome: "Políticas e compliance",
          peso: 0.16,
          naSugeridoPara: [],
          descricao: "Existência de políticas formais, contratos padronizados e processos de compliance com regulamentações aplicáveis.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem políticas formais documentadas. Sem contratos padronizados. Compliance com regulamentações inexistente ou desconhecido." },
            2: { nome: "Básico",      descricao: "Alguns contratos básicos existem. Políticas informais conhecidas pela equipe-chave mas não documentadas. Sem revisão periódica." },
            3: { nome: "Estruturado", descricao: "Políticas documentadas (TI, RH, financeiro, uso aceitável). Contratos padronizados por tipo de serviço. Compliance básico mapeado." },
            4: { nome: "Gerenciado",  descricao: "Políticas revisadas anualmente. Treinamento de compliance para equipe. Gestão de contratos com alertas de vencimento e renovação." },
            5: { nome: "Otimizado",   descricao: "GRC (Governance, Risk & Compliance) integrado em plataforma. Compliance as code. Auditoria contínua e automatizada." },
          },
          perguntas: [
            "A empresa tem políticas documentadas de RH, TI, uso de dados e conduta?",
            "Os contratos com clientes e fornecedores são padronizados e revisados por jurídico?",
            "Como a empresa acompanha o vencimento e renovação de contratos críticos?",
            "A equipe recebe treinamento sobre compliance, LGPD ou outras regulamentações aplicáveis?",
            "Quais são as principais obrigações regulatórias do setor que a empresa precisa cumprir?",
          ],
          benchmark: "Empresas com políticas formais reduzem litígios contratuais em 60% e tempo de auditoria em 40%.",
          custoGap: null,
        },
        {
          id: "G3",
          nome: "Gestão de riscos e continuidade",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Capacidade de identificar, avaliar e mitigar riscos operacionais, e de manter a operação em situações de crise.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem mapeamento de riscos. Plano de continuidade inexistente. Alta dependência de pessoas-chave sem backup. Sem seguros adequados." },
            2: { nome: "Básico",      descricao: "Riscos conhecidos informalmente pela liderança. Backup de dados ocasional. Sem plano de contingência documentado para cenários críticos." },
            3: { nome: "Estruturado", descricao: "Matriz de riscos básica documentada. Plano de continuidade (BCP) elaborado e comunicado. Backups testados periodicamente." },
            4: { nome: "Gerenciado",  descricao: "Risk register ativo com responsáveis e planos de mitigação. BCP testado pelo menos anualmente. Seguro empresarial adequado ao porte." },
            5: { nome: "Otimizado",   descricao: "ERM (Enterprise Risk Management) implementado. Monitoramento de riscos em tempo real com IA. Resiliência operacional demonstrada em simulações." },
          },
          perguntas: [
            "Quais são os 3 maiores riscos que poderiam paralisar a operação da empresa?",
            "Existe um plano documentado para o caso de perda de um sistema crítico ou de um colaborador-chave?",
            "A empresa testou seu plano de continuidade alguma vez? Qual foi o resultado?",
            "Como é feita a gestão de seguros da empresa? Estão adequados ao porte e aos riscos do negócio?",
            "Existe processo formal de avaliação de riscos antes de decisões estratégicas importantes?",
          ],
          benchmark: "Empresas sem plano de continuidade levam em média 3x mais tempo para se recuperar de crises do que as com BCP ativo.",
          custoGap: null,
        },
        {
          id: "G4",
          nome: "Gestão de acessos e fornecedores",
          peso: 0.16,
          naSugeridoPara: [],
          descricao: "Controle de quem acessa o quê nos sistemas da empresa, e gestão estruturada de fornecedores críticos.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Acessos compartilhados entre colaboradores. Sem controle de quem acessa quais sistemas. Fornecedores sem contratos formais." },
            2: { nome: "Básico",      descricao: "Senhas individuais mas sem gestão centralizada. Lista de fornecedores existe mas sem gestão ativa. Contratos informais ou desatualizados." },
            3: { nome: "Estruturado", descricao: "IAM básico implementado. Política de acesso por função documentada. Contratos com fornecedores críticos atualizados e arquivados." },
            4: { nome: "Gerenciado",  descricao: "SSO e MFA em sistemas críticos. Revisão periódica de acessos. SLAs com fornecedores críticos. Processo de avaliação de fornecedores ativo." },
            5: { nome: "Otimizado",   descricao: "Privileged Access Management (PAM) implementado. Zero trust para fornecedores externos. Automação de onboarding e offboarding de acessos." },
          },
          perguntas: [
            "Quando um colaborador sai da empresa, como são revogados os acessos aos sistemas? Em quanto tempo?",
            "Existem credenciais compartilhadas entre membros da equipe para algum sistema crítico?",
            "A empresa tem inventário de todos os fornecedores com acesso a seus sistemas ou dados?",
            "Como é avaliada a criticidade de cada fornecedor? Existe plano de contingência para os mais críticos?",
            "Existe política de MFA (autenticação em dois fatores) para sistemas críticos?",
          ],
          benchmark: "70% dos incidentes de segurança envolvem credenciais comprometidas. Empresas com MFA reduzem esse risco em 99,9%.",
          custoGap: null,
        },
        {
          id: "G5",
          nome: "Indicadores e controles de gestão",
          peso: 0.16,
          naSugeridoPara: [],
          descricao: "Existência de indicadores de saúde corporativa com visibilidade da liderança e controles preventivos de desvios.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem indicadores de governança. Visibilidade da saúde da empresa limitada ao saldo bancário. Controles financeiros e operacionais inexistentes." },
            2: { nome: "Básico",      descricao: "Alguns relatórios financeiros básicos. Sem indicadores de risco ou controles operacionais. Visão pontual e desatualizada." },
            3: { nome: "Estruturado", descricao: "Conjunto básico de indicadores de gestão (financeiro, operacional, RH). Revisão mensal pela diretoria. Controles básicos de alçada." },
            4: { nome: "Gerenciado",  descricao: "Dashboard executivo com KRIs (Key Risk Indicators). Balanced Scorecard ou similar implementado. Early warnings automáticos de desvios." },
            5: { nome: "Otimizado",   descricao: "GRC dashboard em tempo real com IA para detecção de anomalias. Governança orientada a dados em todos os níveis. Relatórios regulatórios automatizados." },
          },
          perguntas: [
            "Quais indicadores a liderança usa para avaliar a saúde geral da empresa — além do faturamento?",
            "Existe algum controle que detecta automaticamente desvios financeiros ou operacionais?",
            "Com que frequência a diretoria revisa indicadores de governança e risco?",
            "A empresa tem indicadores de RH (turnover, engajamento, absenteísmo)? São acompanhados?",
            "Como são gerados os relatórios executivos hoje — manual ou automatizado?",
          ],
          benchmark: "Empresas com dashboard executivo ativo reduzem o tempo de detecção de problemas críticos de semanas para horas.",
          custoGap: null,
        },
        {
          id: "G6",
          nome: "Governança de TI e IA",
          peso: 0.16,
          naSugeridoPara: [],
          descricao: "Estrutura de governança das tecnologias e do uso de Inteligência Artificial na empresa, com políticas, roadmap e responsáveis.",
          criterios: {
            1: { nome: "Caótico",     descricao: "TI sem governança. Compras de tecnologia ad hoc sem critério. IA usada individualmente sem política. Shadow IT prevalente." },
            2: { nome: "Básico",      descricao: "Alguns padrões de TI informais. IA usada por alguns colaboradores sem política formal. Inventário de sistemas desatualizado ou inexistente." },
            3: { nome: "Estruturado", descricao: "Responsável de TI ou comitê designado. Política básica de uso de IA documentada. Inventário de sistemas atualizado. Roadmap tecnológico esboçado." },
            4: { nome: "Gerenciado",  descricao: "ITIL básico implementado. Política de IA com diretrizes de uso, privacidade e ética. Roadmap de tecnologia com budget aprovado." },
            5: { nome: "Otimizado",   descricao: "Digital governance framework completo. IA governance com ética, risco e compliance integrados. Chief AI Officer ou equivalente designado." },
          },
          perguntas: [
            "Existe uma política de uso de IA (ChatGPT, Copilot, etc.) na empresa? Os colaboradores sabem o que podem e não podem fazer?",
            "Quem é responsável pelas decisões de tecnologia na empresa? Existe comitê ou é centralizado no fundador?",
            "Como são tomadas decisões de compra de novas ferramentas de tecnologia?",
            "A empresa tem roadmap de tecnologia para os próximos 12-24 meses?",
            "Existem ferramentas de IA ou automação sendo usadas pelos colaboradores sem aprovação da empresa (shadow IT)?",
          ],
          benchmark: "Empresas com governança de IA estruturada implementam casos de uso com 3x mais sucesso do que as sem política formal.",
          custoGap: null,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PILAR 5 — INTELIGÊNCIA ARTIFICIAL
    // ════════════════════════════════════════════════════════════════════════
    {
      id: "IA",
      sigla: "IA",
      nome: "Inteligência Artificial",
      peso: 0.20,
      cor: "#E24B4A",
      objetivo: "Revelar onde IA gera ganho real de produtividade e receita — o potencial não aproveitado pela empresa.",
      entregas: [
        "Mapa de oportunidades de IA por área",
        "Quick wins com prazo e ROI estimado",
        "Potencial de ganho mensal e anual em R$",
        "Priorização executiva das iniciativas de IA",
      ],
      dimensoes: [
        {
          id: "IA1",
          nome: "Atendimento com IA",
          peso: 0.20,
          naSugeridoPara: [],
          descricao: "Uso de IA para automatizar e escalar o atendimento ao cliente, reduzindo carga manual e melhorando experiência.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Atendimento 100% manual. Sem nenhuma automação. Equipe sobrecarregada com perguntas repetitivas e previsíveis." },
            2: { nome: "Básico",      descricao: "FAQ estático ou chatbot de botões (fluxo fixo sem IA). Automatiza menos de 10% dos atendimentos. Sem integração ao CRM." },
            3: { nome: "Estruturado", descricao: "Chatbot com IA (GPT ou similar) implementado em pelo menos um canal. Resolve 20-40% dos atendimentos. Integrado ao canal principal." },
            4: { nome: "Gerenciado",  descricao: "IA em múltiplos canais (WhatsApp, chat, e-mail). Taxa de deflexão acima de 50%. Integrado ao CRM com histórico de atendimento." },
            5: { nome: "Otimizado",   descricao: "Atendimento omnichannel com IA. Resolução autônoma superior a 70% dos casos. Análise de sentimento e handoff inteligente para humano." },
          },
          perguntas: [
            "Qual é o volume mensal de atendimentos (chats, e-mails, ligações) e quantas pessoas são necessárias para isso?",
            "Quais são as 5 perguntas mais frequentes recebidas pela equipe de atendimento?",
            "A empresa já testou chatbot ou automação de atendimento? Qual foi a experiência?",
            "Se um chatbot pudesse resolver 50% dos atendimentos, quanto tempo a equipe recuperaria por mês?",
            "Como o cliente seria impactado se o atendimento fosse respondido em menos de 1 minuto, 24h por dia?",
          ],
          benchmark: "Empresas que implementam IA no atendimento reduzem o custo por interação em 60% e aumentam a satisfação do cliente em 20%.",
          potencialIA: {
            tipo: "horas_funcionarios",
            proporcao: 0.30,
            horasPorSemana: 6,
            semanasPorMes: 4.3,
            valorHora: 28,
            descricao: "30% dos funcionários × 6h/semana × 4,3 semanas × R$28/h = potencial recuperado com IA",
          },
        },
        {
          id: "IA2",
          nome: "IA no comercial e marketing",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Uso de IA para qualificar leads, personalizar propostas, criar conteúdo e aumentar a taxa de conversão comercial.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Prospecção e marketing 100% manuais. Sem personalização. Sem análise de dados de clientes para orientar ações comerciais." },
            2: { nome: "Básico",      descricao: "Uso pessoal e informal de ChatGPT para criar textos. Sem integração com CRM ou processos de venda. Adoção isolada." },
            3: { nome: "Estruturado", descricao: "IA usada para criação de conteúdo e qualificação básica de leads. Algumas campanhas com personalização por segmento." },
            4: { nome: "Gerenciado",  descricao: "IA no scoring de leads, geração de propostas personalizadas e recomendação de produtos. ROI de marketing mensurado com apoio de IA." },
            5: { nome: "Otimizado",   descricao: "Hyper-personalização em escala com IA. Previsão de churn e LTV integrada ao CRM. Agente de vendas autônomo para qualificação de inbound." },
          },
          perguntas: [
            "A equipe de vendas ou marketing usa IA hoje? De que forma (pessoal ou integrada ao processo)?",
            "Como são criados os conteúdos de marketing — e-mail, posts, propostas? Quanto tempo isso leva?",
            "A empresa consegue personalizar a comunicação para diferentes perfis de cliente em escala?",
            "Existe alguma ferramenta de IA integrada ao CRM para scoring ou priorização de leads?",
            "Se a IA pudesse gerar propostas comerciais personalizadas em 2 minutos, qual seria o impacto nas vendas?",
          ],
          benchmark: "Empresas com IA no comercial aumentam a taxa de conversão em 30% e reduzem o ciclo de venda em 25%.",
          potencialIA: {
            tipo: "percentual_faturamento",
            base: 0.05,
            descricao: "5% do faturamento mensal como potencial de ganho com IA no comercial e marketing",
          },
        },
        {
          id: "IA3",
          nome: "IA em operações e processos",
          peso: 0.18,
          naSugeridoPara: [],
          descricao: "Uso de IA e RPA para automatizar processos operacionais repetitivos, reduzindo retrabalho e aumentando produtividade.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Operações 100% manuais. Sem RPA ou automação inteligente. A equipe executa trabalho repetitivo de alto volume todos os dias." },
            2: { nome: "Básico",      descricao: "Automações básicas com planilhas ou macros. Sem IA em processos operacionais. Cada processo depende de esforço manual significativo." },
            3: { nome: "Estruturado", descricao: "RPA ou IA aplicada em 1-2 processos específicos. Redução mensurável de trabalho manual. Caso de uso documentado com ROI calculado." },
            4: { nome: "Gerenciado",  descricao: "IA em múltiplos processos operacionais (financeiro, logístico, RH). Economia de horas documentada. Centro de excelência em automação criado." },
            5: { nome: "Otimizado",   descricao: "Hyperautomation com IA cognitiva. Leitura automática de documentos, decisões de roteamento e aprovação. Processos manuais < 10% do volume." },
          },
          perguntas: [
            "Quais são os 3 processos internos que mais consomem tempo da equipe de forma repetitiva?",
            "A empresa já implementou RPA ou IA em algum processo operacional? Com qual resultado?",
            "Existem processos que envolvem leitura de documentos, notas fiscais ou e-mails para extrair informação?",
            "Quantas horas por semana a equipe gasta em tarefas que poderiam ser feitas por IA?",
            "Se os processos operacionais mais repetitivos fossem automatizados, para onde a equipe redirecionaria seu tempo?",
          ],
          benchmark: "Empresas com automação de processos operacionais reduzem erros em 80% e liberam 15h/mês por colaborador.",
          potencialIA: {
            tipo: "horas_funcionarios",
            proporcao: 1.0,
            horasPorSemana: 5,
            semanasPorMes: 4.3,
            valorHora: 25,
            descricao: "100% dos funcionários × 5h/semana × 4,3 semanas × R$25/h = potencial recuperado com IA operacional",
          },
        },
        {
          id: "IA4",
          nome: "Analytics e BI com IA",
          peso: 0.17,
          naSugeridoPara: [],
          descricao: "Uso de BI e análise preditiva com IA para transformar dados em insights acionáveis para a tomada de decisão.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem BI. Decisões baseadas em feeling. Dados existentes em planilhas desatualizadas e inconsistentes." },
            2: { nome: "Básico",      descricao: "Relatórios manuais gerados sob demanda em planilhas. BI básico sem IA. Dados coletados com esforço e sujeitos a erro." },
            3: { nome: "Estruturado", descricao: "Dashboard de BI implementado (Power BI, Looker, Metabase etc.). Dados centralizados com atualização automática. Acesso pela liderança." },
            4: { nome: "Gerenciado",  descricao: "BI com análise preditiva. Forecasting automatizado de vendas e demanda. Self-service analytics disponível para gestores." },
            5: { nome: "Otimizado",   descricao: "IA generativa no BI — perguntas em linguagem natural sobre dados. Insights proativos enviados automaticamente. Modelos preditivos em produção." },
          },
          perguntas: [
            "A empresa usa alguma ferramenta de BI (Power BI, Looker, Metabase, Google Data Studio)?",
            "Como são gerados os relatórios gerenciais — automático ou manual? Quanto tempo leva?",
            "A liderança consegue responder perguntas sobre o negócio em tempo real, ou precisa esperar relatórios?",
            "A empresa já faz previsão de vendas ou demanda com modelos quantitativos?",
            "Se existisse um assistente de IA que respondesse perguntas sobre os dados da empresa, quais seriam as 3 primeiras perguntas?",
          ],
          benchmark: "Empresas com BI avançado tomam decisões 5x mais rápido e identificam oportunidades de redução de custo 3x mais cedo.",
          potencialIA: {
            tipo: "percentual_faturamento",
            base: 0.03,
            descricao: "3% do faturamento mensal como potencial de ganho com BI e analytics avançado",
          },
        },
        {
          id: "IA5",
          nome: "IA em documentos e conhecimento",
          peso: 0.14,
          naSugeridoPara: [],
          descricao: "Uso de IA para organizar, buscar e gerar documentos, contratos, relatórios e bases de conhecimento corporativo.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Documentação inexistente ou em pastas desorganizadas. Conhecimento concentrado nas pessoas. Busca de informação consome horas." },
            2: { nome: "Básico",      descricao: "Documentos em pastas no Google Drive ou OneDrive sem estrutura. Busca manual e demorada. Sem uso de IA para documentos." },
            3: { nome: "Estruturado", descricao: "Base de conhecimento organizada (Notion, Confluence). Uso de IA (ChatGPT) para criar documentos. Adoção parcial pela equipe." },
            4: { nome: "Gerenciado",  descricao: "Knowledge base com IA embarcada. Geração automática de atas de reunião e relatórios. Busca inteligente por conteúdo interno." },
            5: { nome: "Otimizado",   descricao: "Enterprise knowledge graph com IA. Respostas automáticas baseadas em documentos internos. Zero perda de conhecimento com saída de colaboradores." },
          },
          perguntas: [
            "Como os documentos da empresa estão organizados? É fácil encontrar o que precisa?",
            "Quanto tempo um colaborador novo leva para encontrar informações relevantes sobre processos e políticas?",
            "A equipe usa IA para criar ou revisar documentos, contratos, apresentações ou relatórios?",
            "Existe base de conhecimento (wiki, Notion, Confluence) com processos e políticas documentados?",
            "Quando um colaborador experiente sai, como o conhecimento dele é preservado na empresa?",
          ],
          benchmark: "Colaboradores gastam em média 1,8h/dia buscando informações. IA em documentos reduz esse tempo em 70%.",
          potencialIA: {
            tipo: "horas_funcionarios",
            proporcao: 1.0,
            horasPorSemana: 2,
            semanasPorMes: 4.3,
            valorHora: 30,
            descricao: "100% dos funcionários × 2h/semana × 4,3 semanas × R$30/h = potencial recuperado com IA em documentos",
          },
        },
        {
          id: "IA6",
          nome: "Governança e estratégia de IA",
          peso: 0.13,
          naSugeridoPara: [],
          descricao: "Maturidade da visão estratégica, política e gestão de IA na empresa — do uso informal ao programa estruturado.",
          criterios: {
            1: { nome: "Caótico",     descricao: "Sem estratégia de IA. Uso individual e não gerenciado por alguns colaboradores. Sem política, sem budget e sem roadmap." },
            2: { nome: "Básico",      descricao: "IA usada ad hoc por alguns colaboradores. Sem política formal ou responsável. Resultados inconsistentes e não medidos." },
            3: { nome: "Estruturado", descricao: "Política básica de uso de IA documentada. Budget inicial definido para projetos de IA. Casos de uso priorizados com critério." },
            4: { nome: "Gerenciado",  descricao: "Roadmap de IA com cases priorizados por ROI. Responsável designado (CDO ou equivalente). Métricas de impacto acompanhadas." },
            5: { nome: "Otimizado",   descricao: "Centro de Excelência de IA ativo. Ética e governança de IA formalizadas. IA como vantagem competitiva central no posicionamento da empresa." },
          },
          perguntas: [
            "A empresa tem uma visão clara de onde IA pode gerar mais valor nos próximos 12 meses?",
            "Existe alguém na empresa responsável por liderar a agenda de IA e automação?",
            "Há budget aprovado para projetos de IA? Qual é a ordem de grandeza desse investimento?",
            "A empresa tem política sobre o que pode ou não ser enviado para ferramentas de IA externas?",
            "Como a empresa avalia e prioriza casos de uso de IA — existe critério formal?",
          ],
          benchmark: "Empresas com estratégia de IA estruturada têm 3x mais chances de alcançar ROI positivo em projetos de IA no primeiro ano.",
          potencialIA: {
            tipo: "percentual_faturamento",
            base: 0.02,
            descricao: "2% do faturamento mensal como potencial de ganho com governança e estratégia de IA estruturada",
          },
        },
      ],
    },
  ],

  // ─── Fórmula IMD ─────────────────────────────────────────────────────────

  /**
   * IMD = (N×0,15 + T×0,25 + P×0,25 + G×0,15 + IA×0,20) × 20
   * Score pilar = (Σ score_i × peso_i / Σ peso_i das ativas) × 20
   * Score pilar range: 20–100 (nível 1 a 5 convertido × 20)
   */

  calcularScorePilar(dimensoes, scores) {
    let somaPonderada = 0;
    let somaPesos = 0;
    dimensoes.forEach(dim => {
      const s = scores[dim.id];
      if (s && s.score !== null && !s.na) {
        somaPonderada += s.score * dim.peso;
        somaPesos += dim.peso;
      }
    });
    if (somaPesos === 0) return null;
    return (somaPonderada / somaPesos) * 20;
  },

  calcularIMD(scoresPorPilar) {
    let soma = 0;
    let somaPesos = 0;
    this.pilares.forEach(p => {
      const s = scoresPorPilar[p.id];
      if (s !== null && s !== undefined) {
        soma += s * p.peso;
        somaPesos += p.peso;
      }
    });
    if (somaPesos === 0) return null;
    return soma / somaPesos;
  },

  calcularCustoGap(custoGap, nivel, faturamento, funcionarios) {
    if (!custoGap || nivel === 5) return 0;
    const fator = this.fatoresGap[nivel] || 0;
    if (custoGap.tipo === "percentual_faturamento") {
      return faturamento * custoGap.base * fator;
    }
    if (custoGap.tipo === "horas_funcionarios") {
      const proporcao = custoGap.proporcao || 1.0;
      return funcionarios * proporcao * custoGap.horasPorSemana * custoGap.semanasPorMes * custoGap.valorHora * fator;
    }
    return 0;
  },

  calcularPotencialIA(potencialIA, nivel, faturamento, funcionarios) {
    if (!potencialIA) return 0;
    const fator = this.fatoresIA[nivel] || 0;
    if (potencialIA.tipo === "percentual_faturamento") {
      return faturamento * potencialIA.base * fator;
    }
    if (potencialIA.tipo === "horas_funcionarios") {
      const proporcao = potencialIA.proporcao || 1.0;
      return funcionarios * proporcao * potencialIA.horasPorSemana * potencialIA.semanasPorMes * potencialIA.valorHora * fator;
    }
    return 0;
  },

  getFaixaIMD(imd) {
    return this.faixasIMD.find(f => imd >= f.min && imd <= f.max) || this.faixasIMD[0];
  },

  getPilar(id) {
    return this.pilares.find(p => p.id === id);
  },

  getDimensao(dimensaoId) {
    for (const pilar of this.pilares) {
      const dim = pilar.dimensoes.find(d => d.id === dimensaoId);
      if (dim) return { pilar, dimensao: dim };
    }
    return null;
  },
};
