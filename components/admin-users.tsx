"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile, Role } from "@/types/database";

const ROLES: Role[] = ["user", "staff", "admin"];

export function AdminUsers({ initialUsers, meId }: { initialUsers: Profile[]; meId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const supabase = createClient();

  async function setRole(user: Profile, role: Role) {
    if (user.role === role) return;
    const snapshot = users;
    setUsers((p) => p.map((u) => (u.id === user.id ? { ...u, role } : u)));
    const { error } = await supabase.from("profiles").update({ role }).eq("id", user.id);
    if (error) {
      setUsers(snapshot);
      alert(error.message);
    }
  }

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <Card key={u.id}>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {u.email} {u.id === meId && <Badge tone="muted" className="ml-1">you</Badge>}
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-canteen-line bg-white p-0.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(u, r)}
                  disabled={u.id === meId && r !== "admin"}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm capitalize transition-colors disabled:opacity-40",
                    u.role === r ? "bg-canteen-accent text-white" : "text-canteen-muted hover:text-canteen-ink"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
