import AdminLayout from "@/components/admin/AdminLayout";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RelatoriosPage() {
  const session = await auth();

  // Proteger rota
  if (!session || session.user.papel !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout pageTitle="Relatórios">
      <div className="bg-white rounded-lg shadow border border-[#d5d8db] p-6">
        <h2 className="text-xl font-semibold text-[#2a2f35] mb-6">
          Relatórios
        </h2>
        <p className="text-[#66707a]">Em desenvolvimento...</p>
      </div>
    </AdminLayout>
  );
}
