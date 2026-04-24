import { NextResponse } from "next/server";

import { requireEstudanteApi } from "@/lib/api-auth";
import { activarBeneficio } from "@/lib/patentes";

type RouteContext = {
  params: Promise<{
    beneficioId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const authResult = await requireEstudanteApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const { beneficioId } = await params;

    if (!beneficioId?.trim()) {
      return NextResponse.json(
        { message: "beneficioId é obrigatório." },
        { status: 400 },
      );
    }

    const resultado = await activarBeneficio(authResult.user.id, beneficioId);

    return NextResponse.json({
      message: "Benefício activado com sucesso.",
      beneficioEstudante: {
        id: resultado.beneficioEstudante.id,
        estudanteId: resultado.beneficioEstudante.estudanteId,
        beneficioId: resultado.beneficioEstudante.beneficioId,
        status: resultado.beneficioEstudante.status,
        activadoEm: resultado.beneficioEstudante.activadoEm?.toISOString() ?? null,
        expiradoEm: resultado.beneficioEstudante.expiradoEm?.toISOString() ?? null,
        utilizadoEm: resultado.beneficioEstudante.utilizadoEm?.toISOString() ?? null,
        codigoAcesso: resultado.beneficioEstudante.codigoAcesso ?? null,
        observacoes: resultado.beneficioEstudante.observacoes ?? null,
      },
      instrucoes: resultado.instrucoes,
      codigoAcesso: resultado.codigoAcesso,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao activar benefício.";

    const status =
      message.includes("não encontrado") ? 404 :
      message.includes("expirou") || message.includes("utilizado") ? 409 :
      500;

    return NextResponse.json({ message }, { status });
  }
}
