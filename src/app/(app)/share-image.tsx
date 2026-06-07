"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Share2, Download } from "lucide-react";
import { t } from "@/lib/i18n";

/** Wraps any content and adds Share / Download buttons that render it to a PNG. */
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
      backgroundColor: "#ffffff",
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function download() {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Расм сохта нашуд");
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
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* user cancelled share */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div ref={ref}>{children}</div>
      <div className="mt-2 flex gap-2">
        <button className="btn-ghost text-xs" onClick={share} disabled={busy}>
          <Share2 className="h-3.5 w-3.5" /> {busy ? "..." : t.shareImage}
        </button>
        <button className="btn-ghost text-xs" onClick={download} disabled={busy}>
          <Download className="h-3.5 w-3.5" /> {t.download}
        </button>
      </div>
    </div>
  );
}
