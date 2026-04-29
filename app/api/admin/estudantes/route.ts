import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const estudantes = await prisma.utilizador.findMany({
      where: { papel: "ESTUDANTE" },
      select: {
        id: true,
        nome: true,
        email: true,
        universidade: true,
        curso: true,
        status: true,
        createdAt: true,
        avatarUrl: true,
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
      orderBy: { createdAt: "desc" },
    });

    const estudantesComResumo = estudantes.map((estudante) => {
      const contribuicoes = estudante.contribuicoes;
      const totalContribuido = contribuicoes.reduce(
        (acc, c) => acc + Number(c.valor),
        0,
      );
      const ultimaContribuicao = contribuicoes[0]?.data || null;
      const statusContribuicoes = {
        confirmadas: contribuicoes.filter((c) => c.status === "CONFIRMADO")
          .length,
        pendentes: contribuicoes.filter((c) => c.status === "PENDENTE").length,
        falhadas: contribuicoes.filter((c) => c.status === "FALHADO").length,
      };

      return {
        ...estudante,
        totalContribuido,
        ultimaContribuicao,
        statusContribuicoes,
        quantidadePatentes: estudante.patentesAtingidas.length,
      };
    });

    return NextResponse.json(estudantesComResumo);
  } catch (error) {
    console.error("Erro ao buscar estudantes:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar estudantes" },
      { status: 500 },
    );
  }
}
