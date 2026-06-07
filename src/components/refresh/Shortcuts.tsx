import { Kbd } from './Kbd';

export type ShortcutGroupProps = {
  title: string;
  children: React.ReactNode;
};

export function ShortcutGroup({ title, children }: ShortcutGroupProps) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-refresh-blue">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

export type ShortcutRowProps = {
  label: string;
  keys: React.ReactNode | (string | React.ReactNode)[];
};

export function ShortcutRow({ label, keys }: ShortcutRowProps) {
  const list = Array.isArray(keys) ? keys : [keys];
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-sm text-refresh-text">{label}</span>
      <span className="flex items-center gap-1">
        {list.map((k, i) =>
          typeof k === 'string' || typeof k === 'number' ? (
            <Kbd key={i}>{k}</Kbd>
          ) : (
            <span key={i}>{k}</span>
          )
        )}
      </span>
    </li>
  );
}

export type ShortcutsPanelProps = {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ShortcutsPanel({
  title = 'Shortcuts',
  action,
  children,
  className = '',
}: ShortcutsPanelProps) {
  return (
    <div className={`rounded-2xl border border-refresh-line bg-refresh-surface-2 p-6 ${className}`}>
      <header className="mb-5 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-refresh-text">{title}</h3>
        {action}
      </header>
      <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">{children}</div>
    </div>
  );
}
