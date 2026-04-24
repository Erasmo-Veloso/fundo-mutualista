import { Papel, StatusUtilizador } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      papel: Papel;
      status: StatusUtilizador;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    nome: string;
    email: string;
    papel: Papel;
    status: StatusUtilizador;
    avatarUrl: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    nome?: string;
    email?: string;
    papel?: Papel;
    status?: StatusUtilizador;
    avatarUrl?: string | null;
  }
}
