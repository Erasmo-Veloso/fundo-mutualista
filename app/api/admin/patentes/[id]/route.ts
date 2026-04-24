import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdminApi, apiErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  patenteIdParamSchema,
  patenteUpdateSchema,
} from "@/lib/patentes-validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function serializePatente(patente: {
  id: string;
  nome: string;
  descricao: string;
  limiarKz: number;
  cor: string;
  icone: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    beneficios: number;
    estudantesPatente: number;
  };
}) {
  return {
    id: patente.id,
    nome: patente.nome,
    descricao: patente.descricao,
    limiarKz: patente.limiarKz,
    cor: patente.cor,
    icone: patente.icone,
    ordem: patente.ordem,
    ativo: patente.ativo,
    createdAt: patente.createdAt.toISOString(),
    updatedAt: patente.updatedAt.toISOString(),
    totalBeneficios: patente._count?.beneficios ?? 0,
    totalEstudantes: patente._count?.estudantesPatente ?? 0,
  };
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = patenteIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          message: parsedParams.error.issues[0]?.message ?? "ID inválido.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsedBody = patenteUpdateSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message:
            parsedBody.error.issues[0]?.message ??
            "Dados inválidos para actualizar a patente.",
          issues: parsedBody.error.issues,
        },
        { status: 400 },
      );
    }

    const patenteExistente = await prisma.patente.findUnique({
      where: { id: parsedParams.data.id },
      select: { id: true },
    });

    if (!patenteExistente) {
      return NextResponse.json(
        { message: "Patente não encontrada." },
        { status: 404 },
      );
    }

    const patenteActualizada = await prisma.patente.update({
      where: { id: parsedParams.data.id },
      data: parsedBody.data,
      include: {
        _count: {
          select: {
            beneficios: true,
            estudantesPatente: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Patente actualizada com sucesso.",
      patente: serializePatente(patenteActualizada),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "Já existe outra patente com este valor único.",
        },
        { status: 409 },
      );
    }

    console.error("Erro ao actualizar patente:", error);
    return apiErrorResponse(error, "Erro ao actualizar patente.");
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = patenteIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          message: parsedParams.error.issues[0]?.message ?? "ID inválido.",
        },
        { status: 400 },
      );
    }

    const patente = await prisma.patente.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        _count: {
          select: {
            beneficios: true,
            estudantesPatente: true,
          },
        },
      },
    });

    if (!patente) {
      return NextResponse.json(
        { message: "Patente não encontrada." },
        { status: 404 },
      );
    }

    if (patente._count.estudantesPatente > 0) {
      return NextResponse.json(
        {
          message:
            "Não é possível eliminar esta patente porque já existem estudantes associados a ela.",
        },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.patentesBeneficios.deleteMany({
        where: {
          patenteId: patente.id,
        },
      });

      await tx.patente.delete({
        where: {
          id: patente.id,
        },
      });
    });

    return NextResponse.json({
      message: "Patente eliminada com sucesso.",
      patente: serializePatente(patente),
    });
  } catch (error) {
    console.error("Erro ao eliminar patente:", error);
    return apiErrorResponse(error, "Erro ao eliminar patente.");
  }
}
