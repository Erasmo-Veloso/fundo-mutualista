import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdminApi, apiErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { beneficioCreateSchema } from "@/lib/patentes-validation";

function normalizarBeneficioPayload(
  input: ReturnType<typeof beneficioCreateSchema.parse>,
): Prisma.BeneficioUncheckedCreateInput {
  return {
    nome: input.nome,
    descricao: input.descricao,
    comoUtilizar: input.comoUtilizar,
    tipo: input.tipo,
    configuracao: input.configuracao as Prisma.InputJsonValue,
    parceiro: input.parceiro,
    logoUrl: input.logoUrl,
    validade: input.validade ? new Date(input.validade) : null,
    limitUsos: input.limitUsos,
    ativo: input.ativo,
  };
}

export async function GET() {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const beneficios = await prisma.beneficio.findMany({
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
        estudantes: {
          select: {
            id: true,
            estudanteId: true,
            status: true,
            activadoEm: true,
            expiradoEm: true,
            utilizadoEm: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const payload = beneficios.map((beneficio) => ({
      ...beneficio,
      validade: beneficio.validade?.toISOString() ?? null,
      createdAt: beneficio.createdAt.toISOString(),
      updatedAt: beneficio.updatedAt.toISOString(),
      patentes: beneficio.patentes.map((rel) => ({
        patenteId: rel.patenteId,
        patente: {
          id: rel.patente.id,
          nome: rel.patente.nome,
          descricao: rel.patente.descricao,
          limiarKz: rel.patente.limiarKz,
          cor: rel.patente.cor,
          icone: rel.patente.icone,
          ordem: rel.patente.ordem,
          ativo: rel.patente.ativo,
        },
      })),
      estudantes: beneficio.estudantes.map((item) => ({
        ...item,
        activadoEm: item.activadoEm?.toISOString() ?? null,
        expiradoEm: item.expiradoEm?.toISOString() ?? null,
        utilizadoEm: item.utilizadoEm?.toISOString() ?? null,
      })),
      stats: {
        totalEstudantes: beneficio.estudantes.length,
        activos: beneficio.estudantes.filter((item) => item.status === "ACTIVO")
          .length,
        disponiveis: beneficio.estudantes.filter(
          (item) => item.status === "DISPONIVEL",
        ).length,
        utilizados: beneficio.estudantes.filter(
          (item) => item.status === "UTILIZADO",
        ).length,
        expirados: beneficio.estudantes.filter(
          (item) => item.status === "EXPIRADO",
        ).length,
      },
    }));

    return NextResponse.json({
      beneficios: payload,
      total: payload.length,
    });
  } catch (error) {
    console.error("Erro ao listar benefícios para o admin:", error);
    return apiErrorResponse(error, "Erro ao listar benefícios.");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const body = await request.json();
    const parsed = beneficioCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos para criar benefício.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const beneficio = await prisma.beneficio.create({
      data: normalizarBeneficioPayload(parsed.data),
    });

    return NextResponse.json(
      {
        message: "Benefício criado com sucesso.",
        beneficio: {
          ...beneficio,
          validade: beneficio.validade?.toISOString() ?? null,
          createdAt: beneficio.createdAt.toISOString(),
          updatedAt: beneficio.updatedAt.toISOString(),
          patentes: [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar benefício:", error);
    return apiErrorResponse(error, "Erro ao criar benefício.");
  }
}
