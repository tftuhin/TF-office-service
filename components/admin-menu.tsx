"use client";

import { useState } from "react";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/utils";
import type { Item } from "@/types/database";

export function AdminMenu({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  async function addItem() {
    if (!form.name.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("items")
      .insert({ name: form.name.trim(), description: form.description.trim() || null, price: Number(form.price) || 0 })
      .select("*")
      .single();
    setBusy(false);
    if (error) return alert(error.message);
    setItems((p) => [data as Item, ...p]);
    setForm({ name: "", description: "", price: "" });
  }

  async function toggle(item: Item) {
    setItems((p) => p.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i)));
    const { error } = await supabase.from("items").update({ is_available: !item.is_available }).eq("id", item.id);
    if (error) {
      setItems((p) => p.map((i) => (i.id === item.id ? { ...i, is_available: item.is_available } : i)));
      alert(error.message);
    }
  }

  async function remove(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const snapshot = items;
    setItems((p) => p.filter((i) => i.id !== item.id));
    const { error } = await supabase.from("items").delete().eq("id", item.id);
    if (error) {
      setItems(snapshot);
      alert(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-base">Add menu item</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Price"><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
          </div>
          <Button onClick={addItem} disabled={busy}><Plus size={18} /> Add item</Button>
        </CardBody>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardBody className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.name}</p>
                  {!item.is_available && <Badge tone="muted">Hidden</Badge>}
                </div>
                {item.description && <p className="truncate text-sm text-canteen-muted">{item.description}</p>}
                <p className="mt-1 text-sm font-medium text-canteen-accent">{money(item.price)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggle(item)}>
                {item.is_available ? <EyeOff size={16} /> : <Eye size={16} />}
                {item.is_available ? "Hide" : "Show"}
              </Button>
              <Button variant="danger" size="sm" onClick={() => remove(item)} aria-label="Delete"><Trash2 size={16} /></Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
