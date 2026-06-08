import { NextResponse } from "next/server";

export const revalidate = false;

// This route is only used in web mode, not in the mobile app
// Mobile apps use Supabase mobile SDKs for authentication
export async function GET() {
  return NextResponse.json({ message: "Mobile app - auth not available" });
}
