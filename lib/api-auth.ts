import { Papel } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

type AuthenticatedApiUser = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  avatarUrl: string | null;
};

type ApiAuthSuccess = {
  user: AuthenticatedApiUser;
};

type ApiAuthFailure = {
  response: NextResponse;
};

type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

function isAllowedRole(userRole: Papel, allowedRoles: Papel[]) {
  return allowedRoles.includes(userRole);
}

function buildUnauthorizedResponse(message = "Não autorizado.") {
  return NextResponse.json({ message }, { status: 401 });
}

function buildForbiddenResponse(message = "Sem permissão para aceder a este recurso.") {
  return NextResponse.json({ message }, { status: 403 });
}

export async function requireApiAuth(): Promise<ApiAuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      response: buildUnauthorizedResponse(),
    };
  }

  return {
    user: {
      id: session.user.id,
      nome: session.user.nome,
      email: session.user.email,
      papel: session.user.papel,
      avatarUrl: session.user.avatarUrl,
    },
  };
}

export async function requireApiRole(
  allowedRoles: Papel[],
  forbiddenMessage = "Sem permissão para aceder a este recurso.",
): Promise<ApiAuthResult> {
  const authResult = await requireApiAuth();

  if ("response" in authResult) {
    return authResult;
  }

  if (!isAllowedRole(authResult.user.papel, allowedRoles)) {
    return {
      response: buildForbiddenResponse(forbiddenMessage),
    };
  }

  return authResult;
}

export async function requireAdminApi(): Promise<ApiAuthResult> {
  return requireApiRole([Papel.ADMIN], "Apenas administradores podem aceder a este recurso.");
}

export async function requireEstudanteApi(): Promise<ApiAuthResult> {
  return requireApiRole([Papel.ESTUDANTE], "Apenas estudantes podem aceder a este recurso.");
}

export function apiErrorResponse(
  error: unknown,
  fallbackMessage = "Erro interno do servidor.",
) {
  const message = error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json(
    {
      message,
    },
    { status: 500 },
  );
}
