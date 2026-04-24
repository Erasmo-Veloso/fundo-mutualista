import { Prisma, PrismaClient, TipoBeneficio } from "@prisma/client";

const prisma = new PrismaClient();

type BeneficioSeed = {
  nome: string;
  descricao: string;
  comoUtilizar: string;
  tipo: TipoBeneficio;
  configuracao: Record<string, unknown>;
  parceiro?: string;
  logoUrl?: string;
  validade?: Date;
  limitUsos?: number | null;
};

const validade12Meses = new Date();
validade12Meses.setMonth(validade12Meses.getMonth() + 12);

const validade18Meses = new Date();
validade18Meses.setMonth(validade18Meses.getMonth() + 18);

const validade24Meses = new Date();
validade24Meses.setMonth(validade24Meses.getMonth() + 24);

const PATENTES = [
  {
    nome: "Semente",
    descricao: "O teu primeiro passo. Bem-vindo à comunidade.",
    limiarKz: 0,
    cor: "#B4B2A9",
    icone: "seedling",
    ordem: 1,
  },
  {
    nome: "Raiz",
    descricao: "As tuas contribuições começam a criar raízes.",
    limiarKz: 10000,
    cor: "#CD7F32",
    icone: "bronze-medal",
    ordem: 2,
  },
  {
    nome: "Árvore",
    descricao: "Cresceste. O teu impacto já é visível na comunidade.",
    limiarKz: 30000,
    cor: "#C0C0C0",
    icone: "silver-medal",
    ordem: 3,
  },
  {
    nome: "Floresta",
    descricao: "O nível mais alto. O teu compromisso transforma vidas.",
    limiarKz: 60000,
    cor: "#EF9F27",
    icone: "gold-medal",
    ordem: 4,
  },
] as const;

