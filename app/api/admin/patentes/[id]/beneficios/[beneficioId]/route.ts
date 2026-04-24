import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    beneficioId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const { id, beneficioId } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { message: "id da patente é obrigatório." },
        { status: 400 },
      );
    }

    if (!beneficioId?.trim()) {
      return NextResponse.json(
        { message: "beneficioId é obrigatório." },
        { status: 400 },
      );
    }

    const [patente, beneficio, associacao] = await Promise.all([
      prisma.patente.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
        },
      }),
      prisma.beneficio.findUnique({
        where: { id: beneficioId },
        select: {
          id: true,
          nome: true,
        },
      }),
      prisma.patentesBeneficios.findUnique({
        where: {
          patenteId_beneficioId: {
            patenteId: id,
            beneficioId,
          },
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

    if (!associacao) {
      return NextResponse.json(
        { message: "Este benefício não está associado a esta patente." },
        { status: 404 },
      );
    }

    await prisma.patentesBeneficios.delete({
      where: {
        patenteId_beneficioId: {
          patenteId: id,
          beneficioId,
        },
      },
    });

    return NextResponse.json({
      message: "Benefício dissociado da patente com sucesso.",
      patente: {
        id: patente.id,
        nome: patente.nome,
      },
      beneficio: {
        id: beneficio.id,
        nome: beneficio.nome,
      },
    });
  } catch (error) {
    console.error("Erro ao dissociar benefício da patente:", error);

    return NextResponse.json(
      {
        message: "Erro ao dissociar benefício da patente.",
      },
      { status: 500 },
    );
  }
}
