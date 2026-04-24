"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, password }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(payload?.message ?? "Nao foi possivel concluir o registo.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/login",
    });

    setIsLoading(false);

    if (result?.error) {
      setSuccess("Conta criada com sucesso. Faça login para continuar.");
      router.push("/login");
      return;
    }

    router.push(result?.url ?? "/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-6 py-20">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-primary-50 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-primary-800">S-02 | Registo</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-800">
          Criar conta
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          O registo publico e apenas para estudantes. Contas de parceiro sao
          criadas pela administracao da plataforma.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Nome completo
            </span>
            <input
              type="text"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-600"
              placeholder="Seu nome"
            />
          </label>

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
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-600"
              placeholder="Minimo de 6 caracteres"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60"
          >
            {isLoading ? "A criar conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Ja tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary-800">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
