import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  // ✅ Allow unauthenticated users to access only these routes
  const publicRoutes = ["/", "/signin", "/signout"];

  if (!token) {
    if (!publicRoutes.includes(path)) {
      console.log(`Middleware - No token found, redirecting to /signin`);
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    // If no token is found, redirect to sign-in
    console.log("Middleware - No token found, redirecting to /signin");
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const userRole = token.role as string;
  console.log("Middleware - User Role:", userRole); // Debugging

  // Define role-based access paths
  const rolePaths: Record<string, string> = {
    volunteer: "/dashboard/volunteer",
    shelter: "/dashboard/shelter",
    donor: "/dashboard/donor",
  };

  // ✅ If the user is accessing the correct dashboard, allow access immediately
  if (rolePaths[userRole] && path.startsWith(rolePaths[userRole])) {
    console.log(`Middleware - Authorized access: ${userRole} to ${path}`);
    return NextResponse.next();
  }

  // 🚫 Otherwise, check if the user is trying to access another role's dashboard
  for (const [allowedRole, basePath] of Object.entries(rolePaths)) {
    if (path.startsWith("/dashboard") && !path.startsWith(basePath)) {
      if (userRole !== allowedRole) {
        console.log(`Middleware - Unauthorized access: ${userRole} to ${path}`);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Apply middleware to dashboard routes
export const config = {
  matcher: ["/dashboard/:path*", "/unauthorized"],
};
