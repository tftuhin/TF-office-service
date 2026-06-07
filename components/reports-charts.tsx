"use client";

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { Card, CardBody } from "@/components/ui/card";
import { money } from "@/lib/utils";

const ACCENT = "#b4451f";
const OK = "#3f6f4f";
const GRID = "#e7e1d6";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardBody>
        <h3 className="mb-4 text-base">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {children as any}
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs uppercase tracking-wide text-canteen-muted">{label}</p>
        <p className="mt-1 font-display text-2xl">{value}</p>
      </CardBody>
    </Card>
  );
}

export function ReportsCharts({
  kpis,
  monthly,
  topItems,
  avgByDay,
  byHour,
}: {
  kpis: { totalOrders: number; totalRevenue: number; avgCompletion: number };
  monthly: { month: string; orders: number; revenue: number }[];
  topItems: { name: string; qty: number }[];
  avgByDay: { day: string; avg: number }[];
  byHour: { hour: string; orders: number }[];
}) {
  const tick = { fontSize: 12, fill: "#78716c" };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Total orders" value={String(kpis.totalOrders)} />
        <Kpi label="Total revenue" value={money(kpis.totalRevenue)} />
        <Kpi label="Avg. completion" value={`${kpis.avgCompletion} min`} />
      </div>

      <section>
        <h2 className="mb-3 text-lg">Month-to-month</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Orders & revenue by month">
            <BarChart data={monthly}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={tick} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number, n) => (n === "revenue" ? money(v) : v)} />
              <Bar dataKey="orders" fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill={OK} radius={[4, 4, 0, 0]} />
            </BarChart>
          </Panel>
          <Panel title="Top-selling items">
            <BarChart data={topItems} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={tick} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={tick} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                {topItems.map((_, i) => <Cell key={i} fill={i === 0 ? ACCENT : "#d98c6a"} />)}
              </Bar>
            </BarChart>
          </Panel>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg">Efficiency</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Average completion time (min) by day">
            <LineChart data={avgByDay}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="day" tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={tick} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => `${v} min`} />
              <Line type="monotone" dataKey="avg" stroke={ACCENT} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </Panel>
          <Panel title="Peak hours (orders by hour placed)">
            <BarChart data={byHour}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="hour" tick={{ ...tick, fontSize: 10 }} interval={2} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill={OK} radius={[3, 3, 0, 0]} />
            </BarChart>
          </Panel>
        </div>
      </section>
    </div>
  );
}
