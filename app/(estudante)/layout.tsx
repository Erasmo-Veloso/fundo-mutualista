import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Papel } from "@prisma/client";

export default async function EstudanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify user is ESTUDANTE (or ADMIN for access)
  if (session.user.papel !== Papel.ESTUDANTE) {
    // Redirect non-estudante users based on role
    if (session.user.papel === Papel.ADMIN) {
      // TODO: redirect to admin dashboard when ready
      redirect("/admin");
    } else if (session.user.papel === Papel.PARCEIRO) {
      redirect("/parceiro");
    }
  }

  return <>{children}</>;
}
