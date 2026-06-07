export type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  active?: boolean;
  className?: string;
};

export function StatCard({ label, value, icon, active = false, className = '' }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 ${
        active ? 'bg-refresh-text text-refresh-bg' : 'bg-refresh-surface text-refresh-text'
      } ${className}`}
    >
      {icon && (
        <span
          className={`mb-6 inline-flex h-9 w-9 items-center justify-center rounded-full ${
            active ? 'bg-refresh-bg/10 text-refresh-bg' : 'bg-refresh-bg text-refresh-text'
          }`}
        >
          {icon}
        </span>
      )}
      <p className={`text-xs ${active ? 'text-refresh-bg/60' : 'text-refresh-muted-2'}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
