import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/types/database";

/** Returns the signed-in user's profile, or redirects to /login. */
export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  return profile as Profile;
}

/** Require one of the given roles, else redirect away. */
export async function requireRole(roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!roles.includes(profile.role)) redirect("/menu");
  return profile;
}
