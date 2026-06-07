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

const COLORS = ["#1f9d55", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899", "#84cc16"];

const fmt = (v: any) => somoni(Number(v));

export function DailyChart({ data }: { data: { day: string; value: number }[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{t.dailyChart}</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={fmt} />
            <Line type="monotone" dataKey="value" stroke="#1f9d55" strokeWidth={2} dot={false} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={fmt} />
            <Bar dataKey="value" fill="#1f9d55" radius={[4, 4, 0, 0]} />
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
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label={(e: any) => e.name}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={fmt} />
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
        <div className="mb-1 flex items-center gap-1 text-xs text-gray-400">
          <Route className="h-3.5 w-3.5" /> {t.appName} · {today}
        </div>
        <h3 className="mb-3 font-semibold">{t.byAge}</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={fmt} />
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
        <div className="mb-1 flex items-center gap-1 text-xs text-gray-400">
          <Route className="h-3.5 w-3.5" /> {t.appName} · {today}
        </div>
        <h3 className="mb-3 font-semibold">{t.byFamily}</h3>
        <div style={{ width: "100%", height: Math.max(220, data.length * 32) }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={fmt} />
              <Bar dataKey="value" fill="#1f9d55" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shareable>
  );
}
