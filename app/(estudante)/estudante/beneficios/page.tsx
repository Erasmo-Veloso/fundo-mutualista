"use client";

import StudentLayout from "@/components/estudante/StudentLayout";
import {
  ArrowRight,
  BookOpenText,
  CircleCheck,
  Clock3,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const BENEFICIOS_DISPONIVEIS = [
  {
    id: "educacao",
    categoria: "EDUCAÇÃO",
    titulo: "30% de desconto em Curso Avançado de Tecnologia",
    instituicao: "Instituto Superior Técnico",
    acao: "Resgatar código",
  },
  {
    id: "materiais",
    categoria: "MATERIAIS",
    titulo: "E-books gratuitos para o semestre",
    instituicao: "Universidade do Progresso",
    acao: "Acessar biblioteca",
  },
];

const DESBLOQUEAVEIS = [
  {
    id: "mentoria",
    titulo: "Programa de mentoria",
    regra: "Desbloqueia no 2º ano",
  },
  {
    id: "intercambio",
    titulo: "Intercâmbio internacional",
    regra: "Exige média de 15 valores",
  },
  {
    id: "matching",
    titulo: "Cofinanciamento extra",
    regra: "Concluir trilha base",
  },
];

const PARCEIROS = ["Universidade A", "TechCorp", "GlobalBank", "EduFoundation"];

const CONTRIBUICOES_ATUAIS = 4500;
const PROXIMO_LIMIAR = {
  valor: 6000,
  beneficio: "Bolsa parcial do próximo semestre",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-AO");
}

export default function BeneficiosPage() {
  const valorEmFalta = Math.max(PROXIMO_LIMIAR.valor - CONTRIBUICOES_ATUAIS, 0);
  const progressoElegibilidade = Math.min(
    (CONTRIBUICOES_ATUAIS / PROXIMO_LIMIAR.valor) * 100,
    100,
  );

  return (
    <StudentLayout pageTitle="Benefícios">
      <div className="space-y-8">
        <header className="rounded-[28px] border border-[#E7E0D2] bg-gradient-to-br from-[#F8F4EA] via-[#F6F1E7] to-white px-6 py-7 shadow-[0_10px_30px_rgba(68,68,65,0.06)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Benefícios académicos
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-gray-800 sm:text-5xl">
                Painel de Benefícios
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-gray-500">
                Gere as tuas vantagens académicas, acompanha a evolução da bolsa
                e desbloqueia novas oportunidades através da nossa rede de
                parceiros.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Benefícios ativos
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-800">2</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Próxima revisão
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-800">
                  42 dias
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[340px_1fr]">
          <div className="space-y-5">
            <article className="rounded-[24px] border border-[#E7E0D2] bg-[#F7F2E8] p-5 shadow-[0_8px_24px_rgba(68,68,65,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm">
                  <Clock3 className="h-3.5 w-3.5 text-primary-600" />
                  42 dias
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <p className="text-sm font-semibold text-gray-700">
                  Membro ativo
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
                  Elegível para fundos
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                <p className="text-xs font-medium text-gray-400">
                  Próxima revisão em
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  14 de Junho de 2025
                </p>
              </div>

              <button className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800">
                Ver detalhes da conta
              </button>
            </article>

            <article className="rounded-[24px] border border-[#E7E0D2] bg-white p-5 shadow-[0_8px_24px_rgba(68,68,65,0.05)]">
              <p className="text-sm font-semibold text-gray-700">
                Em progresso
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
                Elegibilidade do próximo benefício
              </p>

              <div className="mt-5 rounded-2xl bg-[#F7F2E8] px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Contribuições atuais</span>
                  <span className="text-primary-600">
                    {formatCurrency(CONTRIBUICOES_ATUAIS)} /{" "}
                    {formatCurrency(PROXIMO_LIMIAR.valor)} Kz
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-primary-600"
                    style={{ width: `${progressoElegibilidade}%` }}
                  ></div>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  Faltam {formatCurrency(valorEmFalta)} Kz para seres elegível
                  para bolsa parcial
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Ao atingir {formatCurrency(PROXIMO_LIMIAR.valor)} Kz em
                  contribuições, desbloqueias{" "}
                  {PROXIMO_LIMIAR.beneficio.toLowerCase()}.
                </p>
              </div>

              <ul className="mt-5 space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <CircleCheck className="h-4.5 w-4.5 text-primary-600" />
                  <span>
                    Contribuições acumuladas:{" "}
                    {formatCurrency(CONTRIBUICOES_ATUAIS)} Kz
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <CircleCheck className="h-4.5 w-4.5 text-primary-600" />
                  <span>
                    Próximo limiar: {formatCurrency(PROXIMO_LIMIAR.valor)} Kz
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="h-4.5 w-4.5 rounded-full border border-gray-300 bg-white"></span>
                  <span>Desbloqueia: {PROXIMO_LIMIAR.beneficio}</span>
                </li>
              </ul>
            </article>
          </div>

          <div className="space-y-5">
            <article className="rounded-[28px] border border-[#E7E0D2] bg-white p-5 shadow-[0_10px_30px_rgba(68,68,65,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-600">
                  Disponíveis agora
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Selecionados para ti
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {BENEFICIOS_DISPONIVEIS.map((beneficio) => (
                  <div
                    key={beneficio.id}
                    className="group rounded-[22px] bg-gradient-to-br from-purple-600 via-purple-600 to-purple-500 px-5 py-5 text-white shadow-[0_12px_30px_rgba(83,74,183,0.24)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                          {beneficio.categoria}
                        </p>
                        <h3 className="mt-3 text-[28px] font-semibold leading-[1.1] tracking-tight">
                          {beneficio.titulo}
                        </h3>
                        <p className="mt-2 text-sm text-purple-100">
                          {beneficio.instituicao}
                        </p>
                      </div>
                      <span className="rounded-2xl bg-white/10 p-2.5">
                        <GraduationCap className="h-6 w-6 text-purple-100" />
                      </span>
                    </div>

                    <button className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-purple-100 transition group-hover:text-white">
                      {beneficio.acao}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[28px] border border-[#E7E0D2] bg-white p-5 shadow-[0_10px_30px_rgba(68,68,65,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-600">
                  Desbloqueáveis
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Próximo semestre
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {DESBLOQUEAVEIS.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-[#ECE6DA] bg-[#FBF8F2] px-4 py-5 text-center transition hover:border-[#E0D8C8] hover:bg-white"
                  >
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-gray-700">
                      {item.titulo}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      {item.regra}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* <section className="rounded-[24px] border border-[#E7E0D2] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(68,68,65,0.05)]">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Nossos parceiros
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {PARCEIROS.map((parceiro) => (
              <div
                key={parceiro}
                className="inline-flex items-center gap-2 rounded-full border border-[#ECE6DA] bg-[#FBF8F2] px-4 py-2 text-sm font-medium text-gray-500"
              >
                <BookOpenText className="h-4 w-4 text-gray-400" />
                {parceiro}
              </div>
            ))}
          </div>
        </section> */}
      </div>
    </StudentLayout>
  );
}
