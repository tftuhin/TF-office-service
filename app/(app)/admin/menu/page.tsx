import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminMenu } from "@/components/admin-menu";
import type { Item } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl">Manage Menu</h1>
      <AdminMenu initialItems={(data ?? []) as Item[]} />
    </div>
  );
}
