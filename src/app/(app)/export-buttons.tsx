"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { t } from "@/lib/i18n";

export type ExportColumn = { header: string; key: string; type?: "number" };

/** Excel (.xlsx) + PDF (print) export, with Tajik headers. Both run fully in the
 *  browser, no server or external service. PDF uses the browser's "Save as PDF"
 *  so Cyrillic/Tajik text renders correctly. */
export function ExportButtons({
  filename,
  title,
  subtitle,
  columns,
  rows,
  totalKey,
}: {
  filename: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: Record<string, any>[];
  totalKey?: string;
}) {
  const [busy, setBusy] = useState(false);
  const total = totalKey ? rows.reduce((s, r) => s + Number(r[totalKey] || 0), 0) : null;

  async function exportExcel() {
    setBusy(true);
    try {
      const writeXlsxFile = (await import("write-excel-file")).default;
      const schema = columns.map((c) => ({
        column: c.header,
        type: c.type === "number" ? Number : String,
        value: (r: any) => {
          const v = r[c.key];
          if (v === "" || v == null) return null;
          return c.type === "number" ? Number(v) : String(v);
        },
        width: 20,
      }));

      const data = [...rows];
      if (totalKey != null && total != null) {
        const totalRow: Record<string, any> = {};
        for (const c of columns) totalRow[c.key] = "";
        totalRow[columns[0].key] = t.total;
        totalRow[totalKey] = total;
        data.push(totalRow);
      }

      await writeXlsxFile(data, { schema, fileName: `${filename}.xlsx` });
    } catch {
      alert(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  function exportPdf() {
    const esc = (s: any) =>
      String(s ?? "").replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch] || ch));
    const num = (v: any) => Number(v || 0).toLocaleString("ru-RU");

    const head = columns
      .map((c) => `<th class="${c.type === "number" ? "num" : ""}">${esc(c.header)}</th>`)
      .join("");
    const body = rows
      .map(
        (r) =>
          `<tr>${columns
            .map(
              (c) =>
                `<td class="${c.type === "number" ? "num" : ""}">${
                  c.type === "number" ? num(r[c.key]) : esc(r[c.key])
                }</td>`
            )
            .join("")}</tr>`
      )
      .join("");
    const foot =
      totalKey != null && total != null
        ? `<tr class="total"><td>${esc(t.total)}</td>${columns
            .slice(1)
            .map(
              (c) =>
                `<td class="${c.type === "number" ? "num" : ""}">${
                  c.key === totalKey ? num(total) : ""
                }</td>`
            )
            .join("")}</tr>`
        : "";

    const w = window.open("", "_blank");
    if (!w) {
      alert(t.genericError);
      return;
    }
    w.document.write(
      `<!doctype html><html lang="tg"><head><meta charset="utf-8"><title>${esc(title)}</title>` +
        `<style>` +
        `*{font-family:Arial,'Segoe UI',system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}` +
        `body{margin:24px;color:#111}` +
        `h1{font-size:18px;margin:0 0 2px}` +
        `.sub{color:#666;font-size:12px;margin-bottom:14px}` +
        `table{width:100%;border-collapse:collapse;font-size:12px}` +
        `th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}` +
        `th{background:#e9f5ee;color:#136639}` +
        `.num{text-align:right;white-space:nowrap}` +
        `tr:nth-child(even) td{background:#fafafa}` +
        `tfoot tr.total td{font-weight:bold;background:#e9f5ee}` +
        `@media print{body{margin:0}}` +
        `</style></head><body>` +
        `<h1>${esc(t.appName)} — ${esc(title)}</h1>` +
        `<div class="sub">${esc(subtitle || "")}</div>` +
        `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>` +
        (foot ? `<tfoot>${foot}</tfoot>` : "") +
        `</table>` +
        `<script>window.onload=function(){setTimeout(function(){window.print();},150);};<\/script>` +
        `</body></html>`
    );
    w.document.close();
  }

  return (
    <div className="flex gap-2">
      <button type="button" className="btn-ghost text-xs" onClick={exportExcel} disabled={busy}>
        <FileSpreadsheet className="h-4 w-4" /> Excel
      </button>
      <button type="button" className="btn-ghost text-xs" onClick={exportPdf}>
        <FileText className="h-4 w-4" /> PDF
      </button>
    </div>
  );
}
