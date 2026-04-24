import {
  Prisma,
  StatusBeneficioEstudante,
  type Beneficio,
  type BeneficioEstudante,
  type Patente,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

type PatenteComBeneficios = Prisma.PatenteGetPayload<{
  include: {
    beneficios: {
      include: {
        beneficio: true;
      };
    };
  };
}>;

type RoadmapPatenteItem = {
  patente: Patente;
  status: "ATINGIDA" | "ACTUAL" | "PROXIMA" | "FUTURA";
  atingidaEm: Date | null;
  beneficios: Array<{
    beneficio: Beneficio;
    statusEstudante: StatusBeneficioEstudante | null;
  }>;
};

function gerarCodigoAcesso(beneficio: Beneficio) {
  const precisaCodigo =
    beneficio.tipo === "DESCONTO_UNIVERSIDADE" ||
    beneficio.tipo === "DESCONTO_MATERIAL" ||
    beneficio.tipo === "CURSO_ONLINE" ||
    beneficio.tipo === "CERTIFICACAO_PROFISSIONAL";

  if (!precisaCodigo) {
    return null;
  }

  return crypto.randomUUID();
}

function calcularExpiracaoGlobal(validade: Date | null) {
  if (!validade) {
    return null;
  }

  return new Date(validade);
}

async function obterContribuicaoTotal(
  estudanteId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const resultado = await tx.contribuicao.aggregate({
    where: {
      estudanteId,
      status: "CONFIRMADO",
    },
    _sum: {
      valor: true,
    },
  });

  return Number(resultado._sum.valor ?? 0);
}

async function obterPatentesActivas(
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.patente.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { limiarKz: "asc" }],
  });
}

async function obterPatentesActivasComBeneficios(
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.patente.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { limiarKz: "asc" }],
    include: {
      beneficios: {
        include: {
          beneficio: true,
        },
        orderBy: {
          beneficio: {
            nome: "asc",
          },
        },
      },
    },
  });
}

function determinarPatenteActual(
  patentes: Patente[],
  contribuicaoTotal: number,
): Patente {
  const elegiveis = patentes.filter(
    (patente) => patente.limiarKz <= contribuicaoTotal,
  );

  return elegiveis[elegiveis.length - 1] ?? patentes[0];
}

export async function getPatenteActual(estudanteId: string): Promise<{
  patenteActual: Patente;
  contribuicaoTotal: number;
  proximaPatente: Patente | null;
  kzParaProxima: number;
  progressoPercentagem: number;
}> {
  const [contribuicaoTotal, patentes] = await Promise.all([
    obterContribuicaoTotal(estudanteId),
    obterPatentesActivas(),
  ]);

  if (!patentes.length) {
    throw new Error("Nenhuma patente activa encontrada.");
  }

  const patenteActual = determinarPatenteActual(patentes, contribuicaoTotal);
  const indiceActual = patentes.findIndex((patente) => patente.id === patenteActual.id);
  const proximaPatente = indiceActual >= 0 ? patentes[indiceActual + 1] ?? null : null;

  if (!proximaPatente) {
    return {
      patenteActual,
      contribuicaoTotal,
      proximaPatente: null,
      kzParaProxima: 0,
      progressoPercentagem: 100,
    };
  }

  const baseActual = patenteActual.limiarKz;
  const alvo = proximaPatente.limiarKz;
  const intervalo = Math.max(alvo - baseActual, 1);
  const progressoBruto = ((contribuicaoTotal - baseActual) / intervalo) * 100;

  return {
    patenteActual,
    contribuicaoTotal,
    proximaPatente,
    kzParaProxima: Math.max(alvo - contribuicaoTotal, 0),
    progressoPercentagem: Math.min(Math.max(progressoBruto, 0), 100),
  };
}

export async function desbloquearBeneficiosPatente(
  estudanteId: string,
  patenteId: string,
): Promise<BeneficioEstudante[]> {
  return prisma.$transaction(async (tx) => {
    const patente = await tx.patente.findUnique({
      where: { id: patenteId },
      include: {
        beneficios: {
          include: {
            beneficio: true,
          },
        },
      },
    });

    if (!patente) {
      throw new Error("Patente não encontrada.");
    }

    const criados: BeneficioEstudante[] = [];

    for (const associacao of patente.beneficios) {
      const beneficio = associacao.beneficio;

      if (!beneficio.ativo) {
        continue;
      }

      const existente = await tx.beneficioEstudante.findUnique({
        where: {
          estudanteId_beneficioId: {
            estudanteId,
            beneficioId: beneficio.id,
          },
        },
      });

      if (existente) {
        criados.push(existente);
        continue;
      }

      const criado = await tx.beneficioEstudante.create({
        data: {
          estudanteId,
          beneficioId: beneficio.id,
          status: StatusBeneficioEstudante.DISPONIVEL,
          codigoAcesso: gerarCodigoAcesso(beneficio),
          expiradoEm: calcularExpiracaoGlobal(beneficio.validade ?? null),
          observacoes: `Desbloqueado automaticamente pela patente ${patente.nome}.`,
        },
      });

      criados.push(criado);

      await tx.notificacao.create({
        data: {
          utilizadorId: estudanteId,
          titulo: "Novo benefício desbloqueado",
          mensagem: `O benefício "${beneficio.nome}" foi desbloqueado pela tua patente ${patente.nome}.`,
          tipo: "BENEFICIO_DESBLOQUEADO",
          url: "/estudante/beneficios",
        },
      });
    }

    return criados;
  });
}