const BENEFICIOS_POR_PATENTE: Record<string, BeneficioSeed[]> = {
  Semente: [
    {
      nome: "Acesso à Rede de Apoio Base",
      descricao:
        "Acesso inicial à rede de apoio da plataforma, com recursos essenciais, orientação básica e canais de suporte prioritário para integração académica.",
      comoUtilizar:
        "1. Entra na área de Benefícios.\n2. Activa este benefício.\n3. Consulta os recursos disponíveis na rede de apoio base.\n4. Usa os contactos e materiais recomendados conforme a tua necessidade.",
      tipo: TipoBeneficio.REDE_APOIO_PRIORITARIO,
      configuracao: {
        recursos: [
          "Guia de adaptação universitária",
          "Canal de apoio académico",
          "Calendário de oportunidades",
        ],
        duracaoMeses: 6,
      },
      parceiro: "FundoMutualista",
      limitUsos: null,
    },
    {
      nome: "1 Sessão de Mentoria de Boas-Vindas",
      descricao:
        "Sessão individual de mentoria para orientar o estudante no arranque do seu percurso académico e na utilização da plataforma.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Recebe o contacto do mentor atribuído.\n3. Agenda a sessão no período disponível.\n4. Participa na sessão de acolhimento e planeamento.",
      tipo: TipoBeneficio.MENTORIA_INDIVIDUAL,
      configuracao: {
        sessoesIncluidas: 1,
        duracaoMinutos: 45,
        area: "Integração académica",
        formato: "Online",
      },
      parceiro: "Rede de Mentores FundoMutualista",
      limitUsos: 1,
      validade: validade12Meses,
    },
  ],
  Raiz: [
    {
      nome: "Desconto 15% na Universidade Parceira A",
      descricao:
        "Desconto de 15% aplicável em propinas ou emolumentos elegíveis na Universidade Parceira A, mediante cumprimento das condições do programa.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Copia o código gerado.\n3. Apresenta o código na Universidade Parceira A no acto de candidatura ou pagamento.\n4. Confirma a aplicação do desconto junto do parceiro.",
      tipo: TipoBeneficio.DESCONTO_UNIVERSIDADE,
      configuracao: {
        universidade: "Universidade Parceira A",
        percentagem: 15,
        condicoes:
          "Aplicável a novas inscrições e renovações elegíveis, sujeito à validação do parceiro.",
        validadeMeses: 12,
      },
      parceiro: "Universidade Parceira A",
      logoUrl:
        "https://dummyimage.com/200x80/0f6e56/ffffff&text=Universidade+A",
      validade: validade12Meses,
      limitUsos: 1,
    },
    {
      nome: "Curso Online de Produtividade",
      descricao:
        "Acesso a um curso online focado em produtividade, organização do estudo e gestão de tempo para estudantes universitários.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Abre o link de acesso recebido.\n3. Cria ou valida a tua conta na plataforma.\n4. Conclui os módulos ao teu ritmo dentro da validade do benefício.",
      tipo: TipoBeneficio.CURSO_ONLINE,
      configuracao: {
        curso: "Produtividade para Estudantes",
        plataforma: "Academia Futuro",
        duracao: "8 horas",
        area: "Desenvolvimento pessoal",
        linkAcesso: "https://academia-futuro.example.com/produtividade",
      },
      parceiro: "Academia Futuro",
      logoUrl:
        "https://dummyimage.com/200x80/534ab7/ffffff&text=Academia+Futuro",
      validade: validade12Meses,
      limitUsos: 1,
    },
    {
      nome: "Desconto 10% em Material Escolar",
      descricao:
        "Desconto de 10% em material escolar e universitário essencial através de parceiro autorizado da plataforma.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Usa o código gerado na loja parceira.\n3. Aplica o desconto em produtos elegíveis.\n4. Finaliza a compra dentro do período de validade.",
      tipo: TipoBeneficio.DESCONTO_MATERIAL,
      configuracao: {
        parceiro: "Papelaria Saber+",
        tipoDesconto: "Percentual",
        valor: 10,
        limiteUsos: 3,
      },
      parceiro: "Papelaria Saber+",
      logoUrl: "https://dummyimage.com/200x80/ef9f27/ffffff&text=Saber%2B",
      validade: validade12Meses,
      limitUsos: 3,
    },
    {
      nome: "Apoio Emergencial até 15.000 Kz",
      descricao:
        "Acesso ampliado a pedidos de apoio emergencial até ao limite de 15.000 Kz para situações justificadas e validadas.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Acede à área de Apoio Emergencial.\n3. Submete a tua solicitação com documentos justificativos.\n4. Aguarda a análise da equipa administrativa.",
      tipo: TipoBeneficio.APOIO_EMERGENCIAL_ALARGADO,
      configuracao: {
        valorMaximo: 15000,
        pedidosPorAno: 1,
      },
      parceiro: "FundoMutualista",
      validade: validade12Meses,
      limitUsos: 1,
    },
  ],
  Árvore: [
    {
      nome: "Elegível para Bolsa Parcial 25%",
      descricao:
        "Elegibilidade para candidatura a bolsa parcial com cobertura até 25%, sujeita aos critérios académicos e institucionais definidos.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Acede à área de Bolsas.\n3. Submete a candidatura com os documentos necessários.\n4. Aguarda a validação da equipa e da universidade elegível.",
      tipo: TipoBeneficio.BOLSA_PARCIAL,
      configuracao: {
        percentagemCobertura: 25,
        universidades: [
          "Universidade Parceira A",
          "Instituto Superior Técnico Comunitário",
        ],
        mediaMinima: 14,
      },
      parceiro: "FundoMutualista",
      validade: validade18Meses,
      limitUsos: 1,
    },
    {
      nome: "Desconto 25% na Universidade Parceira B",
      descricao:
        "Desconto de 25% em propinas elegíveis na Universidade Parceira B para estudantes que atinjam a patente Árvore.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Usa o código emitido pela plataforma.\n3. Entrega o código no balcão financeiro ou no portal do parceiro.\n4. Confirma a aplicação do desconto.",
      tipo: TipoBeneficio.DESCONTO_UNIVERSIDADE,
      configuracao: {
        universidade: "Universidade Parceira B",
        percentagem: 25,
        condicoes:
          "Válido para cursos elegíveis e limitado a uma inscrição activa por estudante.",
        validadeMeses: 18,
      },
      parceiro: "Universidade Parceira B",
      logoUrl:
        "https://dummyimage.com/200x80/1d9e75/ffffff&text=Universidade+B",
      validade: validade18Meses,
      limitUsos: 1,
    },
    {
      nome: "3 Sessões de Mentoria Individual",
      descricao:
        "Pacote de 3 sessões individuais de mentoria para apoio académico, planeamento de carreira e desenvolvimento de competências.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Escolhe a área de mentoria.\n3. Agenda as sessões com o mentor atribuído.\n4. Conclui as sessões dentro do período de validade.",
      tipo: TipoBeneficio.MENTORIA_INDIVIDUAL,
      configuracao: {
        sessoesIncluidas: 3,
        duracaoMinutos: 60,
        area: "Carreira e desenvolvimento académico",
        formato: "Online ou híbrido",
      },
      parceiro: "Rede de Mentores FundoMutualista",
      validade: validade18Meses,
      limitUsos: 3,
    },
    {
      nome: "Certificação em Gestão de Projectos",
      descricao:
        "Acesso a uma certificação profissional introdutória em gestão de projectos com emissão de comprovativo final.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Usa o código ou link de acesso.\n3. Conclui os módulos obrigatórios.\n4. Realiza a avaliação final para emissão do certificado.",
      tipo: TipoBeneficio.CERTIFICACAO_PROFISSIONAL,
      configuracao: {
        nome: "Fundamentos de Gestão de Projectos",
        entidade: "Instituto Profissional Ágil",
        validadeMeses: 18,
        requisitos:
          "Ensino médio concluído e disponibilidade para avaliação final.",
      },
      parceiro: "Instituto Profissional Ágil",
      logoUrl: "https://dummyimage.com/200x80/444441/ffffff&text=IPA",
      validade: validade18Meses,
      limitUsos: 1,
    },
    {
      nome: "Prioridade em Candidaturas",
      descricao:
        "Benefício que atribui maior prioridade e pontuação adicional em processos internos elegíveis da plataforma.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Submete a candidatura ao programa desejado.\n3. O sistema aplica automaticamente a priorização quando elegível.",
      tipo: TipoBeneficio.PRIORIDADE_CANDIDATURA,
      configuracao: {
        tipoPrioridade: "Interna",
        multiplicadorPontuacao: 1.25,
      },
      parceiro: "FundoMutualista",
      validade: validade18Meses,
      limitUsos: null,
    },
    {
      nome: "Apoio Emergencial até 35.000 Kz",
      descricao:
        "Eleva o limite máximo de apoio emergencial disponível para 35.000 Kz em casos devidamente comprovados.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Acede à área de Apoio Emergencial.\n3. Submete a solicitação com a documentação necessária.\n4. Aguarda a análise da equipa.",
      tipo: TipoBeneficio.APOIO_EMERGENCIAL_ALARGADO,
      configuracao: {
        valorMaximo: 35000,
        pedidosPorAno: 2,
      },
      parceiro: "FundoMutualista",
      validade: validade18Meses,
      limitUsos: 2,
    },
  ],
  Floresta: [
    {
      nome: "Elegível para Bolsa Integral",
      descricao:
        "Elegibilidade para bolsa integral em instituições parceiras, sujeita a desempenho académico e critérios institucionais.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Entra na área de Bolsas.\n3. Submete a candidatura com documentação completa.\n4. Acompanha o estado da avaliação na plataforma.",
      tipo: TipoBeneficio.BOLSA_INTEGRAL,
      configuracao: {
        universidades: [
          "Universidade Parceira A",
          "Universidade Parceira B",
          "Instituto Superior Técnico Comunitário",
        ],
        mediaMinima: 16,
        duracaoMaxAnos: 5,
      },
      parceiro: "FundoMutualista",
      validade: validade24Meses,
      limitUsos: 1,
    },
    {
      nome: "Desconto 40% em qualquer Universidade Parceira",
      descricao:
        "Desconto premium de 40% aplicável em universidades parceiras aderentes da rede FundoMutualista.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Usa o código gerado pela plataforma.\n3. Valida com a universidade parceira pretendida.\n4. Formaliza a candidatura ou renovação com o desconto aplicado.",
      tipo: TipoBeneficio.DESCONTO_UNIVERSIDADE,
      configuracao: {
        universidade: "Qualquer Universidade Parceira",
        percentagem: 40,
        condicoes:
          "Aplicável apenas a instituições aderentes e sujeito à disponibilidade do parceiro.",
        validadeMeses: 24,
      },
      parceiro: "Rede Universitária FundoMutualista",
      logoUrl:
        "https://dummyimage.com/200x80/0f6e56/ffffff&text=Rede+Universitaria",
      validade: validade24Meses,
      limitUsos: 1,
    },
    {
      nome: "6 Sessões de Mentoria Individual",
      descricao:
        "Pacote avançado de 6 sessões de mentoria individual para planeamento académico, carreira e liderança.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Escolhe a área de foco.\n3. Agenda as 6 sessões dentro do ciclo de validade.\n4. Acompanha a evolução com o mentor atribuído.",
      tipo: TipoBeneficio.MENTORIA_INDIVIDUAL,
      configuracao: {
        sessoesIncluidas: 6,
        duracaoMinutos: 60,
        area: "Liderança, carreira e excelência académica",
        formato: "Online, híbrido ou presencial",
      },
      parceiro: "Rede de Mentores FundoMutualista",
      validade: validade24Meses,
      limitUsos: 6,
    },
    {
      nome: "Acesso Rede de Apoio Prioritário Completo",
      descricao:
        "Acesso total à rede prioritária com acompanhamento alargado, recursos premium e encaminhamento preferencial.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Entra no painel da rede de apoio.\n3. Consulta os recursos avançados e canais exclusivos.\n4. Solicita acompanhamento prioritário quando necessário.",
      tipo: TipoBeneficio.REDE_APOIO_PRIORITARIO,
      configuracao: {
        recursos: [
          "Acompanhamento prioritário",
          "Rede de especialistas",
          "Materiais premium",
          "Encaminhamento institucional",
        ],
        duracaoMeses: 24,
      },
      parceiro: "FundoMutualista",
      validade: validade24Meses,
      limitUsos: null,
    },
    {
      nome: "Apoio Emergencial até 75.000 Kz",
      descricao:
        "Amplia significativamente a capacidade de apoio emergencial para responder a situações críticas devidamente comprovadas.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Preenche a solicitação na área de Apoio Emergencial.\n3. Anexa comprovativos da situação.\n4. Aguarda decisão prioritária da equipa.",
      tipo: TipoBeneficio.APOIO_EMERGENCIAL_ALARGADO,
      configuracao: {
        valorMaximo: 75000,
        pedidosPorAno: 3,
      },
      parceiro: "FundoMutualista",
      validade: validade24Meses,
      limitUsos: 3,
    },
    {
      nome: "Certificação Avançada à escolha",
      descricao:
        "Possibilidade de seleccionar uma certificação profissional avançada numa área elegível da rede de parceiros.",
      comoUtilizar:
        "1. Activa o benefício.\n2. Escolhe uma certificação disponível no catálogo elegível.\n3. Recebe o link ou código de acesso.\n4. Conclui a certificação dentro do prazo.",
      tipo: TipoBeneficio.CERTIFICACAO_PROFISSIONAL,
      configuracao: {
        nome: "Certificação Avançada Personalizada",
        entidade: "Catálogo Parceiro FundoMutualista",
        validadeMeses: 24,
        requisitos:
          "Escolha sujeita a disponibilidade do catálogo e validação do perfil do estudante.",
      },
      parceiro: "Catálogo Parceiro FundoMutualista",
      logoUrl:
        "https://dummyimage.com/200x80/7f77dd/ffffff&text=Certificacao+Avancada",
      validade: validade24Meses,
      limitUsos: 1,
    },
  ],
};

