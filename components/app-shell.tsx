"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UtensilsCrossed, ClipboardList, ChefHat, BarChart3, Settings, Users, LogOut, Menu as MenuIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile, Role } from "@/types/database";
import { NotificationProvider } from "@/components/notification-provider";

type NavItem = { href: string; label: string; icon: React.ElementType; roles: Role[] };

const NAV: NavItem[] = [
  { href: "/menu",         label: "Menu",       icon: UtensilsCrossed, roles: ["user", "staff", "admin"] },
  { href: "/orders",       label: "My Orders",  icon: ClipboardList,   roles: ["user", "staff", "admin"] },
  { href: "/canteen",      label: "Canteen",    icon: ChefHat,         roles: ["staff", "admin"] },
  { href: "/reports",      label: "Reports",    icon: BarChart3,       roles: ["staff", "admin"] },
  { href: "/admin/menu",   label: "Manage Menu",icon: Settings,        roles: ["admin"] },
  { href: "/admin/users",  label: "Users",      icon: Users,           roles: ["admin"] },
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.roles.includes(profile.role));

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const Sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-white">🏢</div>
        <span className="font-display text-lg">Themefisher</span>
      </div>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-canteen-accentSoft font-medium text-canteen-accent" : "text-canteen-muted hover:bg-canteen-bg hover:text-canteen-ink"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-canteen-line pt-4">
        <div className="px-3 pb-2">
          <p className="truncate text-sm text-canteen-ink">{profile.email}</p>
          <Badge tone={profile.role === "admin" ? "accent" : profile.role === "staff" ? "ok" : "muted"} className="mt-1 capitalize">
            {profile.role}
          </Badge>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-canteen-muted hover:bg-canteen-bg hover:text-canteen-ink">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    // Staff/admin get realtime order notifications app-wide.
    <NotificationProvider enabled={profile.role === "staff" || profile.role === "admin"}>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-canteen-line bg-white md:block">{Sidebar}</aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">{Sidebar}</aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-canteen-line bg-white px-4 py-3 md:hidden">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-canteen-bg"><MenuIcon size={20} /></button>
            <span className="font-display">Themefisher</span>
          </header>
          <main className="flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}
