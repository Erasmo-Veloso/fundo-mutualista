"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Estudante {
  id: string;
  nome: string;
  email: string;
  universidade?: string;
  curso?: string;
  status: string;
  createdAt: string;
  totalContribuido: number;
  statusContribuicoes: {
    confirmadas: number;
    pendentes: number;
    falhadas: number;
  };
  quantidadePatentes: number;
}

export function EstudanteDetailModal({
  estudante,
  open,
  onOpenChange,
  onStatusChange,
}: {
  estudante: Estudante | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [saving, setSaving] = useState(false);

  if (!estudante) return null;

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/estudantes/${estudante.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onStatusChange(estudante.id, newStatus);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Detalhes do Estudante</DialogTitle>
        <DialogClose onClick={() => onOpenChange(false)} />
      </DialogHeader>

      <DialogContent>
        <div className="space-y-6">
          {/* Informações Pessoais */}
          <div>
            <h3 className="text-sm font-semibold text-[#2a2f35] mb-3">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#66707a]">Nome</p>
                <p className="font-medium text-[#2a2f35]">{estudante.nome}</p>
              </div>
              <div>
                <p className="text-[#66707a]">Email</p>
                <p className="font-medium text-[#2a2f35]">{estudante.email}</p>
              </div>
              <div>
                <p className="text-[#66707a]">Universidade</p>
                <p className="font-medium text-[#2a2f35]">
                  {estudante.universidade || "-"}
                </p>
              </div>
              <div>
                <p className="text-[#66707a]">Curso</p>
                <p className="font-medium text-[#2a2f35]">
                  {estudante.curso || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-[#d5d8db] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#2a2f35]">Status</h3>
                <p className="text-xs text-[#66707a] mt-1">
                  Status actual: <Badge>{estudante.status}</Badge>
                </p>
              </div>
              {estudante.status === "PENDENTE" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleStatusChange("ACTIVO")}
                  disabled={saving}
                >
                  {saving ? "A atualizar..." : "Ativar"}
                </Button>
              )}
              {estudante.status === "ACTIVO" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusChange("SUSPENSO")}
                  disabled={saving}
                >
                  {saving ? "A atualizar..." : "Suspender"}
                </Button>
              )}
            </div>
          </div>

          {/* Contribuições */}
          <div className="border-t border-[#d5d8db] pt-4">
            <h3 className="text-sm font-semibold text-[#2a2f35] mb-3">
              Contribuições
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#f4f6f8] rounded-lg p-3">
                <p className="text-[#66707a] text-xs">Total Contribuído</p>
                <p className="text-lg font-bold text-[#2a2f35] mt-1">
                  {formatCurrency(estudante.totalContribuido)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-[#66707a] text-xs">Confirmadas</p>
                <p className="text-lg font-bold text-green-700 mt-1">
                  {estudante.statusContribuicoes.confirmadas}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-[#66707a] text-xs">Pendentes</p>
                <p className="text-lg font-bold text-amber-700 mt-1">
                  {estudante.statusContribuicoes.pendentes}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-[#66707a] text-xs">Falhadas</p>
                <p className="text-lg font-bold text-red-700 mt-1">
                  {estudante.statusContribuicoes.falhadas}
                </p>
              </div>
            </div>
          </div>

          {/* Patentes */}
          <div className="border-t border-[#d5d8db] pt-4">
            <h3 className="text-sm font-semibold text-[#2a2f35] mb-2">
              Patentes Atingidas
            </h3>
            <p className="text-lg font-bold text-[#2a2f35]">
              {estudante.quantidadePatentes}
            </p>
          </div>
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Fechar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
