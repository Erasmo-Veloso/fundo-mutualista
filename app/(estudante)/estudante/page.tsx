"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import StudentLayout from "@/components/estudante/StudentLayout";
import {
  BookOpen,
  Gift,
  HandHeart,
  TrendingUp,
  Wallet2,
} from "lucide-react";

interface DashboardData {
  saldoContribuido: string;
  impactoReal: string;
  progressoBolsa: number;
  contribuicoesRecentes: Array<{
    id: string;
    valor: string;
    data: string;
    status: string;
    referencia: string;
  }>;
  beneficiosDisponiveis: number;
  accoesRapidas: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/estudante/dashboard");
        if (!response.ok) throw new Error("Falha ao buscar dashboard");
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDashboard();
    }
  }, [session?.user?.id]);

  if (loading) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
            <p className="mt-2 text-gray-600">A carregar dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const studentName = session?.user?.name?.split(" ")[0] || "Estudante";
  const quickActionSource = dashboardData?.accoesRapidas ?? [];
  const quickActions = [
    {
      id: "contribuir",
      label: "Contribuir",
      href:
        quickActionSource.find((acao) =>
          acao.href.includes("/contribuir"),
        )?.href || "/estudante/contribuir",
      icon: Wallet2,
      iconStyles: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "beneficios",
      label: "Ver benefícios",
      href:
        quickActionSource.find((acao) =>
          acao.href.includes("/beneficios"),
        )?.href || "/estudante/beneficios",
      icon: Gift,
      iconStyles: "bg-amber-50 text-amber-700",
    },
    {
      id: "apoio",
      label: "Pedir apoio",
      href:
        quickActionSource.find((acao) => acao.href.includes("/apoio"))
          ?.href || "/estudante/apoio",
      icon: HandHeart,
      iconStyles: "bg-gray-100 text-gray-500",
    },
    {
      id: "cursos",
      label: "Cursos",
      href:
        quickActionSource.find((acao) => acao.href.includes("/cursos"))
          ?.href || "/estudante/cursos",
      icon: BookOpen,
      iconStyles: "bg-indigo-50 text-indigo-500",
    },
  ];

  const formatActivityDate = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();

    if (activityDate.toDateString() === now.toDateString()) {
      return `Hoje, ${activityDate.toLocaleTimeString("pt-AO", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (activityDate.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    }

    return activityDate.toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "short",
    });
  };

  if (error) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </StudentLayout>
    );
  }

  if (!dashboardData) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <div className="text-center py-12 text-gray-600">
          Sem dados disponíveis
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <section className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            VISÃO GERAL DA CONTA
          </p>
          <h2 className="text-base font-medium text-gray-600">Olá, {studentName}.</h2>
        </section>

        <section className="rounded-xl bg-emerald-700 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-100">
                Saldo disponível
              </p>
              <p className="text-5xl font-semibold tracking-tight">
                {parseFloat(dashboardData.saldoContribuido).toLocaleString(
                  "pt-AO",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  },
                )}{" "}
                Kz
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/70 px-3 py-1 text-xs font-medium text-amber-300">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  Impacto futuro +{" "}
                  {parseFloat(dashboardData.impactoReal).toLocaleString("pt-AO", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  Kz
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-2 md:space-y-3">
              <div className="flex items-center justify-between text-sm text-emerald-100">
                <span>Progresso da meta</span>
                <span className="font-semibold text-white">
                  {dashboardData.progressoBolsa}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-emerald-500/70">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${dashboardData.progressoBolsa}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600">Ações rápidas</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((acao) => {
              const Icon = acao.icon;
              return (
              <Link
                key={acao.id}
                href={acao.href}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${acao.iconStyles}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-gray-700">{acao.label}</p>
              </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600">Atividade recente</h3>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
            {dashboardData.contribuicoesRecentes.length > 0 ? (
              dashboardData.contribuicoesRecentes.slice(0, 3).map((contrib) => (
                <div
                  key={contrib.id}
                  className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Wallet2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                      {contrib.referencia}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatActivityDate(contrib.data)}
                      </p>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-gray-500">
                    -
                    {parseFloat(contrib.valor).toLocaleString("pt-AO", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    Kz
                  </p>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">Nenhuma atividade recente</p>
                <Link
                  href="/estudante/contribuir"
                  className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:underline"
                >
                  Fazer primeira contribuição
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/estudante/historico"
            className="inline-block text-sm font-semibold text-emerald-600 hover:underline"
          >
            Ver todo o histórico
          </Link>
        </section>
      </div>
    </StudentLayout>
  );
}
