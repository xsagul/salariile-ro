// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const response = NextResponse.next();

  // Blochează indexarea pe orice subdomeniu *.vercel.app
  // (preview deploys + URL-ul automat .vercel.app)
  if (host.endsWith(".vercel.app")) {
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );
  }

  return response;
}

export const config = {
  // Rulează pe toate rutele, mai puțin assets statice
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};