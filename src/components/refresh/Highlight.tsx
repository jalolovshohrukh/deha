export type HighlightProps = {
  text: string;
  query: string;
  className?: string;
};

export function Highlight({ text, query, className = '' }: HighlightProps) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <span
        key={`${idx}-${i}`}
        className={`rounded-md bg-refresh-blue px-1 py-0.5 font-semibold text-refresh-on-pastel ${className}`}
      >
        {text.slice(idx, idx + q.length)}
      </span>
    );
    i = idx + q.length;
  }
  return <>{parts}</>;
}
