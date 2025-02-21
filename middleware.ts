import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXT_PUBLIC_JWT_SECRET });

  // Define protected routes and role-based access control
  const roleBasedRoutes: { [key: string]: string[] } = {
    donor: ["/dashboard/donations", "/upload", "dashboard/add-donation"],
    shelter: ["/dashboard/requests"],
    volunteer: ["/dashboard/volunteer"],
  };

  // Define all protected routes
  const protectedRoutes = ["/home", "/dashboard", "/profile", "/upload", "/add-donation", "/dashboard/:path*"];

  // Redirect unauthenticated users for protected routes
  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Role-based restriction
  for (const [role, routes] of Object.entries(roleBasedRoutes)) {
    if (routes.some((route) => request.nextUrl.pathname.startsWith(route))) {
      if (token?.role !== role) {
        return NextResponse.redirect(new URL("/unauthorized", request.url)); // Redirect unauthorized users
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/dashboard/:path*", "/profile", "/upload"],
};