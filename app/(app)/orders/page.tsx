import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrderWithDetails } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(*, items(name)), profiles(email)")
    .order("placed_at", { ascending: false });

  // Admins see all orders, others see only their own
  if (profile.role !== "admin") {
    query = query.eq("user_id", profile.id);
  }

  const { data } = await query;

  const orders = (data ?? []) as (OrderWithDetails & { profiles: { email: string } })[];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl">{profile.role === "admin" ? "All Orders" : "My Orders"}</h1>
      {orders.length === 0 && (
        <Card><CardBody className="text-center text-sm text-canteen-muted">You haven&apos;t placed any orders yet.</CardBody></Card>
      )}
      <div className="space-y-3">
        {orders.map((o) => (
            <Card key={o.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-canteen-muted">
                        {new Date(o.placed_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })}
                      </p>
                      {profile.role === "admin" && (
                        <p className="text-xs text-canteen-accent font-medium">{o.profiles?.email || "Unknown"}</p>
                      )}
                    </div>
                    <ul className="mt-2 space-y-0.5 text-sm">
                      {o.order_items.map((li) => (
                        <li key={li.id}>
                          {li.quantity}× {li.items?.name ?? "Item"}
                        </li>
                      ))}
                    </ul>
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
        ))}
      </div>
    </div>
  );
}
