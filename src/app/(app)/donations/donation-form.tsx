"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Camera, ImagePlus } from "lucide-react";
import { t } from "@/lib/i18n";
import { parseOcr } from "@/lib/ocr";
import { NumberInput } from "../ui/number-input";
import { Select } from "../ui/select";
import { createDonation } from "./actions";

type Acc = { id: string; name: string };

export function DonationForm({
  accounts,
  today,
  embedded = false,
  onSaved,
}: {
  accounts: Acc[];
  today: string;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(embedded);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // OCR state
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMsg, setScanMsg] = useState("");

  // controlled fields (so OCR can fill them)
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [age, setAge] = useState("");
  const [anon, setAnon] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [note, setNote] = useState("");

  function reset() {
    setAmount(""); setDate(today); setFirstName(""); setFamilyName("");
    setAge(""); setAnon(false); setAccountId(accounts[0]?.id ?? "");
    setNote(""); setScanMsg(""); setScanProgress(0);
  }

  async function handleScan(file: File) {
    setScanning(true);
    setScanMsg(t.scanning);
    setScanProgress(0);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      // Receipts are Russian/Tajik Cyrillic; +eng for digits, "DC", "Alif".
      const { data } = await Tesseract.recognize(file, "rus+eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text") setScanProgress(Math.round(m.progress * 100));
        },
      });
      const parsed = parseOcr(data.text || "");
      let filled: string[] = [];
      if (parsed.amount) { setAmount(parsed.amount); filled.push("маблағ"); }
      if (parsed.date) { setDate(parsed.date); filled.push("сана"); }
      if (parsed.provider) {
        const match = accounts.find((a) =>
          a.name.toLowerCase().includes(parsed.provider!.toLowerCase())
        );
        if (match) { setAccountId(match.id); filled.push("ҳисоб"); }
      }
      setScanMsg(
        filled.length
          ? `Пур шуд: ${filled.join(", ")} — тафтиш кунед`
          : "Чизе ёфт нашуд — дастӣ ворид кунед"
      );
    } catch (e) {
      setScanMsg("Сканер кор накард — дастӣ ворид кунед");
    } finally {
      setScanning(false);
    }
  }

  async function submit(form: HTMLFormElement) {
    if (scanning) return;
    setBusy(true); setError("");
    try {
      const res = await createDonation(new FormData(form));
      if (res?.error) { setError(res.error); return; }
      reset();
      router.refresh();
      if (embedded) onSaved?.();
      else setOpen(false);
    } catch {
      setError(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (!embedded && !open) {
    return (
      <button className="btn-primary mb-4" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {t.newDonation}
      </button>
    );
  }

  return (
    <form
      className={embedded ? "space-y-3" : "card mb-4 space-y-3"}
      onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}
    >
      {!embedded && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t.newDonation}</h3>
          <button type="button" className="text-refresh-muted-2 hover:text-refresh-text" onClick={() => setOpen(false)} aria-label={t.close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* OCR scan */}
      <div className="rounded-xl border border-dashed border-refresh-surface-3 bg-refresh-surface-2 p-3">
        <p className="mb-2 text-xs text-refresh-muted">{t.ocrHint}</p>
        {/* gallery / files — no capture, so mobile shows the photo library */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = ""; }}
        />
        {/* camera — capture opens the camera on mobile */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScan(f); e.target.value = ""; }}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" disabled={scanning} onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> {t.addImage}
          </button>
          <button type="button" className="btn-ghost" disabled={scanning} onClick={() => cameraRef.current?.click()}>
            <Camera className="h-4 w-4" /> {t.takePhoto}
          </button>
        </div>
        {scanning && (
          <p className="mt-2 text-xs text-refresh-muted">{t.scanning} {scanProgress}%</p>
        )}
        {scanMsg && <p className="mt-2 text-xs font-medium text-refresh-sage">{scanMsg}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t.amount} * <span className="text-refresh-muted-2">({t.required})</span></label>
          <NumberInput name="amount" value={amount} onValueChange={setAmount} required />
        </div>
        <div>
          <label className="label">{t.date} * <span className="text-refresh-muted-2">({t.required})</span></label>
          <input name="date" type="date" className="input"
            value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="label">{t.account}</label>
        <Select
          name="accountId"
          value={accountId}
          onValueChange={setAccountId}
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
        />
        <p className="mt-1 text-xs text-refresh-muted-2">{t.accountIsMethodHint}</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isAnonymous" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
        {t.anonymous}
      </label>

      {!anon && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">{t.firstName}</label>
            <input name="firstName" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="label">{t.familyName}</label>
            <input name="familyName" className="input" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          </div>
          <div>
            <label className="label">{t.age}</label>
            <input name="age" type="number" min="0" max="120" className="input" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">{t.note}</label>
        <input name="note" className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <p className="rounded-lg bg-refresh-pink/10 px-3 py-2 text-sm text-refresh-pink">{error}</p>}

      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy || scanning}>{t.save}</button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => { reset(); if (embedded) onSaved?.(); else setOpen(false); }}
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
