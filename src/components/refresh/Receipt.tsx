const ZIGZAG_TEETH = 24;

function buildZigzagClipPath(teeth: number, depthPx: number): string {
  const step = 100 / teeth;
  const points: string[] = [];
  // Top edge zigzag
  for (let i = 0; i <= teeth; i++) {
    const x = (i * step).toFixed(2);
    const y = i % 2 === 0 ? `${depthPx}px` : '0';
    points.push(`${x}% ${y}`);
  }
  // Bottom edge zigzag (right-to-left)
  for (let i = teeth; i >= 0; i--) {
    const x = (i * step).toFixed(2);
    const y = i % 2 === 0 ? `calc(100% - ${depthPx}px)` : '100%';
    points.push(`${x}% ${y}`);
  }
  return `polygon(${points.join(', ')})`;
}

const RECEIPT_CLIP_PATH = buildZigzagClipPath(ZIGZAG_TEETH, 6);

export type ReceiptProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Paper-receipt surface — white card with a zigzag tear pattern on the top
 * and bottom edges. Inherits the system's sans font (Inter) — no monospace —
 * so prices line up via `tabular-nums` instead of fixed-width characters.
 *
 * Composes with `<ReceiptHeader>`, `<ReceiptItem>`, `<ReceiptLine>`, and
 * `<ReceiptDivider>` — see each for usage.
 */
