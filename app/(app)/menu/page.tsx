import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { MenuOrder } from "@/components/menu-order";
import type { Item } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("is_available", true)
    .order("name");

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl">Today&apos;s Menu</h1>
        <p className="mt-1 text-sm text-canteen-muted">Pick what you&apos;d like — we&apos;ll start preparing as soon as you order.</p>
      </header>
      <MenuOrder items={(data ?? []) as Item[]} userId={profile.id} />
    </div>
  );
}
