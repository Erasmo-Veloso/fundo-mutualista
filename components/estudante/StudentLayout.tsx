"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Wallet,
  History,
  Gift,
  Bookmark,
  BookOpen,
  Users,
  Zap,
  AlertCircle,
  Trophy,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/estudante" },
  { label: "Contribuir", icon: Wallet, href: "/estudante/contribuir" },
  { label: "Histórico", icon: History, href: "/estudante/historico" },
  { label: "Benefícios", icon: Gift, href: "/estudante/beneficios" },
  /* { label: "Bolsas", icon: Bookmark, href: "/estudante/bolsas" },
  { label: "Cursos", icon: BookOpen, href: "/estudante/cursos" },
  { label: "Mentoria", icon: Users, href: "/estudante/mentoria" },
  { label: "Impacto", icon: Zap, href: "/estudante/impacto" }, */
  { label: "Apoio Emergencial", icon: AlertCircle, href: "/estudante/apoio" },
  { label: "Conquistas", icon: Trophy, href: "/estudante/conquistas" },
  { label: "Notificações", icon: Bell, href: "/estudante/notificacoes" },
  { label: "Perfil", icon: User, href: "/estudante/perfil" },
];

interface StudentLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  unreadNotifications?: number;
}

export default function StudentLayout({
  children,
  pageTitle = "Dashboard",
  unreadNotifications = 0,
}: StudentLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: true, redirectTo: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-200 bg-[#F6F1E7] text-gray-700 md:flex">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tight text-primary-600">
              FundoMutualista
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Área do Estudante
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-primary-600 shadow-sm ring-1 ring-primary-50"
                    : "text-gray-600 hover:bg-white/80 hover:text-gray-800"
                }`}
              >
                <span
                  className={`absolute right-0 top-2 bottom-2 w-1 rounded-full transition-all ${
                    isActive ? "bg-primary-400" : "bg-transparent"
                  }`}
                />
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-primary-600"
                      : "text-gray-400 group-hover:text-primary-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 px-3 py-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-white/80 hover:text-gray-800"
          >
            <LogOut className="h-5 w-5 text-gray-400 transition-colors hover:text-primary-400" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="w-full md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>

            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                <Bell className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Avatar & Menu */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-semibold shadow-sm ring-4 ring-primary-50"
              >
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}

                {showMenu && (
                  <div className="absolute right-0 top-12 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-200 px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {session?.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/estudante/perfil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
