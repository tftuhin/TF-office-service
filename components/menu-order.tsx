"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Item } from "@/types/database";

export function MenuOrder({ items, userId }: { items: Item[]; userId: string }) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(
    () => items.filter((i) => (qty[i.id] ?? 0) > 0).map((i) => ({ item: i, q: qty[i.id] })),
    [items, qty]
  );
  const count = lines.reduce((s, l) => s + l.q, 0);

  const bump = (id: string, d: number) =>
    setQty((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) + d) }));

  async function placeOrder() {
    if (!lines.length) return;
    setPlacing(true);
    setError(null);
    const supabase = createClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({ user_id: userId, status: "pending" })
      .select("id")
      .single();

    if (orderErr || !order) {
      setPlacing(false);
      return setError(orderErr?.message ?? "Could not place order.");
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        item_id: l.item.id,
        unit_price: l.item.price, // snapshot for accurate reporting
        quantity: l.q,
      }))
    );

    setPlacing(false);
    if (itemsErr) return setError(itemsErr.message);

    // Optimistic success state; the canteen is notified in realtime by the DB insert.
    setPlaced(true);
    setQty({});
    setTimeout(() => {
      setPlaced(false);
      router.push("/orders");
    }, 1400);
  }

  if (placed) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
          <CheckCircle2 className="text-canteen-ok" size={40} />
          <h2 className="text-lg">Order placed!</h2>
          <p className="text-sm text-canteen-muted">The canteen has been notified. Taking you to your orders…</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3 pb-28">
      {items.length === 0 && (
        <Card><CardBody className="text-center text-sm text-canteen-muted">No items available right now.</CardBody></Card>
      )}

      {items.map((item) => {
        const q = qty[item.id] ?? 0;
        return (
          <Card key={item.id}>
            <CardBody className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-canteen-ink">{item.name}</p>
                {item.description && <p className="truncate text-sm text-canteen-muted">{item.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => bump(item.id, -1)} disabled={q === 0} aria-label="Decrease">
                  <Minus size={16} />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{q}</span>
                <Button variant="outline" size="sm" onClick={() => bump(item.id, 1)} aria-label="Increase">
                  <Plus size={16} />
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}

      {/* Sticky cart bar */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-canteen-line bg-white/95 p-4 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className="text-sm text-canteen-muted">{count} item{count === 1 ? "" : "s"} selected</p>
            <Button onClick={placeOrder} disabled={placing} size="lg">
              <ShoppingCart size={18} />
              {placing ? "Placing…" : "Place order"}
            </Button>
          </div>
          {error && <p className="mx-auto mt-2 max-w-3xl text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
