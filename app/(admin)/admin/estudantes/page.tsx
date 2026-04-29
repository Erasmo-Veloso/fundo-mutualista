import AdminLayout from "@/components/admin/AdminLayout";
import { EstudantesTable } from "@/components/admin/EstudantesTable";

export default function EstudantesPage() {
  return (
    <AdminLayout pageTitle="Gestão de Estudantes">
      <div className="bg-white rounded-lg shadow border border-[#d5d8db] p-6">
        <h2 className="text-xl font-semibold text-[#2a2f35] mb-6">
          Lista de Estudantes
        </h2>
        <EstudantesTable />
      </div>
    </AdminLayout>
  );
}
