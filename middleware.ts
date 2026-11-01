import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthed = !!req.auth;
  const path = req.nextUrl.pathname;

  const protectedPrefixes = ["/api/favorites", "/api/ratings", "/api/lists"];
  if (!isAuthed && protectedPrefixes.some((p) => path.startsWith(p))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/favorites/:path*", "/api/ratings/:path*", "/api/lists/:path*"],
};
