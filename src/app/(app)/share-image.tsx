"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Share2, Download } from "lucide-react";
import { t } from "@/lib/i18n";

/**
 * Wraps a card and overlays small share / download icon buttons in its
 * top-right corner. The buttons live inside the captured node but are marked
 * `data-no-export` and filtered out, so they never appear in the PNG.
 */
export function Shareable({
  filename,
  children,
}: {
  filename: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function toBlob(): Promise<Blob | null> {
    if (!ref.current) return null;
    const dataUrl = await toPng(ref.current, {
      pixelRatio: 2,
      backgroundColor: "#111315",
      cacheBust: true,
      filter: (node) =>
        !(node instanceof HTMLElement && node.dataset.noExport === "true"),
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  function saveBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function download() {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (blob) saveBlob(blob);
    } catch {
      alert(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (!blob) return;
      const file = new File([blob], `${filename}.png`, { type: "image/png" });
      const nav = navigator as any;
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: t.appName });
      } else {
        saveBlob(blob);
      }
    } catch {
      /* user cancelled share */
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "rounded-lg p-1.5 text-current opacity-50 transition hover:opacity-100 disabled:opacity-30";

  return (
    <div ref={ref} className="relative">
      {children}
      <div data-no-export className="absolute right-3 top-3 z-10 flex gap-0.5">
        <button type="button" className={btn} onClick={share} disabled={busy} title={t.shareImage} aria-label={t.shareImage}>
          <Share2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={download} disabled={busy} title={t.download} aria-label={t.download}>
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
