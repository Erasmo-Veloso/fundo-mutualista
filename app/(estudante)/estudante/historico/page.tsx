"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/estudante/StudentLayout";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Contribuicao {
  id: string;
  valor: string;
  data: string;
  status: string;
  metodoPagamento: string;
  referencia: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function HistoricoPage() {
  const { data: session } = useSession();
  const [contribuicoes, setContribuicoes] = useState<Contribuicao[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchContribuicoes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/contribuicoes?page=${currentPage}&limit=10`,
        );
        if (!response.ok) throw new Error("Falha ao buscar histórico");
        const data = await response.json();
        setContribuicoes(data.contribuicoes);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchContribuicoes();
    }
  }, [session?.user?.id, currentPage]);

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.pages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Histórico de contribuições">
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
      <StudentLayout pageTitle="Histórico de contribuições">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Histórico de contribuições">
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Total de contribuições</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {pagination?.total || 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Páginas</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {pagination?.page || 1} de {pagination?.pages || 1}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Por página</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {pagination?.limit || 10}
            </p>
          </div>
        </div>

        {/* Contributions Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Referência
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contribuicoes.length > 0 ? (
                contribuicoes.map((contrib) => (
                  <tr key={contrib.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {parseFloat(contrib.valor).toLocaleString("pt-AO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      Kz
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(contrib.data).toLocaleDateString("pt-AO")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contrib.metodoPagamento === "MULTICAIXA_EXPRESS"
                        ? "Multicaixa Express"
                        : contrib.metodoPagamento === "TRANSFERENCIA"
                          ? "Transferência"
                          : "Cartão"}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {contrib.referencia}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          contrib.status === "CONFIRMADO"
                            ? "bg-green-100 text-green-800"
                            : contrib.status === "PENDENTE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {contrib.status === "CONFIRMADO"
                          ? "Confirmada"
                          : contrib.status === "PENDENTE"
                            ? "Pendente"
                            : "Falhou"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-600"
                  >
                    Nenhuma contribuição no histórico
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.pages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-10 w-10 rounded-lg border transition ${
                      page === currentPage
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
