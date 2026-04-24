import { auth } from "@/lib/auth";
import { verificarProgressaoPatente } from "@/lib/patentes";
import { prisma } from "@/lib/prisma";
import { TipoContribuicao } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import { z } from "zod";

const contribuicaoSchema = z.object({
  valor: z
    .string()
    .or(z.number())
    .transform((v) => {
      const num = typeof v === "string" ? parseFloat(v) : v;
      return num > 0 ? num : null;
    })
    .refine((v) => v !== null, { message: "Valor deve ser maior que 0" }),
  frequencia: z.enum(["UNICA", "MENSAL", "SEMANAL"]),
  metodo: z.enum(["MULTICAIXA_EXPRESS", "TRANSFERENCIA", "CARTAO"]),
  simularPagamento: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = contribuicaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados de contribuição inválidos." },
        { status: 400 },
      );
    }

    const { valor, frequencia, metodo, simularPagamento } = parsed.data;

    // Garante que existe um fundo principal para satisfazer a FK da contribuição
    const fundo = await prisma.fundo.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    const multiplicador = fundo.totalContribuicoes.gt(0)
      ? fundo.totalCofinanciamento.div(fundo.totalContribuicoes)
      : new Decimal(1);

    const statusContribuicao = simularPagamento ? "CONFIRMADO" : "PENDENTE";

    // Criar contribuição
    const contribuicao = await prisma.contribuicao.create({
      data: {
        valor,
        tipo: TipoContribuicao.ESTUDANTE,
        estudanteId: session.user.id,
        status: statusContribuicao,
        metodoPagamento: metodo,
        referencia: `REF-${Date.now()}`,
        fundoId: fundo.id,
      },
    });

    let progressaoPatente: Awaited<
      ReturnType<typeof verificarProgressaoPatente>
    > | null = null;

    if (simularPagamento) {
      const fundoActualizado = await prisma.fundo.update({
        where: { id: fundo.id },
        data: {
          totalContribuicoes: { increment: valor },
          totalCofinanciamento: { increment: valor },
          saldoDisponivel: { increment: valor },
        },
      });

      const contribuicoesConfirmadas = await prisma.contribuicao.aggregate({
        where: {
          estudanteId: session.user.id,
          status: "CONFIRMADO",
        },
        _sum: {
          valor: true,
        },
      });

      const novaContribuicaoTotal = Number(
        contribuicoesConfirmadas._sum.valor ?? 0,
      );

      progressaoPatente = await verificarProgressaoPatente(
        session.user.id,
        novaContribuicaoTotal,
      );
    }

    // Calcular impacto real
    const impactoReal = new Decimal(valor).mul(multiplicador);

    // TODO: Adicionar à fila do Redis para matching rules

    return NextResponse.json(
      {
        id: contribuicao.id,
        valor: contribuicao.valor.toString(),
        impactoReal: impactoReal.toString(),
        referencia: contribuicao.referencia,
        status: contribuicao.status,
        progressaoPatente: progressaoPatente
          ? {
              novaPatente: progressaoPatente.novaPatente,
              beneficiosDesbloqueados:
                progressaoPatente.beneficiosDesbloqueados,
            }
          : null,
        message: simularPagamento
          ? "Contribuição simulada com sucesso."
          : "Contribuição criada com sucesso. Aguarde confirmação de pagamento.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar contribuição", error);
    return NextResponse.json(
      { message: "Erro ao processar contribuição." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    // Buscar contribuições do estudante
    const [contribuicoes, total] = await Promise.all([
      prisma.contribuicao.findMany({
        where: {
          estudanteId: session.user.id,
        },
        orderBy: { data: "desc" },
        skip,
        take: limit,
      }),
      prisma.contribuicao.count({
        where: {
          estudanteId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      contribuicoes: contribuicoes.map((c) => ({
        id: c.id,
        valor: c.valor.toString(),
        data: c.data.toISOString(),
        status: c.status,
        metodoPagamento: c.metodoPagamento,
        referencia: c.referencia,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar contribuições", error);
    return NextResponse.json(
      { message: "Erro ao buscar contribuições." },
      { status: 500 },
    );
  }
}