export async function verificarProgressaoPatente(
  estudanteId: string,
  novaContribuicaoTotal: number,
): Promise<{
  novaPatente: Patente | null;
  beneficiosDesbloqueados: Beneficio[];
}> {
  return prisma.$transaction(async (tx) => {
    const patentes = await obterPatentesActivas(tx);

    if (!patentes.length) {
      throw new Error("Nenhuma patente activa encontrada.");
    }

    const patenteElegivel = determinarPatenteActual(patentes, novaContribuicaoTotal);

    const patenteMaisAltaRegistada = await tx.patenteEstudante.findFirst({
      where: { estudanteId },
      include: {
        patente: true,
      },
      orderBy: {
        patente: {
          ordem: "desc",
        },
      },
    });

    if (
      patenteMaisAltaRegistada &&
      patenteMaisAltaRegistada.patente.ordem >= patenteElegivel.ordem
    ) {
      return {
        novaPatente: null,
        beneficiosDesbloqueados: [],
      };
    }

    const patentesADesbloquear = patentes.filter((patente) => {
      const acimaDoLimiar = patente.limiarKz <= novaContribuicaoTotal;
      const aindaNaoAtingida =
        !patenteMaisAltaRegistada ||
        patente.ordem > patenteMaisAltaRegistada.patente.ordem;

      return acimaDoLimiar && aindaNaoAtingida;
    });

    let ultimaPatente: Patente | null = null;
    const beneficiosDesbloqueados = new Map<string, Beneficio>();

    for (const patente of patentesADesbloquear) {
      await tx.patenteEstudante.create({
        data: {
          estudanteId,
          patenteId: patente.id,
          contribuicaoNoMomento: novaContribuicaoTotal,
        },
      });

      const patenteComBeneficios = await tx.patente.findUnique({
        where: { id: patente.id },
        include: {
          beneficios: {
            include: {
              beneficio: true,
            },
          },
        },
      });

      if (patenteComBeneficios) {
        for (const associacao of patenteComBeneficios.beneficios) {
          const beneficio = associacao.beneficio;

          if (!beneficio.ativo) {
            continue;
          }

          const existente = await tx.beneficioEstudante.findUnique({
            where: {
              estudanteId_beneficioId: {
                estudanteId,
                beneficioId: beneficio.id,
              },
            },
          });

          if (!existente) {
            await tx.beneficioEstudante.create({
              data: {
                estudanteId,
                beneficioId: beneficio.id,
                status: StatusBeneficioEstudante.DISPONIVEL,
                codigoAcesso: gerarCodigoAcesso(beneficio),
                expiradoEm: calcularExpiracaoGlobal(beneficio.validade ?? null),
                observacoes: `Desbloqueado automaticamente pela patente ${patente.nome}.`,
              },
            });

            await tx.notificacao.create({
              data: {
                utilizadorId: estudanteId,
                titulo: "Novo benefício desbloqueado",
                mensagem: `O benefício "${beneficio.nome}" foi desbloqueado pela tua patente ${patente.nome}.`,
                tipo: "BENEFICIO_DESBLOQUEADO",
                url: "/estudante/beneficios",
              },
            });
          }

          beneficiosDesbloqueados.set(beneficio.id, beneficio);
        }
      }

      await tx.notificacao.create({
        data: {
          utilizadorId: estudanteId,
          titulo: "Nova patente alcançada",
          mensagem: `Parabéns! Alcançaste a patente ${patente.nome}.`,
          tipo: "PATENTE_ALCANCADA",
          url: "/estudante/beneficios",
        },
      });

      ultimaPatente = patente;
    }

    return {
      novaPatente: ultimaPatente,
      beneficiosDesbloqueados: Array.from(beneficiosDesbloqueados.values()),
    };
  });
}

