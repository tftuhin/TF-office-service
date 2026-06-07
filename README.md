# The Canteen — Office Cafeteria Management

Next.js 15 (App Router) · Supabase (Postgres + Auth + Realtime + RLS) · Tailwind · Recharts · Vercel-ready.

Staff order from a menu, the canteen works a live FIFO queue with browser notifications, and admins manage the menu, roles, and reporting.

## Quick start

```bash
# 1. Install
npm install

# 2. Create a Supabase project, then run the migration:
#    Supabase dashboard → SQL Editor → paste supabase/migrations/0001_init.sql → Run
#    (or with the CLI: supabase db push)

# 3. Configure env
cp .env.local.example .env.local
#    Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
#    (Supabase dashboard → Project Settings → API)

# 4. Run
npm run dev   # http://localhost:3000
```

### Make yourself an admin
Signup creates everyone as `user` (via the `handle_new_user` DB trigger). To bootstrap the
first admin, run once in the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@company.com';
```

After that, the Admin → Users panel can manage everyone else's roles.

## Deploy to Vercel
Import the repo, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, deploy. Add your Vercel URL
to Supabase → Authentication → URL Configuration (Site URL + redirect `…/auth/callback`).

## How it's wired

| Area | Where | Notes |
|---|---|---|
| Auth gating | `middleware.ts` + `lib/supabase/middleware.ts` | Redirects unauthenticated users; keeps the session cookie fresh. |
| Role gating | `app/(app)/layout.tsx` + `lib/auth.ts` | `requireRole()` guards staff/admin pages server-side. Kept out of middleware to avoid a DB hit per request. |
| RBAC at the data layer | `supabase/migrations/0001_init.sql` | RLS is the real enforcement. UI gating is convenience only. |
| FIFO dashboard | `app/(app)/canteen` + `components/canteen-board.tsx` | Ordered by `placed_at ASC`; live INSERT/UPDATE via Supabase Realtime. |
| Notifications | `components/notification-provider.tsx` | New-order alert (Realtime + sound + toast) and a 5-minute pending reminder. |
| Order completion | DB trigger `handle_order_completion` | Sets `completed_at` and computes `duration_minutes` server-side so it can't be spoofed. |
| Reports | `app/(app)/reports` + `components/reports-charts.tsx` | Month-to-month volume/revenue/top items, plus completion-time and peak-hour efficiency. |

## Design decisions worth knowing
- **RLS-first.** Every table has policies; a `SECURITY DEFINER` `is_staff_or_admin()` /
  `is_admin()` / `my_role()` set breaks the classic recursion you hit when a policy needs to
  read the caller's role from `profiles`.
- **Price snapshots.** `order_items.unit_price` records the price at purchase, so editing the
  menu later doesn't rewrite historical revenue.
- **No audio asset.** The alert tone is synthesized with the Web Audio API. Browsers may gate
  sound until the first user interaction with the tab.
- **UI primitives** in `components/ui/*` are intentionally minimal so you can drop in real
  shadcn/ui components (`npx shadcn@latest add button card input badge skeleton`) without
  touching page code — same names and props.

## What you may want to add next
- Email-domain allow-list on signup (restrict to your company domain).
- Per-item edit form in Admin → Menu (toggle/delete/add are wired; inline edit is a small extension).
- A Supabase Edge Function (cron) for the pending reminder if you want it to fire when no staff tab is open.
