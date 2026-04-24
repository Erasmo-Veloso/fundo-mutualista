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

  const callbackUrl = searchParams.get("callbackUrl") ?? "/estudante";

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
    <main className="min-h-screen bg-[#ece9df]">
      <div className="w-full overflow-hidden bg-[#ece9df]">
        <div className="grid min-h-screen md:grid-cols-[1.03fr_1fr]">
          <section className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80"
              alt="Biblioteca com estantes e estudante"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#f4f2ea]/58 via-[#f4f2ea]/38 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f4f2ea]/48 to-transparent" />

            <div className="absolute inset-x-8 bottom-10 z-10">
              <p className="text-5xl font-light leading-[0.96] text-[#22262b]">
                A fund built on knowledge.
              </p>
              <p className="mt-3 max-w-xs text-sm text-[#4f5a63]">
                Join a community dedicated to sustainable educational growth.
              </p>
            </div>
          </section>

          <section className="flex items-center px-6 py-10 sm:px-10 md:px-12">
            <div className="w-full">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#5f6871] transition hover:text-[#2f353b]"
              >
                <span aria-hidden="true">←</span>
                Voltar para a página inicial
              </Link>

              <h1 className="text-5xl font-semibold tracking-tight text-[#2a2f35]">
                Entrar
              </h1>
              <p className="mt-2 text-sm text-[#66707a]">
                Aceda à sua conta do FundoMutualista educacional.
              </p>

              <form onSubmit={onSubmit} className="mt-10 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                    placeholder="nome@exemplo.com"
                  />
                </label>

                <label className="block space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                      Palavra-passe
                    </span>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary-700 hover:text-primary-800"
                    >
                      Esqueci a palavra-passe
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
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

              <div className="my-5 flex items-center gap-3 text-xs text-[#98a1aa]">
                <div className="h-px flex-1 bg-[#d9dcd8]" />
                <span>OU</span>
                <div className="h-px flex-1 bg-[#d9dcd8]" />
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d5d8db] bg-white px-4 py-3 text-sm font-semibold text-[#474f56] transition hover:bg-[#f7f7f7]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.23c0-.74-.07-1.29-.2-1.86H12v3.48h5.18a4.3 4.3 0 0 1-1.86 2.82l-.01.12 3.02 2.34.21.02c1.95-1.8 3.08-4.44 3.08-7.92Z" />
                    <path d="M12 21c2.52 0 4.64-.83 6.19-2.25l-3.23-2.48c-.86.6-2.02 1.02-2.96 1.02-2.47 0-4.57-1.62-5.32-3.87l-.11.01-3.14 2.43-.04.11A9.35 9.35 0 0 0 12 21Z" />
                    <path d="M6.68 13.42A5.64 5.64 0 0 1 6.37 12c0-.49.11-.97.3-1.42l-.01-.1-3.18-2.47-.1.05A9.03 9.03 0 0 0 3 12c0 1.44.34 2.8.94 4l2.74-2.12Z" />
                    <path d="M12 6.71c1.26 0 2.4.43 3.28 1.29l2.4-2.35C16.64 4.6 14.52 4 12 4a9.35 9.35 0 0 0-8.61 5.93l3.29 2.52C7.43 8.2 9.53 6.71 12 6.71Z" />
                  </svg>
                  Fazer login com Google
                </button>
              </div>

              <div className="mt-8 border-t border-[#ddd8cd] pt-5 text-sm text-[#67727b]">
                <p>
                  Não tem uma conta?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-primary-700"
                  >
                    Registrar
                  </Link>
                </p>
                <Link
                  href="/apoio-especial"
                  className="mt-2 inline-block font-medium text-[#52606b] underline underline-offset-2"
                >
                  Solicitar apoio inicial especial
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