export async function getRoadmapCompleto(estudanteId: string): Promise<{
  patentes: RoadmapPatenteItem[];
  contribuicaoTotal: number;
  patenteActual: Patente;
}> {
  const [contribuicaoTotal, patentes, patentesAtingidas, beneficiosEstudante] =
    await Promise.all([
      obterContribuicaoTotal(estudanteId),
      obterPatentesActivasComBeneficios(),
      prisma.patenteEstudante.findMany({
        where: { estudanteId },
        orderBy: {
          atingidaEm: "asc",
        },
      }),
      prisma.beneficioEstudante.findMany({
        where: { estudanteId },
      }),
    ]);

  if (!patentes.length) {
    throw new Error("Nenhuma patente activa encontrada.");
  }

  const patenteActual = determinarPatenteActual(
    patentes.map((item) => item as Patente),
    contribuicaoTotal,
  );

  const atingidasMap = new Map(
    patentesAtingidas.map((item) => [item.patenteId, item.atingidaEm]),
  );

  const beneficioStatusMap = new Map(
    beneficiosEstudante.map((item) => [item.beneficioId, item.status]),
  );

  const indiceActual = patentes.findIndex((patente) => patente.id === patenteActual.id);

  const roadmap: RoadmapPatenteItem[] = patentes.map((item, index) => {
    let status: RoadmapPatenteItem["status"] = "FUTURA";

    if (atingidasMap.has(item.id)) {
      status = item.id === patenteActual.id ? "ACTUAL" : "ATINGIDA";
    } else if (index === indiceActual + 1) {
      status = "PROXIMA";
    } else if (item.id === patenteActual.id) {
      status = "ACTUAL";
    }

    return {
      patente: {
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        limiarKz: item.limiarKz,
        cor: item.cor,
        icone: item.icone,
        ordem: item.ordem,
        ativo: item.ativo,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      status,
      atingidaEm: atingidasMap.get(item.id) ?? null,
      beneficios: item.beneficios.map((associacao) => ({
        beneficio: associacao.beneficio,
        statusEstudante: beneficioStatusMap.get(associacao.beneficio.id) ?? null,
      })),
    };
  });

  return {
    patentes: roadmap,
    contribuicaoTotal,
    patenteActual,
  };
}

export async function activarBeneficio(
  estudanteId: string,
  beneficioId: string,
): Promise<{
  beneficioEstudante: BeneficioEstudante;
  instrucoes: string;
  codigoAcesso: string | null;
}> {
  return prisma.$transaction(async (tx) => {
    const beneficioEstudante = await tx.beneficioEstudante.findUnique({
      where: {
        estudanteId_beneficioId: {
          estudanteId,
          beneficioId,
        },
      },
      include: {
        beneficio: true,
      },
    });

    if (!beneficioEstudante) {
      throw new Error("Benefício não encontrado para este estudante.");
    }

    if (beneficioEstudante.status === StatusBeneficioEstudante.EXPIRADO) {
      throw new Error("Este benefício já expirou.");
    }

    if (beneficioEstudante.status === StatusBeneficioEstudante.UTILIZADO) {
      throw new Error("Este benefício já foi utilizado.");
    }

    const agora = new Date();

    if (beneficioEstudante.expiradoEm && beneficioEstudante.expiradoEm <= agora) {
      const expirado = await tx.beneficioEstudante.update({
        where: { id: beneficioEstudante.id },
        data: {
          status: StatusBeneficioEstudante.EXPIRADO,
        },
      });

      throw new Error(
        `O benefício expirou em ${expirado.expiradoEm?.toLocaleDateString("pt-AO") ?? "data inválida"}.`,
      );
    }

    const actualizado =
      beneficioEstudante.status === StatusBeneficioEstudante.ACTIVO
        ? beneficioEstudante
        : await tx.beneficioEstudante.update({
            where: { id: beneficioEstudante.id },
            data: {
              status: StatusBeneficioEstudante.ACTIVO,
              activadoEm: beneficioEstudante.activadoEm ?? agora,
            },
          });

    await tx.notificacao.create({
      data: {
        utilizadorId: estudanteId,
        titulo: "Benefício activado",
        mensagem: `Activaste o benefício "${beneficioEstudante.beneficio.nome}".`,
        tipo: "BENEFICIO_ACTIVADO",
        url: "/estudante/beneficios",
      },
    });

    return {
      beneficioEstudante: actualizado,
      instrucoes: beneficioEstudante.beneficio.comoUtilizar,
      codigoAcesso: actualizado.codigoAcesso,
    };
  });
}

export async function verificarExpiracoes(): Promise<number> {
  const agora = new Date();

  const resultado = await prisma.beneficioEstudante.updateMany({
    where: {
      status: {
        in: [
          StatusBeneficioEstudante.DISPONIVEL,
          StatusBeneficioEstudante.ACTIVO,
        ],
      },
      expiradoEm: {
        lte: agora,
      },
    },
    data: {
      status: StatusBeneficioEstudante.EXPIRADO,
    },
  });

  return resultado.count;
}
