import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Previous host. This file is the only place it is named. */
const LEGACY_HOST = "swarmchain.verafy.ai";

export function redirectLegacyHost(host: string | null, pathname: string, search: string): URL | null {
  if ((host ?? "").split(":")[0] !== LEGACY_HOST) return null;
  return new URL(`https://asc.verafy.ai${pathname}${search}`);
}

export function middleware(request: NextRequest) {
  const dest = redirectLegacyHost(request.headers.get("host"), request.nextUrl.pathname, request.nextUrl.search);
  if (dest) return NextResponse.redirect(dest, 301);
  return NextResponse.next();
}

export const config = { matcher: "/:path*" };
