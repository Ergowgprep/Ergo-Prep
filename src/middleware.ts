import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const stagingPassword = process.env.STAGING_PASSWORD;

  // If STAGING_PASSWORD is not set, skip auth (production mode)
  if (!stagingPassword) {
    return NextResponse.next();
  }

  // Exempt Stripe webhook route from basic auth
  if (request.nextUrl.pathname === "/api/webhook") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [username, password] = decoded.split(":");
      if (username === "ergo" && password === stagingPassword) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Staging"',
    },
  });
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
