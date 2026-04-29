import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { erro: "Status é obrigatório" },
        { status: 400 },
      );
    }

    const updated = await prisma.utilizador.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        nome: true,
        email: true,
        status: true,
        universidade: true,
        curso: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar estudante:", error);
    return NextResponse.json(
      { erro: "Erro ao atualizar estudante" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.utilizador.delete({
      where: { id },
    });

    return NextResponse.json({ mensagem: "Estudante deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar estudante:", error);
    return NextResponse.json(
      { erro: "Erro ao deletar estudante" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const estudante = await prisma.utilizador.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        universidade: true,
        curso: true,
        status: true,
        createdAt: true,
        contribuicoes: {
          select: {
            id: true,
            valor: true,
            data: true,
            status: true,
            tipo: true,
          },
          orderBy: { data: "desc" },
        },
        patentesAtingidas: {
          select: {
            patenteId: true,
            atingidaEm: true,
            patente: { select: { nome: true } },
          },
        },
      },
    });

    if (!estudante) {
      return NextResponse.json(
        { erro: "Estudante não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(estudante);
  } catch (error) {
    console.error("Erro ao buscar estudante:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar estudante" },
      { status: 500 },
    );
  }
}
