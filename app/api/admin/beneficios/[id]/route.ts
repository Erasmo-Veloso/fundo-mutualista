import { Prisma, TipoBeneficio } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdminApi, apiErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  beneficioIdParamSchema,
  beneficioUpdateSchema,
} from "@/lib/patentes-validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeValidationErrors(error: {
  issues?: Array<{ path: PropertyKey[]; message: string }>;
}) {
  return (
    error.issues?.map((issue) => ({
      path: issue.path.map((segment) => String(segment)).join("."),
      message: issue.message,
    })) ?? []
  );
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const rawParams = await params;
    const parsedParams = beneficioIdParamSchema.safeParse({
      beneficioId: rawParams.id,
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          message: "Parâmetros inválidos.",
          errors: normalizeValidationErrors(parsedParams.error),
        },
        { status: 400 },
      );
    }

    const beneficioId = parsedParams.data.beneficioId;
    const body = await request.json();
    const parsedBody = beneficioUpdateSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos para actualizar benefício.",
          errors: normalizeValidationErrors(parsedBody.error),
        },
        { status: 400 },
      );
    }

    const existente = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
      select: { id: true, tipo: true },
    });

    if (!existente) {
      return NextResponse.json(
        { message: "Benefício não encontrado." },
        { status: 404 },
      );
    }

    const data = parsedBody.data;
    const tipoFinal = (data.tipo ?? existente.tipo) as TipoBeneficio;

    if (data.configuracao && data.tipo == null) {
      return NextResponse.json(
        {
          message:
            "Para actualizar a configuração, envie também o campo 'tipo' correspondente.",
        },
        { status: 400 },
      );
    }

    const updateData: Prisma.BeneficioUpdateInput = {
      ...(data.nome !== undefined ? { nome: data.nome } : {}),
      ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
      ...(data.comoUtilizar !== undefined
        ? { comoUtilizar: data.comoUtilizar }
        : {}),
      ...(data.tipo !== undefined ? { tipo: tipoFinal } : {}),
      ...(data.configuracao !== undefined
        ? { configuracao: data.configuracao as Prisma.InputJsonValue }
        : {}),
      ...(data.parceiro !== undefined ? { parceiro: data.parceiro } : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
      ...(data.validade !== undefined
        ? { validade: data.validade ? new Date(data.validade) : null }
        : {}),
      ...(data.limitUsos !== undefined ? { limitUsos: data.limitUsos } : {}),
      ...(data.ativo !== undefined ? { ativo: data.ativo } : {}),
    };

    const beneficioActualizado = await prisma.beneficio.update({
      where: { id: beneficioId },
      data: updateData,
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
        estudantes: true,
      },
    });

    return NextResponse.json({
      message: "Benefício actualizado com sucesso.",
      beneficio: beneficioActualizado,
    });
  } catch (error) {
    console.error("Erro ao actualizar benefício:", error);
    return apiErrorResponse(error, "Erro ao actualizar benefício.");
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const rawParams = await params;
    const parsedParams = beneficioIdParamSchema.safeParse({
      beneficioId: rawParams.id,
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          message: "Parâmetros inválidos.",
          errors: normalizeValidationErrors(parsedParams.error),
        },
        { status: 400 },
      );
    }

    const beneficioId = parsedParams.data.beneficioId;

    const existente = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
      select: {
        id: true,
        nome: true,
        _count: {
          select: {
            estudantes: true,
            patentes: true,
          },
        },
      },
    });

    if (!existente) {
      return NextResponse.json(
        { message: "Benefício não encontrado." },
        { status: 404 },
      );
    }

    await prisma.beneficio.delete({
      where: { id: beneficioId },
    });

    return NextResponse.json({
      message: "Benefício removido com sucesso.",
      deleted: {
        id: existente.id,
        nome: existente.nome,
        estudantesAssociados: existente._count.estudantes,
        patentesAssociadas: existente._count.patentes,
      },
    });
  } catch (error) {
    console.error("Erro ao remover benefício:", error);
    return apiErrorResponse(error, "Erro ao remover benefício.");
  }
}
