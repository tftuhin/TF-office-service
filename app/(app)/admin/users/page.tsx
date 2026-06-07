import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminUsers } from "@/components/admin-users";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireRole(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl">Users</h1>
      <p className="mb-6 text-sm text-canteen-muted">Assign roles. Changes take effect on the user&apos;s next request.</p>
      <AdminUsers initialUsers={(data ?? []) as Profile[]} meId={me.id} />
    </div>
  );
}
