"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sinceLabel } from "@/lib/utils";
import type { OrderWithDetails } from "@/types/database";

const SELECT = "*, profiles(email), order_items(*, items(name))";

export function CanteenBoard({ initialOrders }: { initialOrders: OrderWithDetails[] }) {
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [completing, setCompleting] = useState<Set<string>>(new Set());
  // re-render every 30s so "Xm ago" labels stay fresh
  const [, force] = useState(0);
  const supabaseRef = useRef(createClient());

  const sortFifo = (list: OrderWithDetails[]) =>
    [...list].sort((a, b) => +new Date(a.placed_at) - +new Date(b.placed_at));

  const fetchOne = useCallback(async (id: string) => {
    const { data } = await supabaseRef.current.from("orders").select(SELECT).eq("id", id).single();
    return data as OrderWithDetails | null;
  }, []);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel("canteen-board")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const row = payload.new as { id: string; status: string };
          if (row.status !== "pending") return;
          const full = await fetchOne(row.id);
          if (full) setOrders((prev) => (prev.some((o) => o.id === full.id) ? prev : sortFifo([...prev, full])));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as { id: string; status: string };
          // Drop completed orders off the board (handles completion from any device).
          if (row.status === "completed") setOrders((prev) => prev.filter((o) => o.id !== row.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOne]);

  async function markComplete(id: string) {
    setCompleting((s) => new Set(s).add(id));
    // optimistic removal
    const snapshot = orders;
    setOrders((prev) => prev.filter((o) => o.id !== id));

    const { error } = await supabaseRef.current
      .from("orders")
      .update({ status: "completed" }) // completed_at + duration_minutes set by DB trigger
      .eq("id", id);

    if (error) {
      setOrders(snapshot); // revert
      alert("Could not complete order: " + error.message);
    }
    setCompleting((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-2 py-16 text-center">
          <CheckCircle2 className="text-canteen-ok" size={40} />
          <p className="font-display text-lg">All caught up</p>
          <p className="text-sm text-canteen-muted">No pending orders. New ones will appear here automatically.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((o, idx) => {
        const waiting = Math.floor((Date.now() - new Date(o.placed_at).getTime()) / 60000);
        const isCompleting = completing.has(o.id);
        return (
          <Card key={o.id} className={waiting >= 10 ? "ring-1 ring-canteen-accent/40" : ""}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge tone="muted">#{idx + 1} in queue</Badge>
                <span className="flex items-center gap-1 text-xs text-canteen-muted">
                  <Clock size={13} /> {sinceLabel(o.placed_at)}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-canteen-muted">Ordered by</p>
                <p className="truncate text-sm font-medium">{o.profiles?.email ?? "Unknown"}</p>
              </div>

              <ul className="space-y-1 border-t border-canteen-line pt-3 text-sm">
                {o.order_items.map((li) => (
                  <li key={li.id} className="flex items-center gap-2">
                    <span className="flex h-5 min-w-5 items-center justify-center rounded bg-canteen-accentSoft px-1 text-xs font-medium text-canteen-accent">
                      {li.quantity}
                    </span>
                    <span>{li.items?.name ?? "Item"}</span>
                  </li>
                ))}
              </ul>

              <Button variant="ok" className="w-full" onClick={() => markComplete(o.id)} disabled={isCompleting}>
                <CheckCircle2 size={18} />
                {isCompleting ? "Completing…" : "Mark as Completed"}
              </Button>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

export function CanteenBoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}><CardBody className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full" />
        </CardBody></Card>
      ))}
    </div>
  );
}
