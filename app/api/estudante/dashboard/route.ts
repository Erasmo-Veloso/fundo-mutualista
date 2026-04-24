import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    // Buscar contribuições do estudante
    const contribuicoes = await prisma.contribuicao.findMany({
      where: {
        estudanteId: session.user.id,
        status: "CONFIRMADO",
      },
      orderBy: { data: "desc" },
      take: 3,
    });

    // Calcular saldo contribuído
    const saldoContribuido = contribuicoes.reduce((acc, c) => {
      return acc.plus(c.valor);
    }, new Decimal(0));

    // Buscar dados do fundo para calcular impacto
    const fundo = await prisma.fundo.findUnique({
      where: { id: 1 },
    });

    // Calcular multiplicador médio (totalCofinanciamento / totalContribuicoes)
    const multiplicador =
      fundo && fundo.totalContribuicoes.gt(0)
        ? fundo.totalCofinanciamento.div(fundo.totalContribuicoes)
        : new Decimal(1);

    const impactoReal = saldoContribuido.mul(multiplicador);

    // Buscar benefícios disponíveis
    const beneficiosDisponiveis = await prisma.beneficio.findMany({
      where: { ativo: true },
      select: { id: true },
    });

    // Progresso para bolsa (placeholder)
    const progressoBolsa = 68;

    // Ações rápidas
    const accoesRapidas = [
      {
        id: "1",
        label: "Contribuir",
        href: "/estudante/contribuir",
      },
      {
        id: "2",
        label: "Ver benefícios",
        href: "/estudante/beneficios",
      },
      {
        id: "3",
        label: "Pedir apoio",
        href: "/estudante/apoio",
      },
      {
        id: "4",
        label: "Cursos",
        href: "/estudante/cursos",
      },
    ];

    return NextResponse.json({
      saldoContribuido: saldoContribuido.toString(),
      impactoReal: impactoReal.toString(),
      progressoBolsa,
      contribuicoesRecentes: contribuicoes.map((c) => ({
        id: c.id,
        valor: c.valor.toString(),
        data: c.data.toISOString(),
        status: c.status,
        referencia: c.referencia,
      })),
      beneficiosDisponiveis: beneficiosDisponiveis.length,
      accoesRapidas,
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard", error);
    return NextResponse.json(
      { message: "Erro ao buscar dados do dashboard." },
      { status: 500 },
    );
  }
}