async function limparDados() {
  await prisma.beneficioEstudante.deleteMany();
  await prisma.patenteEstudante.deleteMany();
  await prisma.notificacao.deleteMany({
    where: {
      tipo: {
        in: [
          "BENEFICIO_DESBLOQUEADO",
          "BENEFICIO_ACTIVADO",
          "PATENTE_ALCANCADA",
        ],
      },
    },
  });
  await prisma.patentesBeneficios.deleteMany();
  await prisma.beneficio.deleteMany();
  await prisma.patente.deleteMany();
}

async function seedPatentesEBeneficios() {
  const patentesCriadas = new Map<string, { id: string }>();

  for (const patente of PATENTES) {
    const criada = await prisma.patente.create({
      data: patente,
      select: { id: true },
    });

    patentesCriadas.set(patente.nome, criada);
  }

  for (const [nomePatente, beneficios] of Object.entries(
    BENEFICIOS_POR_PATENTE,
  )) {
    const patente = patentesCriadas.get(nomePatente);

    if (!patente) {
      throw new Error(`Patente não encontrada para seed: ${nomePatente}`);
    }

    for (const beneficio of beneficios) {
      const beneficioCriado = await prisma.beneficio.create({
        data: {
          nome: beneficio.nome,
          descricao: beneficio.descricao,
          comoUtilizar: beneficio.comoUtilizar,
          tipo: beneficio.tipo,
          configuracao: beneficio.configuracao as Prisma.InputJsonValue,
          parceiro: beneficio.parceiro,
          logoUrl: beneficio.logoUrl,
          validade: beneficio.validade,
          limitUsos: beneficio.limitUsos ?? null,
          ativo: true,
        },
        select: { id: true },
      });

      await prisma.patentesBeneficios.create({
        data: {
          patenteId: patente.id,
          beneficioId: beneficioCriado.id,
        },
      });
    }
  }
}

async function main() {
  console.log("A limpar dados antigos de patentes e benefícios...");
  await limparDados();

  console.log("A criar patentes e benefícios...");
  await seedPatentesEBeneficios();

  console.log("Seed de patentes e benefícios concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
