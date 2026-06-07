"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Route } from "lucide-react";
import { somoni } from "@/lib/money";
import { t } from "@/lib/i18n";
import { Shareable } from "./share-image";

type Point = { name?: string; value: number; day?: string; month?: string };

// Refresh pastel accents
const COLORS = ["#CFDDDB", "#E4CDED", "#C2DBE9", "#F1C8D0", "#C9CAEF"];
const SAGE = "#CFDDDB";
const GRID = "#1e2022"; // refresh-line
const AXIS = "#989898"; // refresh-muted
const AXIS_LINE = "#3a3d40"; // refresh-surface-3

const fmt = (v: any) => somoni(Number(v));
const tick = { fontSize: 11, fill: AXIS } as const;
const axis = { stroke: AXIS_LINE } as const;
const tooltipProps = {
  formatter: fmt,
  contentStyle: {
    background: "#292C2D",
    border: "1px solid #1e2022",
    borderRadius: 10,
    color: "#fff",
  },
  labelStyle: { color: "#fff" },
  itemStyle: { color: SAGE },
  cursor: { fill: "rgba(255,255,255,0.04)" },
} as const;

export function DailyChart({ data }: { data: { day: string; value: number }[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{t.dailyChart}</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="day" tick={tick} axisLine={axis} tickLine={axis} />
            <YAxis tick={tick} axisLine={axis} tickLine={axis} />
            <Tooltip {...tooltipProps} />
            <Line type="monotone" dataKey="value" stroke={SAGE} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{t.monthlyChart}</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="month" tick={tick} axisLine={axis} tickLine={axis} />
            <YAxis tick={tick} axisLine={axis} tickLine={axis} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="value" fill={SAGE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AccountChart({ data }: { data: Point[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{t.byAccount}</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label={(e: any) => e.name}
              stroke="#111315"
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipProps} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Shareable: stats by age, branded for forwarding to chat groups. */
export function AgeChart({ data, today }: { data: Point[]; today: string }) {
  return (
    <Shareable filename="omor-sin-sol">
      <div className="card">
        <div className="mb-1 flex items-center gap-1 text-xs text-refresh-muted-2">
          <Route className="h-3.5 w-3.5" /> {t.appName} · {today}
        </div>
        <h3 className="mb-3 font-semibold">{t.byAge}</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="name" tick={tick} axisLine={axis} tickLine={axis} />
              <YAxis tick={tick} axisLine={axis} tickLine={axis} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shareable>
  );
}

/** Shareable: top families. */
export function FamilyChart({ data, today }: { data: Point[]; today: string }) {
  return (
    <Shareable filename="omor-nasab">
      <div className="card">
        <div className="mb-1 flex items-center gap-1 text-xs text-refresh-muted-2">
          <Route className="h-3.5 w-3.5" /> {t.appName} · {today}
        </div>
        <h3 className="mb-3 font-semibold">{t.byFamily}</h3>
        <div style={{ width: "100%", height: Math.max(220, data.length * 32) }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis type="number" tick={tick} axisLine={axis} tickLine={axis} />
              <YAxis type="category" dataKey="name" tick={tick} axisLine={axis} tickLine={axis} width={90} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="value" fill={SAGE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shareable>
  );
}
