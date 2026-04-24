import { Papel, StatusUtilizador } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.utilizador.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          papel: user.papel,
          status: user.status,
          avatarUrl: user.avatarUrl,
          name: user.nome,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.nome = user.nome;
        token.email = user.email;
        token.papel = user.papel;
        token.status = user.status;
        token.avatarUrl = user.avatarUrl;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.nome = (token.nome as string) ?? "";
        session.user.email = (token.email as string) ?? "";
        session.user.papel = (token.papel as Papel) ?? Papel.ESTUDANTE;
        session.user.status =
          (token.status as StatusUtilizador) ?? StatusUtilizador.PENDENTE;
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
        session.user.name = session.user.nome;
        session.user.image = session.user.avatarUrl;
      }

      return session;
    },
  },
});
