import { auth } from "@/lib/auth";
import { EstudantesTable } from "@/components/admin/EstudantesTable";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  // Proteger rota
  if (!session || session.user.papel !== "ADMIN") {
    redirect("/login");
  }

  // Buscar estatísticas
  const totalEstudantes = await prisma.utilizador.count({
    where: { papel: "ESTUDANTE" },
  });

  const contribuicoes = await prisma.contribuicao.findMany({
    where: { tipo: "ESTUDANTE" },
    select: { valor: true, status: true },
  });

  const totalArrecadado = contribuicoes.reduce(
    (acc, c) => acc + Number(c.valor),
    0,
  );

  const contribuicoesConfirmadas = contribuicoes.filter(
    (c) => c.status === "CONFIRMADO",
  ).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  return (
    <AdminLayout pageTitle="Dashboard de Administração">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-[#d5d8db]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#66707a]">
                Total de Estudantes
              </p>
              <p className="text-3xl font-bold text-[#2a2f35] mt-2">
                {totalEstudantes}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-[#d5d8db]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#66707a]">
                Total Arrecadado
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatCurrency(totalArrecadado)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-[#d5d8db]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#66707a]">
                Contribuições Confirmadas
              </p>
              <p className="text-3xl font-bold text-[#2a2f35] mt-2">
                {contribuicoesConfirmadas}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Estudantes */}
      <div className="bg-white rounded-lg shadow border border-[#d5d8db] p-6">
        <h2 className="text-xl font-semibold text-[#2a2f35] mb-6">
          Gestão de Estudantes
        </h2>
        <EstudantesTable />
      </div>
    </AdminLayout>
  );
}
