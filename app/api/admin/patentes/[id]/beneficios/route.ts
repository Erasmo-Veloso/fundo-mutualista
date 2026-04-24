import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireAdminApi, apiErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { associarBeneficioPatenteSchema } from "@/lib/patentes-validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const { id: patenteId } = await params;

    if (!patenteId?.trim()) {
      return NextResponse.json(
        { message: "id da patente é obrigatório." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = associarBeneficioPatenteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos para associar benefício à patente.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { beneficioId } = parsed.data;

    const [patente, beneficio] = await Promise.all([
      prisma.patente.findUnique({
        where: { id: patenteId },
        select: {
          id: true,
          nome: true,
          ativo: true,
        },
      }),
      prisma.beneficio.findUnique({
        where: { id: beneficioId },
        select: {
          id: true,
          nome: true,
          ativo: true,
        },
      }),
    ]);

    if (!patente) {
      return NextResponse.json(
        { message: "Patente não encontrada." },
        { status: 404 },
      );
    }

    if (!beneficio) {
      return NextResponse.json(
        { message: "Benefício não encontrado." },
        { status: 404 },
      );
    }

    const associacao = await prisma.patentesBeneficios.create({
      data: {
        patenteId: patente.id,
        beneficioId: beneficio.id,
      },
      include: {
        patente: {
          select: {
            id: true,
            nome: true,
            ordem: true,
            limiarKz: true,
            ativo: true,
          },
        },
        beneficio: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            ativo: true,
            parceiro: true,
            validade: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Benefício associado à patente com sucesso.",
        associacao,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Este benefício já está associado a esta patente." },
        { status: 409 },
      );
    }

    console.error("Erro ao associar benefício à patente:", error);
    return apiErrorResponse(
      error,
      "Erro ao associar benefício à patente.",
    );
  }
}
