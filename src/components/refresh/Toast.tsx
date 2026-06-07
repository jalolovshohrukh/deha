'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastVariant = 'default' | 'success' | 'warn' | 'error' | 'info';
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

export type ToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** Auto-dismiss after N ms. Set to 0 to keep open until dismissed. Default 4000. */
  duration?: number;
  /** Optional action button rendered on the right of the toast. */
  action?: { label: string; onClick: () => void };
};

type ToastRecord = ToastOptions & {
  id: string;
  /** false → entry/exit transition target hidden. true → visible. */
  active: boolean;
};

type ToastContextValue = {
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
  position: ToastPosition;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-refresh-line',
  success: 'border-refresh-sage',
  warn: 'border-refresh-pink',
  error: 'border-refresh-pink',
  info: 'border-refresh-blue',
};

const variantAccent: Record<ToastVariant, string> = {
  default: 'bg-refresh-muted',
  success: 'bg-refresh-sage',
  warn: 'bg-refresh-pink',
  error: 'bg-refresh-pink',
  info: 'bg-refresh-blue',
};

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

const enterFromClasses: Record<ToastPosition, string> = {
  'top-right': 'translate-x-4 opacity-0',
  'top-center': '-translate-y-3 opacity-0',
  'bottom-right': 'translate-x-4 opacity-0',
  'bottom-center': 'translate-y-3 opacity-0',
};

let toastSeq = 0;

export function ToastProvider({
  children,
  position = 'top-right',
  max = 4,
}: {
  children: ReactNode;
  position?: ToastPosition;
  max?: number;
}) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((curr) => curr.map((t) => (t.id === id ? { ...t, active: false } : t)));
    // Remove after exit transition.
    setTimeout(() => {
      setToasts((curr) => curr.filter((t) => t.id !== id));
    }, 200);
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = `toast-${++toastSeq}`;
      const record: ToastRecord = { ...opts, id, active: false };
      setToasts((curr) => {
        const next = [...curr, record];
        // Drop oldest if exceeding max.
        if (next.length > max) next.shift();
        return next;
      });
      // Activate on next frame so the entry transition plays.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts((curr) => curr.map((t) => (t.id === id ? { ...t, active: true } : t)));
        });
      });

      const duration = opts.duration ?? 4000;
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss, max]
  );

  // Cleanup timers on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, position }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={`pointer-events-none fixed z-[60] flex w-full max-w-sm flex-col gap-2 ${positionClasses[position]}`}
      >
        {toasts.map((t) => {
          const variant = t.variant ?? 'default';
          return (
            <div
              key={t.id}
              role={variant === 'error' || variant === 'warn' ? 'alert' : 'status'}
              className={`pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border bg-refresh-surface-2 p-3 pl-4 refresh-shadow-soft transition-all duration-200 ease-out ${
                variantClasses[variant]
              } ${t.active ? 'translate-x-0 translate-y-0 opacity-100' : enterFromClasses[position]}`}
            >
              <span aria-hidden className={`absolute left-0 top-0 h-full w-1 ${variantAccent[variant]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-refresh-text">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-refresh-muted">{t.description}</p>
                )}
              </div>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-refresh-text transition hover:bg-refresh-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-1 text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
              >
                <span aria-hidden className="text-sm leading-none">✕</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