export function Receipt({ children, className = '' }: ReceiptProps) {
  return (
    <div
      className={`bg-white px-6 py-7 text-[#111315] ${className}`}
      style={{ clipPath: RECEIPT_CLIP_PATH }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptHeaderProps = {
  /** Big centered brand / store name. */
  title: React.ReactNode;
  /** Smaller line beneath the title — address, phone, etc. */
  subtitle?: React.ReactNode;
  /** Date / order number / cashier — small uppercase eyebrow above the title. */
  meta?: React.ReactNode;
};

/**
 * Centered header block for the top of a receipt. Optional eyebrow + title +
 * subtitle. Replaces the old pattern of stacking multiple `<ReceiptLine>`s
 * with no value.
 *
 * @example
 *   <ReceiptHeader
 *     title="Refresh Cafe"
 *     subtitle="123 Main St · Dushanbe"
 *     meta="Apr 30, 2026 · #A8472"
 *   />
 */
export function ReceiptHeader({ title, subtitle, meta }: ReceiptHeaderProps) {
  return (
    <header className="mb-3 flex flex-col items-center text-center">
      {meta && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111315]/50">
          {meta}
        </p>
      )}
      <h2 className={`text-lg font-bold tracking-tight ${meta ? 'mt-1.5' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-xs text-[#111315]/60">{subtitle}</p>
      )}
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptLineProps = {
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Emphasizes a totals row — adds a top border, larger text, all-caps label. */
  bold?: boolean;
};

/**
 * Single label / value row. Without `value` it's a centered text line — good
 * for "Thank you" footers. With `value`, label sits left and value sits right
 * with `tabular-nums` so prices align across rows.
 *
 * Use `bold` on the final `TOTAL` row for the canonical receipt totals look.
 */
export function ReceiptLine({ label, value, bold = false }: ReceiptLineProps) {
  if (value == null) {
    return (
      <p
        className={`text-center ${
          bold ? 'text-sm font-bold' : 'text-xs text-[#111315]/70'
        }`}
      >
        {label}
      </p>
    );
  }

  if (bold) {
    return (
      <div className="mt-2 flex items-baseline justify-between gap-3 border-t-2 border-[#111315] pt-3 text-base font-bold uppercase tracking-wide">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
      <span className="text-[#111315]/75">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export function ReceiptDivider() {
  return <hr aria-hidden className="my-3 border-t border-[#111315]/15" />;
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptItemProps = {
  /** Optional 1-based row number rendered as a small grey prefix. */
  index?: number;
  name: string;
  qty: number | string;
  unitPrice: string;
  total: string;
};

/**
 * One line item on a receipt. Two-column layout: name + "qty × unitPrice"
 * stacked on the left, line total on the right with `tabular-nums`.
 *
 * @example
 *   <ReceiptItem index={1} name="Espresso" qty={2} unitPrice="$4.00" total="$8.00" />
 */
export function ReceiptItem({ index, name, qty, unitPrice, total }: ReceiptItemProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">
          {index != null && (
            <span className="mr-1.5 text-[#111315]/45 tabular-nums">
              {index}.
            </span>
          )}
          {name}
        </p>
        <p className="mt-0.5 text-[11px] text-[#111315]/60 tabular-nums">
          {qty} × {unitPrice}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums">{total}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptTipProps = {
  /** Subtotal the tip is calculated against — used to derive the % shown next to the label. */
  subtotal: number;
  /** Tip amount applied to this receipt. */
  tip: number;
  /** ISO 4217 currency. Default 'USD'. */
  currency?: string;
  /** Locale for formatting. Default 'en-US'. */
  locale?: string;
  /** Override the auto-derived percentage label. */
  percentLabel?: React.ReactNode;
};

/**
 * Tip row. Renders like a `ReceiptLine` but auto-computes the percent of
 * subtotal so receipts always show "Tip (18%) … $7.65".
 */
export function ReceiptTip({
  subtotal,
  tip,
  currency = 'USD',
  locale = 'en-US',
  percentLabel,
}: ReceiptTipProps) {
  const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const pct = subtotal > 0 ? Math.round((tip / subtotal) * 100) : 0;
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
      <span className="text-[#111315]/75">
        Tip{' '}
        <span className="text-[10px] tabular-nums text-[#111315]/50">
          {percentLabel ?? `(${pct}%)`}
        </span>
      </span>
      <span className="font-semibold tabular-nums">{fmt.format(tip)}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptPaymentProps = {
  /**
   * Payment method. Strings 'cash' / 'card' / 'wallet' / 'loyalty' get an
   * automatic display label; anything else is shown verbatim.
   */
  method: string;
  /** Last 4 of a card — appended to the method label as "Card •••• 4242". */
  last4?: string;
  /** Amount tendered (e.g. cash given). */
  amount?: string;
  /** Change given back — rendered as a smaller line below. */
  change?: string;
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  wallet: 'Wallet',
  loyalty: 'Loyalty',
  applepay: 'Apple Pay',
  googlepay: 'Google Pay',
  alipay: 'Alipay',
  wechat: 'WeChat Pay',
};

/**
 * Payment method line — "Card •••• 4242 … $23.89", optionally followed by a
 * "Change" line when paying with cash.
 *
 * @example
 *   <ReceiptPayment method="card" last4="4242" amount="$23.89" />
 *   <ReceiptPayment method="cash" amount="$30.00" change="$6.11" />
 */
export function ReceiptPayment({
  method,
  last4,
  amount,
  change,
}: ReceiptPaymentProps) {
  const lookup = PAYMENT_LABELS[method.toLowerCase()];
  const base = lookup ?? method;
  const label = last4 ? `${base} •••• ${last4}` : base;

  return (
    <>
      <div className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
        <span className="text-[#111315]/75">{label}</span>
        {amount && (
          <span className="font-semibold tabular-nums">{amount}</span>
        )}
      </div>
      {change && (
        <div className="flex items-baseline justify-between gap-3 py-0.5 text-[11px] text-[#111315]/60">
          <span>Change</span>
          <span className="tabular-nums">{change}</span>
        </div>
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptQRProps = {
  /** Data to encode — usually a URL to a digital receipt or refund flow. */
  value: string;
  /** Pixel size of the QR (square). Default 100. */
  size?: number;
  /** Caption below the QR. */
  caption?: React.ReactNode;
};

/**
 * Small centered QR rendered via quickchart.io — no install, no bundle hit.
 * Use to link to the digital receipt, a loyalty signup, or the refund lookup
 * page.
 *
 * @example
 *   <ReceiptQR value="https://refresh.co/r/A8472" caption="Scan to view receipt" />
 */
export function ReceiptQR({ value, size = 100, caption }: ReceiptQRProps) {
  const url = `https://quickchart.io/qr?text=${encodeURIComponent(value)}&size=${size}&margin=1&dark=111315&light=ffffff`;
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <img
        src={url}
        alt="QR code"
        width={size}
        height={size}
        loading="lazy"
        className="block rounded-sm"
      />
      {caption && (
        <p className="text-[10px] text-[#111315]/60">{caption}</p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

export type ReceiptBarcodeProps = {
  /** Value to encode. */
  value: string;
  /**
   * Code symbology supported by quickchart.io's barcode API.
   * Common: 'code128' (default), 'code39', 'ean13', 'upca', 'itf'.
   */
  type?: 'code128' | 'code39' | 'ean13' | 'upca' | 'itf' | string;
  /** Bar height in pixels. Default 56. */
  height?: number;
  /** Total barcode width in pixels. Default 240. */
  width?: number;
  /** Render the encoded value as text below the bars. Default true. */
  showValue?: boolean;
};

/**
 * Code 128 (or other symbology) barcode rendered via quickchart.io. Use for
 * the receipt ID — staff can scan it at returns to look up the order.
 *
 * @example
 *   <ReceiptBarcode value="A8472-2026-04-30" />
 */
export function ReceiptBarcode({
  value,
  type = 'code128',
  height = 56,
  width = 240,
  showValue = true,
}: ReceiptBarcodeProps) {
  const url = `https://quickchart.io/barcode?type=${encodeURIComponent(type)}&text=${encodeURIComponent(value)}&height=${height}&width=${width}&includetext=false`;
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <img
        src={url}
        alt={`Barcode: ${value}`}
        height={height}
        loading="lazy"
        className="block"
        style={{ height, width: '100%', maxWidth: width }}
      />
      {showValue && (
        <p className="text-[10px] tabular-nums tracking-[0.18em] text-[#111315]/70">
          {value}
        </p>
      )}
    </div>
  );
}
