"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StudentLayout from "@/components/estudante/StudentLayout";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Circle,
  CreditCard,
  Landmark,
  Repeat,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

const PRESET_AMOUNTS = [500, 1000, 2000];
const FREQUENCIES = [
  { value: "UNICA", label: "Única", hint: "Pagamento pontual", icon: Circle },
  { value: "MENSAL", label: "Mensal", hint: "Apoio contínuo", icon: Repeat },
] as const;
const PAYMENT_METHODS = [
  {
    value: "MULTICAIXA_EXPRESS",
    label: "Multicaixa Express",
    hint: "Pague com o seu telemóvel",
    icon: Wallet,
  },
  {
    value: "CARTAO",
    label: "Cartão de crédito ou débito",
    hint: "Visa, Mastercard, Amex",
    icon: CreditCard,
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferência bancária",
    hint: "Diretamente da sua conta",
    icon: Landmark,
  },
] as const;

type FrequencyType = (typeof FREQUENCIES)[number]["value"];
type PaymentMethodType = (typeof PAYMENT_METHODS)[number]["value"];

interface SuccessData {
  id: string;
  valor: string;
  impactoReal: string;
  referencia: string;
  status: string;
}

const CONFETTI_COLORS = ["#0F6E56", "#EF9F27", "#7F77DD", "#22C55E", "#F97316"];

