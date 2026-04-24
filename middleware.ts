import { auth } from "@/lib/auth";
import type { Papel } from "@prisma/client";
import { NextResponse } from "next/server";

const roleAccess: Record<string, Papel[]> = {
  "/estudante": ["ESTUDANTE"],
  "/parceiro": ["PARCEIRO"],
  "/admin": ["ADMIN"],
};

const dashboardByRole = {
  ESTUDANTE: "/estudante",
  PARCEIRO: "/parceiro",
  ADMIN: "/admin",
} as const;

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const protectedRoot = ["/estudante", "/parceiro", "/admin"];
  const isProtected = protectedRoot.some((route) => pathname.startsWith(route));

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (session?.user?.papel && isAuthPage) {
    const redirectPath = dashboardByRole[session.user.papel];

    return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  if (!session?.user?.papel) {
    return NextResponse.next();
  }

  for (const [route, allowedRoles] of Object.entries(roleAccess)) {
    if (
      pathname.startsWith(route) &&
      !allowedRoles.includes(session.user.papel)
    ) {
      const redirectPath = dashboardByRole[session.user.papel];

      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/estudante/:path*",
    "/parceiro/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
