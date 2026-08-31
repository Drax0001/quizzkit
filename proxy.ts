import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only — a present cookie doesn't prove the session is
// still valid. Every protected Server Component/Action re-verifies with
// requireSession() (lib/session.ts), which is the actual authorization
// boundary. This proxy just avoids flashing protected UI at signed-out
// visitors before that check runs.
//
// Fail-closed by design: every route is protected unless explicitly listed
// here as public. The previous version listed protected prefixes instead —
// any new route (like /forum, /courses, or "/" itself) was unprotected by
// default unless someone remembered to add it. That's the wrong direction
// to default in for an auth gate. See docs/handoff.md.
const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (isPublic) return NextResponse.next();

  if (!getSessionCookie(request)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Runs on everything except static assets, the PWA files, and Better
  // Auth's own API routes (which must stay reachable while signed out —
  // sign-in/sign-up themselves POST there).
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|sw.js).*)",
  ],
};
