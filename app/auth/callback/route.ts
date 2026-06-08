import { NextResponse } from "next/server";

// OAuth callback for Supabase authentication
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect("/login?error=no_code");
  }

  // The actual auth exchange is handled by the client-side auth.ts
  // This route exists for OAuth provider redirects
  return NextResponse.redirect("/");
}
