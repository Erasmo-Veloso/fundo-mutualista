"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Bell,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Estudantes", icon: Users, href: "/admin/estudantes" },
  { label: "Relatórios", icon: BarChart3, href: "/admin/relatorios" },
  { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AdminLayout({
  children,
  pageTitle = "Dashboard",
}: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: true, redirectTo: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-[#ece9df]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#d5d8db] bg-white text-gray-700 md:flex">
        <div className="flex items-center justify-between border-b border-[#d5d8db] px-6 py-5">
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tight text-[#2a2f35]">
              FundoMutualista
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#95a0aa]">
              Área do Administrador
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#f4f6f8] text-[#2a2f35] border-l-4 border-[#2a2f35]"
                    : "text-[#66707a] hover:bg-[#f4f6f8] hover:text-[#2a2f35]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-[#2a2f35]"
                      : "text-[#95a0aa] group-hover:text-[#2a2f35]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#d5d8db] px-3 py-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#66707a] transition-all duration-200 hover:bg-[#f4f6f8] hover:text-[#2a2f35]"
          >
            <LogOut className="h-5 w-5 text-[#95a0aa] transition-colors hover:text-[#2a2f35]" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="w-full md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-[#d5d8db] bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-2xl font-bold text-[#2a2f35]">{pageTitle}</h1>

            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative rounded-lg p-2 text-[#66707a] hover:bg-[#f4f6f8]">
                <Bell className="h-6 w-6" />
              </button>

              {/* Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2f35] text-white font-semibold shadow-sm ring-4 ring-[#f4f6f8]"
                >
                  {session?.user?.nome?.charAt(0).toUpperCase() ||
                    session?.user?.name?.charAt(0).toUpperCase() ||
                    "A"}
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-12 w-56 rounded-lg border border-[#d5d8db] bg-white shadow-lg z-50">
                    <div className="border-b border-[#d5d8db] px-4 py-3">
                      <p className="font-medium text-[#2a2f35]">
                        {session?.user?.nome || session?.user?.name}
                      </p>
                      <p className="text-xs text-[#66707a]">
                        {session?.user?.email}
                      </p>
                      <p className="text-xs text-[#95a0aa] mt-1">
                        Papel:{" "}
                        <span className="font-semibold text-[#2a2f35]">
                          Administrador
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleSignOut();
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da plataforma
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
