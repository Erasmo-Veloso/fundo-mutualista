import { StatusBeneficioEstudante } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireEstudanteApi, apiErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authResult = await requireEstudanteApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const beneficios = await prisma.beneficioEstudante.findMany({
      where: {
        estudanteId: authResult.user.id,
      },
      include: {
        beneficio: {
          include: {
            patentes: {
              include: {
                patente: true,
              },
              orderBy: {
                patente: {
                  ordem: "asc",
                },
              },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { activadoEm: "desc" },
        { expiradoEm: "asc" },
      ],
    });

    const agrupados = {
      DISPONIVEL: [] as typeof beneficios,
      ACTIVO: [] as typeof beneficios,
      UTILIZADO: [] as typeof beneficios,
      EXPIRADO: [] as typeof beneficios,
    };

    for (const beneficio of beneficios) {
      agrupados[beneficio.status].push(beneficio);
    }

    const totais = {
      total: beneficios.length,
      disponiveis: agrupados.DISPONIVEL.length,
      activos: agrupados.ACTIVO.length,
      utilizados: agrupados.UTILIZADO.length,
      expirados: agrupados.EXPIRADO.length,
    };

    const statuses: StatusBeneficioEstudante[] = [
      StatusBeneficioEstudante.DISPONIVEL,
      StatusBeneficioEstudante.ACTIVO,
      StatusBeneficioEstudante.UTILIZADO,
      StatusBeneficioEstudante.EXPIRADO,
    ];

    return NextResponse.json({
      totais,
      grouped: agrupados,
      statuses,
    });
  } catch (error) {
    console.error("Erro ao listar benefícios do estudante", error);
    return apiErrorResponse(
      error,
      "Erro ao listar benefícios do estudante.",
    );
  }
}
