import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportsCharts } from "@/components/reports-charts";
import type { OrderWithDetails } from "@/types/database";

export const dynamic = "force-dynamic";

function monthKey(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", year: "numeric" });
}

export default async function ReportsPage() {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, items(name))")
    .order("placed_at", { ascending: true });

  const orders = (data ?? []) as OrderWithDetails[];

  // --- Month-to-month: orders + revenue ------------------------------------
  const byMonth = new Map<string, { month: string; orders: number; revenue: number }>();
  // --- Top items -----------------------------------------------------------
  const itemTotals = new Map<string, number>();
  // --- Efficiency: avg duration by day + peak hours ------------------------
  const byDay = new Map<string, { sum: number; n: number }>();
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, orders: 0 }));

  for (const o of orders) {
    const mk = monthKey(o.placed_at);
    const orderRevenue = o.order_items.reduce((s, li) => s + li.unit_price * li.quantity, 0);
    const m = byMonth.get(mk) ?? { month: mk, orders: 0, revenue: 0 };
    m.orders += 1;
    m.revenue += orderRevenue;
    byMonth.set(mk, m);

    for (const li of o.order_items) {
      const name = li.items?.name ?? "Item";
      itemTotals.set(name, (itemTotals.get(name) ?? 0) + li.quantity);
    }

    byHour[new Date(o.placed_at).getHours()].orders += 1;

    if (o.status === "completed" && o.duration_minutes != null) {
      const dk = new Date(o.placed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const d = byDay.get(dk) ?? { sum: 0, n: 0 };
      d.sum += o.duration_minutes;
      d.n += 1;
      byDay.set(dk, d);
    }
  }

  const monthly = [...byMonth.values()];
  const topItems = [...itemTotals.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);
  const avgByDay = [...byDay.entries()].map(([day, v]) => ({ day, avg: Math.round(v.sum / v.n) }));

  const totalOrders = orders.length;
  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const completed = orders.filter((o) => o.duration_minutes != null);
  const avgCompletion = completed.length
    ? Math.round(completed.reduce((s, o) => s + (o.duration_minutes ?? 0), 0) / completed.length)
    : 0;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl">Reports</h1>
        <p className="mt-1 text-sm text-canteen-muted">Order volume, revenue, and cafeteria efficiency.</p>
      </header>
      <ReportsCharts
        kpis={{ totalOrders, totalRevenue, avgCompletion }}
        monthly={monthly}
        topItems={topItems}
        avgByDay={avgByDay}
        byHour={byHour}
      />
    </div>
  );
}
