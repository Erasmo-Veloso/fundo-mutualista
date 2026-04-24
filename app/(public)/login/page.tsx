"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/login";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Credenciais invalidas. Verifique email e password.");
      return;
    }

    router.push(result?.url ?? "/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-6 py-20">
      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-primary-50 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-primary-800">S-02 | Login</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-800">
            Entrar na plataforma
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Aceda com as suas credenciais para continuar.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-600"
                placeholder="seu@email.com"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-600"
                placeholder="********"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60"
            >
              {isLoading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Ainda nao tem conta?{" "}
            <Link href="/register" className="font-semibold text-primary-800">
              Criar conta
            </Link>
          </p>
        </section>

        <section className="rounded-2xl border border-accent-50 bg-accent-50 p-8">
          <p className="text-sm font-semibold text-accent-800">
            S-03 | Suporte
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-800">
            Precisa de ajuda com o acesso?
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            Se esta com dificuldades de acesso ou precisa de apoio urgente, pode
            abrir um pedido de apoio especial para acompanhamento da equipa.
          </p>

          <div className="mt-6">
            <Link
              href="/apoio-especial"
              className="inline-flex rounded-lg bg-accent-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
            >
              Pedir apoio especial
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
