import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { message: "id é obrigatório." },
        { status: 400 },
      );
    }

    const patente = await prisma.patente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        descricao: true,
        limiarKz: true,
        cor: true,
        icone: true,
        ordem: true,
        ativo: true,
      },
    });

    if (!patente) {
      return NextResponse.json(
        { message: "Patente não encontrada." },
        { status: 404 },
      );
    }

    const registos = await prisma.patenteEstudante.findMany({
      where: {
        patenteId: id,
      },
      include: {
        estudante: {
          select: {
            id: true,
            nome: true,
            email: true,
            universidade: true,
            curso: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { atingidaEm: "desc" },
        { estudante: { nome: "asc" } },
      ],
    });

    const estudanteIds = registos.map((registo) => registo.estudanteId);

    const [
      contribuicoesAgrupadas,
      beneficiosPorEstudante,
      patenteMaisAltaPorEstudante,
    ] = await Promise.all([
      estudanteIds.length
        ? prisma.contribuicao.groupBy({
            by: ["estudanteId", "status"],
            where: {
              estudanteId: { in: estudanteIds },
            },
            _sum: {
              valor: true,
            },
            _count: {
              _all: true,
            },
          })
        : Promise.resolve([]),
      estudanteIds.length
        ? prisma.beneficioEstudante.groupBy({
            by: ["estudanteId", "status"],
            where: {
              estudanteId: { in: estudanteIds },
            },
            _count: {
              _all: true,
            },
          })
        : Promise.resolve([]),
      estudanteIds.length
        ? prisma.patenteEstudante.findMany({
            where: {
              estudanteId: { in: estudanteIds },
            },
            include: {
              patente: {
                select: {
                  id: true,
                  nome: true,
                  ordem: true,
                  cor: true,
                },
              },
            },
            orderBy: {
              patente: {
                ordem: "desc",
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const contribuicoesPorEstudante = new Map<
      string,
      {
        totalConfirmado: number;
        confirmadas: number;
        pendentes: number;
        falhadas: number;
      }
    >();

    for (const item of contribuicoesAgrupadas) {
      const estudanteId = item.estudanteId;

      if (!estudanteId) {
        continue;
      }

      const actual = contribuicoesPorEstudante.get(estudanteId) ?? {
        totalConfirmado: 0,
        confirmadas: 0,
        pendentes: 0,
        falhadas: 0,
      };

      if (item.status === "CONFIRMADO") {
        actual.totalConfirmado += Number(item._sum.valor ?? 0);
        actual.confirmadas += item._count._all;
      }

      if (item.status === "PENDENTE") {
        actual.pendentes += item._count._all;
      }

      if (item.status === "FALHADO") {
        actual.falhadas += item._count._all;
      }

      contribuicoesPorEstudante.set(estudanteId, actual);
    }

    const beneficiosMap = new Map<
      string,
      {
        disponiveis: number;
        activos: number;
        utilizados: number;
        expirados: number;
        total: number;
      }
    >();

    for (const item of beneficiosPorEstudante) {
      const actual = beneficiosMap.get(item.estudanteId) ?? {
        disponiveis: 0,
        activos: 0,
        utilizados: 0,
        expirados: 0,
        total: 0,
      };

      actual.total += item._count._all;

      if (item.status === "DISPONIVEL") {
        actual.disponiveis += item._count._all;
      }

      if (item.status === "ACTIVO") {
        actual.activos += item._count._all;
      }

      if (item.status === "UTILIZADO") {
        actual.utilizados += item._count._all;
      }

      if (item.status === "EXPIRADO") {
        actual.expirados += item._count._all;
      }

      beneficiosMap.set(item.estudanteId, actual);
    }

    const patenteMaisAltaMap = new Map<
      string,
      {
        id: string;
        nome: string;
        ordem: number;
        cor: string;
      }
    >();

    for (const item of patenteMaisAltaPorEstudante) {
      if (!patenteMaisAltaMap.has(item.estudanteId)) {
        patenteMaisAltaMap.set(item.estudanteId, item.patente);
      }
    }

    const estudantes = registos.map((registo) => {
      const contribuicoes = contribuicoesPorEstudante.get(registo.estudanteId) ?? {
        totalConfirmado: 0,
        confirmadas: 0,
        pendentes: 0,
        falhadas: 0,
      };

      const beneficios = beneficiosMap.get(registo.estudanteId) ?? {
        disponiveis: 0,
        activos: 0,
        utilizados: 0,
        expirados: 0,
        total: 0,
      };

      const patenteMaisAlta =
        patenteMaisAltaMap.get(registo.estudanteId) ?? {
          id: patente.id,
          nome: patente.nome,
          ordem: patente.ordem,
          cor: patente.cor,
        };

      return {
        id: registo.estudante.id,
        nome: registo.estudante.nome,
        email: registo.estudante.email,
        universidade: registo.estudante.universidade,
        curso: registo.estudante.curso,
        status: registo.estudante.status,
        avatarUrl: registo.estudante.avatarUrl,
        membroDesde: registo.estudante.createdAt.toISOString(),
        atingidaEm: registo.atingidaEm.toISOString(),
        contribuicaoNoMomento: registo.contribuicaoNoMomento,
        stats: {
          contribuicaoTotalConfirmada: contribuicoes.totalConfirmado,
          totalContribuicoesConfirmadas: contribuicoes.confirmadas,
          totalContribuicoesPendentes: contribuicoes.pendentes,
          totalContribuicoesFalhadas: contribuicoes.falhadas,
          beneficiosDisponiveis: beneficios.disponiveis,
          beneficiosActivos: beneficios.activos,
          beneficiosUtilizados: beneficios.utilizados,
          beneficiosExpirados: beneficios.expirados,
          totalBeneficios: beneficios.total,
          patenteMaisAlta,
        },
      };
    });

    const resumo = {
      totalEstudantes: estudantes.length,
      contribuicaoTotalConfirmada: estudantes.reduce(
        (total, estudante) => total + estudante.stats.contribuicaoTotalConfirmada,
        0,
      ),
      totalBeneficiosDisponiveis: estudantes.reduce(
        (total, estudante) => total + estudante.stats.beneficiosDisponiveis,
        0,
      ),
      totalBeneficiosActivos: estudantes.reduce(
        (total, estudante) => total + estudante.stats.beneficiosActivos,
        0,
      ),
      totalBeneficiosUtilizados: estudantes.reduce(
        (total, estudante) => total + estudante.stats.beneficiosUtilizados,
        0,
      ),
    };

    return NextResponse.json({
      patente,
      resumo,
      estudantes,
    });
  } catch (error) {
    console.error("Erro ao listar estudantes da patente:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao listar estudantes da patente.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
