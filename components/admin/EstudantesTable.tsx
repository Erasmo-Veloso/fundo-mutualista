// @ts-nocheck
"use client";


import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EstudanteDetailModal } from "./EstudanteDetailModal";

interface EstudanteComResumo {
  id: string;
  nome: string;
  email: string;
  universidade?: string;
  curso?: string;
  status: string;
  createdAt: string;
  avatarUrl?: string;
  totalContribuido: number;
  ultimaContribuicao?: string;
  statusContribuicoes: {
    confirmadas: number;
    pendentes: number;
    falhadas: number;
  };
  quantidadePatentes: number;
}

export function EstudantesTable() {
  const [estudantes, setEstudantes] = useState<EstudanteComResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstudante, setSelectedEstudante] =
    useState<EstudanteComResumo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchEstudantes();
  }, []);

  async function fetchEstudantes() {
    try {
      const response = await fetch("/api/admin/estudantes");
      if (!response.ok) throw new Error("Erro ao buscar estudantes");
      const data = await response.json();
      setEstudantes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este estudante?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/estudantes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEstudantes(estudantes.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      setDeleting(null);
    }
  }

  function handleStatusChange(id: string, newStatus: string) {
    setEstudantes(
      estudantes.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2a2f35]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        <p className="font-medium">Erro ao carregar estudantes</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "success";
      case "PENDENTE":
        return "warning";
      case "TEMPORARIO":
        return "outline";
      case "SUSPENSO":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="border border-[#d5d8db] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f4f6f8] border-b border-[#d5d8db]">
                <TableHead className="font-semibold text-[#2a2f35]">
                  Nome
                </TableHead>
                <TableHead className="font-semibold text-[#2a2f35]">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-[#2a2f35]">
                  Universidade
                </TableHead>
                <TableHead className="text-right font-semibold text-[#2a2f35]">
                  Total
                </TableHead>
                <TableHead className="text-center font-semibold text-[#2a2f35]">
                  Contribuições
                </TableHead>
                <TableHead className="text-center font-semibold text-[#2a2f35]">
                  Patentes
                </TableHead>
                <TableHead className="font-semibold text-[#2a2f35]">
                  Status
                </TableHead>
                <TableHead className="text-center font-semibold text-[#2a2f35]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudantes.map((estudante) => (
                <TableRow
                  key={estudante.id}
                  className="border-b border-[#d5d8db] hover:bg-[#f4f6f8] transition-colors"
                >
                  <TableCell className="font-medium text-[#2a2f35]">
                    {estudante.nome}
                  </TableCell>
                  <TableCell className="text-[#66707a] text-sm">
                    {estudante.email}
                  </TableCell>
                  <TableCell className="text-[#66707a]">
                    {estudante.universidade || "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-[#2a2f35]">
                    {formatCurrency(estudante.totalContribuido)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center text-xs">
                      <Badge variant="success">
                        ✓ {estudante.statusContribuicoes.confirmadas}
                      </Badge>
                      <Badge variant="warning">
                        ⏳ {estudante.statusContribuicoes.pendentes}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {estudante.quantidadePatentes}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(estudante.status)}>
                      {estudante.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEstudante(estudante);
                          setModalOpen(true);
                        }}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleting === estudante.id}
                        onClick={() => handleDelete(estudante.id)}
                      >
                        {deleting === estudante.id ? "..." : "Del"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {estudantes.length === 0 && (
          <div className="text-center py-12 text-[#66707a]">
            <p className="text-sm">Nenhum estudante encontrado</p>
          </div>
        )}
      </div>

      <EstudanteDetailModal
        estudante={selectedEstudante}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
