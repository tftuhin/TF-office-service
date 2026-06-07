import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/utils";
import type { OrderWithDetails } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, items(name))")
    .eq("user_id", profile.id)
    .order("placed_at", { ascending: false });

  const orders = (data ?? []) as OrderWithDetails[];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl">My Orders</h1>
      {orders.length === 0 && (
        <Card><CardBody className="text-center text-sm text-canteen-muted">You haven&apos;t placed any orders yet.</CardBody></Card>
      )}
      <div className="space-y-3">
        {orders.map((o) => {
          const total = o.order_items.reduce((s, li) => s + li.unit_price * li.quantity, 0);
          return (
            <Card key={o.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-canteen-muted">
                      {new Date(o.placed_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <ul className="mt-2 space-y-0.5 text-sm">
                      {o.order_items.map((li) => (
                        <li key={li.id} className="flex justify-between gap-6">
                          <span>{li.quantity}× {li.items?.name ?? "Item"}</span>
                          <span className="text-canteen-muted">{money(li.unit_price * li.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm font-medium">Total {money(total)}</p>
                  </div>
                  <div className="text-right">
                    {o.status === "completed" ? (
                      <Badge tone="ok">Completed</Badge>
                    ) : (
                      <Badge tone="warn">Pending</Badge>
                    )}
                    {o.status === "completed" && o.duration_minutes != null && (
                      <p className="mt-2 text-xs text-canteen-muted">Ready in {o.duration_minutes} min</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
