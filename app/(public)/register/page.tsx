"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

function getPasswordStrengthLabel(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Fraca", activeBars: 1 };
  if (score === 2) return { label: "Moderada", activeBars: 2 };
  if (score === 3) return { label: "Boa", activeBars: 3 };

  return { label: "Forte", activeBars: 4 };
}

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [numeroEstudante, setNumeroEstudante] = useState("");
  const [universidade, setUniversidade] = useState("");
  const [curso, setCurso] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordStrength = getPasswordStrengthLabel(password);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!aceitouTermos) {
      setError("Aceite os termos para concluir o registo.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email: normalizedEmail,
          password,
          universidade,
          curso,
        }),
      });

      let payload: { message?: string } | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setError(payload?.message ?? "Nao foi possivel concluir o registo.");
        return;
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl: "/estudante",
      });

      if (result?.error) {
        setSuccess("Conta criada com sucesso. Faça login para continuar.");
        router.push("/login");
        return;
      }

      router.push(result?.url ?? "/estudante");
      router.refresh();
    } catch {
      setError("Erro de ligação. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f2ea] text-[#1c1e22]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6d1c4] px-5 py-4">
          <p className="text-xl font-black tracking-tight text-primary-800">
            FundoMutualista
          </p>
          <nav className="flex items-center gap-5 text-sm text-gray-600">
            <Link href="/#inicio" className="font-semibold text-primary-700">
              Início
            </Link>
            <Link href="/#como-funciona" className="hover:text-gray-800">
              Como funciona
            </Link>
            <Link href="/#impacto" className="hover:text-gray-800">
              Impacto
            </Link>
            <Link href="/#faq" className="hover:text-gray-800">
              FAQ
            </Link>
          </nav>
          <Link
            href="/register"
            className="rounded-md bg-primary-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-600"
          >
            Começar agora
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-3xl rounded-2xl border border-[#d8d3c7] bg-[#f8f6ef] p-6 shadow-sm sm:p-8">
            <h1 className="text-4xl font-semibold tracking-tight text-[#2d3137]">
              Criar conta
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#6a727a]">
              Junte-se ao ecossistema educacional. Continue o seu percurso com
              apoio de uma comunidade que investe no conhecimento.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                  Nome completo
                </span>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                  placeholder="Insira o seu nome"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                  Email institucional
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                  placeholder="nome@universidade.edu"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                    Número de estudante
                  </span>
                  <input
                    type="text"
                    value={numeroEstudante}
                    onChange={(event) => setNumeroEstudante(event.target.value)}
                    className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                    placeholder="ex: 20418225"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                    Universidade
                  </span>
                  <select
                    value={universidade}
                    onChange={(event) => setUniversidade(event.target.value)}
                    className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                  >
                    <option value="">Selecione a instituição</option>
                    <option value="up">Universidade Pedagógica</option>
                    <option value="uan">Universidade Agostinho Neto</option>
                    <option value="ucan">
                      Universidade Católica de Angola
                    </option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                  Curso
                </span>
                <input
                  type="text"
                  value={curso}
                  onChange={(event) => setCurso(event.target.value)}
                  className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                  placeholder="Área de estudo"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#95a0aa]">
                    Palavra-passe
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#a0a8af]">
                    mínimo 6 caracteres
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-[#d5d8db] bg-[#f4f6f8] px-4 py-3 pr-12 text-sm text-[#2f3439] outline-none transition focus:border-primary-600"
                    placeholder="Crie uma palavra-passe segura"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 my-auto h-6 text-xs font-semibold text-[#75808a]"
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </label>

              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full ${
                        index < passwordStrength.activeBars
                          ? "bg-primary-600"
                          : "bg-[#ddd8cc]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-right text-xs font-medium text-[#66707a]">
                  {password ? passwordStrength.label : "Força da palavra-passe"}
                </p>
              </div>

              <label className="flex items-start gap-2 text-xs text-[#6b747c]">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(event) => setAceitouTermos(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#c9cfcf]"
                />
                <span>
                  Confirmo que li e aceito os{" "}
                  <Link href="#" className="font-semibold text-primary-700">
                    Termos e Condições
                  </Link>{" "}
                  e a{" "}
                  <Link href="#" className="font-semibold text-primary-700">
                    Política de Privacidade
                  </Link>{" "}
                  do Fundo mutualista.
                </span>
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? (
                <p className="text-sm text-green-700">{success}</p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-sm text-[#67727b]">
                  Já tem conta?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary-700"
                  >
                    Iniciar sessão
                  </Link>
                </p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60"
                >
                  {isLoading ? "A criar conta..." : "Criar conta"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ddd7ca] pt-4 text-xs text-[#7a8086]">
          <p>© 2026 Fundo mutualista educacional.</p>
          <div className="flex items-center gap-4">
            <Link href="#">Privacidade</Link>
            <Link href="#">Termos</Link>
            <Link href="#">Suporte</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
