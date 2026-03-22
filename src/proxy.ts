import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // HTTP Basic Auth for staging (skip if STAGING_PASSWORD is not set)
  const stagingPassword = process.env.STAGING_PASSWORD;
  if (stagingPassword && request.nextUrl.pathname !== "/api/webhook") {
    const authHeader = request.headers.get("authorization");
    let authorized = false;

    if (authHeader) {
      const [scheme, encoded] = authHeader.split(" ");
      if (scheme === "Basic" && encoded) {
        const decoded = atob(encoded);
        const [username, password] = decoded.split(":");
        if (username === "ergo" && password === stagingPassword) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Staging"' },
      });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};