import bcrypt from "bcryptjs";
import { Papel, StatusUtilizador } from "@prisma/client";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";

import WelcomeEmail from "@/emails/welcome-email";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados de registo invalidos." },
        { status: 400 },
      );
    }

    if (body?.papel && body.papel !== Papel.ESTUDANTE) {
      return NextResponse.json(
        {
          message: "Contas de parceiro sao criadas apenas pela administracao.",
        },
        { status: 403 },
      );
    }

    const { nome, email, password } = parsed.data;

    const existingUser = await prisma.utilizador.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ja existe uma conta com este email." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.utilizador.create({
      data: {
        nome,
        email,
        passwordHash,
        papel: Papel.ESTUDANTE,
        status: StatusUtilizador.PENDENTE,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = await render(
        WelcomeEmail({ firstName: nome.split(" ")[0] ?? nome }),
      );

      try {
        await resend.emails.send({
          from:
            process.env.RESEND_FROM ??
            "Fundo Mutualista <onboarding@resend.dev>",
          to: [email],
          subject: "Bem-vindo ao Fundo Mutualista",
          html,
        });
      } catch (emailError) {
        console.error("Falha ao enviar email de boas-vindas", emailError);
      }
    }

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Erro interno ao criar conta." },
      { status: 500 },
    );
  }
}
