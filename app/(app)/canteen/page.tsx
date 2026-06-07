import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CanteenBoard } from "@/components/canteen-board";
import type { OrderWithDetails } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CanteenPage() {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  // FIFO: oldest pending order first.
  const { data } = await supabase
    .from("orders")
    .select("*, profiles(email), order_items(*, items(name))")
    .eq("status", "pending")
    .order("placed_at", { ascending: true });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl">Canteen Dashboard</h1>
        <p className="mt-1 text-sm text-canteen-muted">Pending orders, oldest first. Updates live as new orders arrive.</p>
      </header>
      <CanteenBoard initialOrders={(data ?? []) as OrderWithDetails[]} />
    </div>
  );
}
