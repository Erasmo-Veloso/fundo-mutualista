"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/estudante/StudentLayout";
import { CalendarDays, Landmark, RotateCcw } from "lucide-react";

interface Contribuicao {
  id: string;
  valor: string;
  data: string;
  status: string;
  metodoPagamento: string;
  referencia: string;
}

type FiltroHistorico = "TODAS" | "MENSAL" | "UNICA" | "CONFIRMADO" | "PENDENTE";

const FILTROS: Array<{ key: FiltroHistorico; label: string }> = [
  { key: "TODAS", label: "Todas" },
  { key: "MENSAL", label: "Mensal" },
  { key: "UNICA", label: "Única" },
  { key: "CONFIRMADO", label: "Concluídas" },
  { key: "PENDENTE", label: "Pendentes" },
];

function formatarValor(valor: string) {
  const numero = Number.parseFloat(valor);
  return `${(Number.isNaN(numero) ? 0 : numero).toLocaleString("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Kz`;
}

function parseValor(valor: string) {
  const numero = Number.parseFloat(valor);
  return Number.isNaN(numero) ? 0 : numero;
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function obterTipoLinha(status: string) {
  if (status === "PENDENTE") return "Contribuição agendada";
  if (status === "FALHADO") return "Tentativa de contribuição";
  return "Contribuição confirmada";
}

function obterEstado(status: string) {
  if (status === "CONFIRMADO") {
    return {
      label: "Concluída",
      textClass: "text-emerald-700",
      dotClass: "bg-emerald-500",
    };
  }

  if (status === "PENDENTE") {
    return {
      label: "Pendente",
      textClass: "text-gray-500",
      dotClass: "bg-gray-400",
    };
  }

  return {
    label: "Falhada",
    textClass: "text-red-600",
    dotClass: "bg-red-500",
  };
}

export default function HistoricoPage() {
  const { data: session } = useSession();
  const [contribuicoes, setContribuicoes] = useState<Contribuicao[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroHistorico>("TODAS");
  const [limiteVisivel, setLimiteVisivel] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContribuicoes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/contribuicoes?page=1&limit=100");
        if (!response.ok) throw new Error("Falha ao buscar histórico");
        const data = await response.json();
        setContribuicoes(data.contribuicoes ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchContribuicoes();
    }
  }, [session?.user?.id]);

  const contribuicoesOrdenadas = useMemo(
    () =>
      [...contribuicoes].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
      ),
    [contribuicoes],
  );

  const contribuicoesFiltradas = useMemo(() => {
    return contribuicoesOrdenadas.filter((item) => {
      if (filtroAtivo === "TODAS") return true;
      if (filtroAtivo === "CONFIRMADO") return item.status === "CONFIRMADO";
      if (filtroAtivo === "PENDENTE") return item.status === "PENDENTE";

      // "Mensal" e "Única" permanecem como filtros visuais até existir esse campo no backend.
      return true;
    });
  }, [contribuicoesOrdenadas, filtroAtivo]);

  const contribuicoesVisiveis = contribuicoesFiltradas.slice(0, limiteVisivel);

  const totalContribuido = useMemo(
    () =>
      contribuicoesOrdenadas
        .filter((item) => item.status === "CONFIRMADO")
        .reduce((acc, item) => acc + parseValor(item.valor), 0),
    [contribuicoesOrdenadas],
  );

  const ciclosAtivos = useMemo(() => {
    const meses = new Set(
      contribuicoesOrdenadas
        .filter((item) => item.status === "CONFIRMADO")
        .map((item) => {
          const data = new Date(item.data);
          return `${data.getFullYear()}-${data.getMonth()}`;
        }),
    );
    return meses.size;
  }, [contribuicoesOrdenadas]);

  const proximaContribuicao = useMemo(() => {
    const pendentes = contribuicoesOrdenadas
      .filter((item) => item.status === "PENDENTE")
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    return pendentes[0] ?? null;
  }, [contribuicoesOrdenadas]);

  useEffect(() => {
    setLimiteVisivel(6);
  }, [filtroAtivo]);

  if (loading) {
    return (
      <StudentLayout pageTitle="Histórico">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
            <p className="mt-2 text-gray-600">A carregar histórico...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Histórico">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Histórico">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-5xl font-medium tracking-tight text-gray-800">
            Histórico de contribuições
          </h1>
          <p className="max-w-3xl text-sm text-gray-500">
            Revê os teus investimentos anteriores e o impacto acumulado das tuas contribuições. A
            consistência do teu apoio ajuda a transformar futuros.
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                Total contribuído
              </p>
              <Landmark className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-gray-800">
              {totalContribuido.toLocaleString("pt-AO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              Kz
            </p>
            <p className="mt-1 text-xs text-gray-400">Contribuições com estado confirmado</p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                Ciclos ativos
              </p>
              <RotateCcw className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-gray-800">{ciclosAtivos} meses</p>
            <p className="mt-1 text-xs text-gray-400">Consistência no apoio aos bolseiros</p>
          </article>

          <article className="rounded-xl border border-accent-50 bg-accent-50 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Próxima contribuição
              </p>
              <CalendarDays className="h-4 w-4 text-accent-600" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-gray-800">
              {proximaContribuicao ? formatarData(proximaContribuicao.data) : "--"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {proximaContribuicao
                ? `${formatarValor(proximaContribuicao.valor)} planeado`
                : "Sem contribuições pendentes"}
            </p>
          </article>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((filtro) => {
                const ativo = filtroAtivo === filtro.key;
                return (
                  <button
                    key={filtro.key}
                    onClick={() => setFiltroAtivo(filtro.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      ativo
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {filtro.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Data e tipo
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Programa
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Valor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Multiplicador
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contribuicoesVisiveis.length > 0 ? (
                  contribuicoesVisiveis.map((contrib) => {
                    const estado = obterEstado(contrib.status);

                    return (
                      <tr key={contrib.id} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-700">{formatarData(contrib.data)}</p>
                          <p className="text-xs text-gray-400">{obterTipoLinha(contrib.status)}</p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
                              FM
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Fundo Mutualista</p>
                              <p className="text-xs text-gray-400">{contrib.referencia}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                          {formatarValor(contrib.valor)}
                        </td>

                        <td className="px-5 py-4">
                          {contrib.status === "CONFIRMADO" ? (
                            <span className="inline-flex rounded bg-accent-400/20 px-2 py-1 text-xs font-semibold text-accent-800">
                              1x Base
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p
                            className={`inline-flex items-center gap-2 text-sm font-medium ${estado.textClass}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${estado.dotClass}`}></span>
                            {estado.label}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                      Nenhuma contribuição encontrada para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {contribuicoesFiltradas.length > limiteVisivel && (
            <div className="border-t border-gray-100 px-5 py-3 text-center">
              <button
                onClick={() => setLimiteVisivel((prev) => prev + 6)}
                className="text-sm font-semibold text-primary-600 transition hover:text-primary-800"
              >
                Carregar mais histórico
              </button>
            </div>
          )}
        </section>
      </div>
    </StudentLayout>
  );
}
