"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/estudante/StudentLayout";
import { Download, FileText } from "lucide-react";

interface Recibo {
  id: string;
  valor: string;
  data: string;
  referencia: string;
  status: string;
}

export default function RecibosPage() {
  const { data: session } = useSession();
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecibos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/contribuicoes?limit=100");
        if (!response.ok) throw new Error("Falha ao buscar recibos");
        const data = await response.json();
        // Filter only confirmed contributions
        setRecibos(
          data.contribuicoes.filter((c: any) => c.status === "CONFIRMADO"),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchRecibos();
    }
  }, [session?.user?.id]);

  const handleDownloadRecibo = async (recibo: Recibo) => {
    try {
      // TODO: Implementar geração de PDF do recibo
      alert(
        `Download do recibo ${recibo.referencia} - ${recibo.valor} Kz (em desenvolvimento)`,
      );
    } catch (err) {
      console.error("Erro ao descarregar recibo", err);
    }
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Recibos">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
            <p className="mt-2 text-gray-600">A carregar recibos...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Recibos">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Recibos">
      <div className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recibos disponíveis
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Total de {recibos.length} recibo(s) disponível(is) para download
          </p>
        </div>

        {/* Recibos List */}
        <div className="space-y-3">
          {recibos.length > 0 ? (
            recibos.map((recibo) => (
              <div
                key={recibo.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Ref: {recibo.referencia}
                    </p>
                    <p className="text-sm text-gray-600">
                      {parseFloat(recibo.valor).toLocaleString("pt-AO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      Kz • {new Date(recibo.data).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadRecibo(recibo)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">Nenhum recibo disponível</p>
              <p className="mt-1 text-sm text-gray-500">
                Os recibos aparecem aqui após confirmar a contribuição
              </p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