function formatCurrency(value: number, decimals = true) {
  return value.toLocaleString("pt-AO", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
}

export default function ContribuirPage() {
  const [amount, setAmount] = useState<string>("1000");
  const [frequency, setFrequency] = useState<FrequencyType>("UNICA");
  const [method, setMethod] = useState<PaymentMethodType>("CARTAO");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const numericAmount = Number.parseFloat(amount) || 0;
  const contributionAmount = numericAmount > 0 ? numericAmount : 0;
  const processingFee = 0;
  const impactMultiplier = 1.5;
  const impactAmount = contributionAmount * impactMultiplier;
  const canSubmit = contributionAmount > 0 && !loading;
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: `${((index * 17) % 100) + 1}%`,
        delay: `${(index % 12) * 0.12}s`,
        duration: `${3.1 + (index % 6) * 0.28}s`,
        rotate: `${(index % 2 === 0 ? 1 : -1) * (120 + (index % 5) * 38)}deg`,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: `${6 + (index % 4) * 2}px`,
      })),
    [],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contributionAmount) {
      setError("Por favor, introduza um valor válido.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contribuicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: contributionAmount,
          frequencia: frequency,
          metodo: method,
          simularPagamento: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erro ao processar a contribuição.");
        return;
      }

      setSuccessData(data);
      setSuccess(true);
      setAmount("1000");
      setFrequency("UNICA");
      setMethod("CARTAO");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro desconhecido ao processar a contribuição.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success && successData) {
    return (
      <StudentLayout pageTitle="Contribuir">
        <div className="relative bg-gray-50 px-4 py-4 sm:px-8">
          <div className="pointer-events-none absolute inset-0">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="confetti-piece absolute top-[-8%] block rounded-sm"
                style={{
                  left: piece.left,
                  backgroundColor: piece.color,
                  width: piece.size,
                  height: `calc(${piece.size} * 0.5)`,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                  transform: `rotate(${piece.rotate})`,
                }}
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
              <Sparkles className="h-9 w-9 text-primary-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold leading-tight text-gray-800">
              Contribuição concluída com sucesso!
            </h2>
            <p className="mx-auto mt-3 max-w-xs text-sm text-gray-600">
              A tua contribuição foi registada. Aqui estão os detalhes desta
              operação.
            </p>
            <div className="mt-6 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-left text-sm">
              <p className="flex items-center justify-between text-gray-600">
                <span>Valor</span>
                <strong className="text-gray-800">
                  {formatCurrency(Number(successData.valor))} Kz
                </strong>
              </p>
              <p className="flex items-center justify-between text-gray-600">
                <span>Referência</span>
                <strong className="text-gray-800">
                  {successData.referencia}
                </strong>
              </p>
              <p className="flex items-center justify-between text-gray-600">
                <span>Status</span>
                <strong className="text-emerald-700">
                  {successData.status}
                </strong>
              </p>
            </div>

            <button
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
              onClick={() => setSuccess(false)}
            >
              Fazer outra contribuição
            </button>

            <Link
              href={"/estudante/historico"}
              className="mt-3 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
            >
              Ver histórico →
            </Link>
          </div>

          <style jsx>{`
            .confetti-piece {
              opacity: 0;
              animation-name: confetti-fall;
              animation-timing-function: linear;
              animation-iteration-count: 1;
            }

            @keyframes confetti-fall {
              0% {
                opacity: 0;
                transform: translate3d(0, -20px, 0) rotate(0deg);
              }
              8% {
                opacity: 1;
              }
              100% {
                opacity: 0;
                transform: translate3d(0, 520px, 0) rotate(540deg);
              }
            }
          `}</style>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Contribuir">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* <Link
          href="/estudante"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition hover:text-gray-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to funding
        </Link> */}

        <header className="space-y-1">
          <h1 className="text-5xl font-medium tracking-tight text-gray-800">
            Nova contribuição
          </h1>
          <p className="text-sm text-gray-500">
            A sua contribuição apoia diretamente os estudantes. Escolha abaixo o
            nível do seu impacto.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 xl:grid-cols-[1.55fr_1fr]"
        >
          <div className="space-y-4">
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-2xl font-medium text-gray-700">
                Selecionar valor
              </h2>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {PRESET_AMOUNTS.map((preset) => {
                  const selected = contributionAmount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                        selected
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {formatCurrency(preset, false)} Kz
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-400">
                  Ou introduza um valor personalizado
                </p>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Kz 0,00"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary-600 focus:bg-white"
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-2xl font-medium text-gray-700">
                Frequência da contribuição
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {FREQUENCIES.map((item) => {
                  const Icon = item.icon;
                  const selected = frequency === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFrequency(item.value)}
                      className={`rounded-lg border px-3 py-3 text-left transition ${
                        selected
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            selected
                              ? "bg-primary-600 text-white"
                              : "border border-gray-300 bg-white text-gray-300"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {item.label}
                        </span>
                      </div>
                      <p className="mt-1 pl-7 text-xs text-gray-400">
                        {item.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-2xl font-medium text-gray-700">
                Método de pagamento
              </h2>

              <div className="mt-4 space-y-2.5">
                {PAYMENT_METHODS.map((payment) => {
                  const Icon = payment.icon;
                  const selected = method === payment.value;

                  return (
                    <button
                      key={payment.value}
                      type="button"
                      onClick={() => setMethod(payment.value)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-3 transition ${
                        selected
                          ? "border-primary-600 bg-primary-50 shadow-[0_0_0_1px_rgba(15,110,86,0.12)]"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            selected
                              ? "bg-primary-100 text-primary-600"
                              : "bg-white text-gray-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-700">
                            {payment.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.hint}
                          </p>
                        </div>
                      </div>

                      {selected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            {/* <section className="rounded-xl bg-[#F0AB43] p-5 text-[#653B00]">
              <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A5200]">
                <Sparkles className="h-3 w-3" />
                Impact preview
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Funding a semester</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#7A4900]">
                Your contribution of ${formatCurrency(contributionAmount)} can support tuition and
                study materials for an engineering student in need.
              </p>
              <p className="mt-2 text-xs font-semibold text-[#8A5200]">
                Estimated real impact: ${formatCurrency(impactAmount)}
              </p>

              <div className="mt-4 rounded-lg bg-white/70 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A4900]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F0AB43] text-white">
                    •
                  </span>
                  1 semester reach
                </p>
                <p className="mt-0.5 pl-6 text-xs text-[#8A5200]">+1 Student supported</p>
              </div>
            </section> */}

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-500">Resumo</h3>

              <div className="mt-4 space-y-2 border-b border-gray-100 pb-4 text-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Contribuição</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(contributionAmount)} Kz
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Taxa de processamento (opcional)</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(processingFee)} Kz
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <p className="text-sm font-semibold text-gray-600">
                  Total a pagar hoje
                </p>
                <p className="text-4xl font-semibold tracking-tight text-gray-700">
                  {formatCurrency(contributionAmount + processingFee)} Kz
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-5 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "A processar..." : "Concluir contribuição →"}
              </button>

              <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Processamento de pagamento seguro e encriptado
              </p>
            </section>
          </aside>
        </form>
      </div>
    </StudentLayout>
  );
}
