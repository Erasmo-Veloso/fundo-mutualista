import { Papel } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { patenteCreateSchema } from "@/lib/patentes-validation";

export async function GET() {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const patentes = await prisma.patente.findMany({
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
        _count: {
          select: {
            estudantesPatente: true,
            beneficios: true,
          },
        },
      },
    });

    return NextResponse.json({
      patentes,
    });
  } catch (error) {
    console.error("Erro ao listar patentes:", error);

    return NextResponse.json(
      {
        message: "Erro ao listar patentes.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAdminApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    if (authResult.user.papel !== Papel.ADMIN) {
      return NextResponse.json(
        {
          message: "Apenas administradores podem criar patentes.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = patenteCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos para criação de patente.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { nome, descricao, limiarKz, cor, icone, ordem, ativo } = parsed.data;

    const patenteExistente = await prisma.patente.findFirst({
      where: {
        OR: [{ nome }, { ordem }],
      },
      select: {
        id: true,
        nome: true,
        ordem: true,
      },
    });

    if (patenteExistente) {
      const motivo =
        patenteExistente.nome === nome
          ? "Já existe uma patente com este nome."
          : "Já existe uma patente com esta ordem.";

      return NextResponse.json(
        {
          message: motivo,
        },
        { status: 409 },
      );
    }

    const patente = await prisma.patente.create({
      data: {
        nome,
        descricao,
        limiarKz,
        cor,
        icone,
        ordem,
        ativo,
      },
      include: {
        beneficios: {
          include: {
            beneficio: true,
          },
        },
        _count: {
          select: {
            estudantesPatente: true,
            beneficios: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Patente criada com sucesso.",
        patente,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar patente:", error);

    return NextResponse.json(
      {
        message: "Erro ao criar patente.",
      },
      { status: 500 },
    );
  }
}
