export type FontSpecimenProps = {
  family?: string;
  weights?: { name: string; weight: number }[];
  className?: string;
};

const defaultWeights = [
  { name: 'Regular', weight: 400 },
  { name: 'Medium', weight: 500 },
  { name: 'Semibold', weight: 600 },
  { name: 'Bold', weight: 700 },
  { name: 'Extrabold', weight: 800 },
];

export function FontSpecimen({
  family = 'Inter',
  weights = defaultWeights,
  className = '',
}: FontSpecimenProps) {
  return (
    <div className={`grid gap-8 md:grid-cols-[1.4fr_1fr] ${className}`}>
      <div>
        <p className="text-sm font-medium text-refresh-muted-2">Font</p>
        <h3 className="mt-2 text-7xl font-bold leading-none tracking-tight text-refresh-text">
          {family}
        </h3>
        <p className="mt-6 text-lg leading-relaxed text-refresh-muted">
          Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp
          <br />
          Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
        </p>
        <p className="mt-3 text-lg text-refresh-muted-2 tabular-nums">0 1 2 3 4 5 6 7 8 9</p>
      </div>

      <div className="flex items-center justify-center rounded-xl bg-refresh-surface-2 px-6 py-8 border border-refresh-line">
        <span
          aria-hidden
          className="text-[140px] leading-none font-bold tracking-tight text-refresh-text"
          style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
        >
          Aa
        </span>
      </div>

      <div className="md:col-span-2">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
          Weights
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {weights.map((w) => (
            <div key={w.weight} className="rounded-lg bg-refresh-surface px-4 py-3">
              <p
                className="text-2xl text-refresh-text"
                style={{ fontWeight: w.weight }}
              >
                Place Order
              </p>
              <p className="mt-1 font-mono text-[11px] text-refresh-muted-2">
                {w.name} · {w.weight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
