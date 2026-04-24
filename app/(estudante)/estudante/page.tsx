import { auth } from "@/lib/auth";

export default async function EstudantePage() {
  const session = await auth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold text-gray-800">
        Area do Estudante
      </h1>
      <p className="mt-2 text-gray-600">
        Utilizador autenticado: {session?.user?.email}
      </p>
    </main>
  );
}
