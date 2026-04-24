import { NextResponse } from "next/server";

import { requireEstudanteApi } from "@/lib/api-auth";
import { getRoadmapCompleto } from "@/lib/patentes";

export async function GET() {
  try {
    const authResult = await requireEstudanteApi();

    if ("response" in authResult) {
      return authResult.response;
    }

    const roadmap = await getRoadmapCompleto(authResult.user.id);

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Erro ao buscar roadmap de patentes do estudante:", error);

    return NextResponse.json(
      {
        message: "Erro ao buscar roadmap de patentes.",
      },
      { status: 500 },
    );
  }
}
