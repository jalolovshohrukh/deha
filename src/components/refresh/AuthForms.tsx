'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Button } from './Button';
import { Input, Checkbox } from './Form';
import { FormField } from './FormField';
import { Banner } from './Banner';
import { Divider } from './Divider';
import { LogoMark } from './Logo';

/* ──────────────────────────────────────────────────────────────────────────
 * Shared shell — page-level card used by all three auth screens. Centered,
 * fixed-width, with a brand block at the top and an action row at the bottom.
 * ────────────────────────────────────────────────────────────────────────── */

type AuthShellProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Footer link below the form (e.g. "Already have an account? Sign in"). */
  footer?: ReactNode;
  children: ReactNode;
  /** Centers the shell on a page. When false, the card renders as-is for embedding. */
  fullPage?: boolean;
  className?: string;
};

function AuthShell({
  title,
  description,
  footer,
  children,
  fullPage = true,
  className = '',
}: AuthShellProps) {
  const card = (
    <div
      className={`w-full max-w-md rounded-2xl border border-refresh-line bg-refresh-surface-2 p-8 refresh-shadow-soft ${className}`}
    >
      <div className="mb-6 flex flex-col items-center gap-3">
        <LogoMark size="lg" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-refresh-text">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-refresh-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}

      {footer && (
        <p className="mt-6 text-center text-sm text-refresh-muted">{footer}</p>
      )}
    </div>
  );

  if (!fullPage) return card;

  return (
    <div className="flex min-h-[480px] w-full items-center justify-center bg-refresh-bg p-6">
      {card}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * LoginForm
 * ────────────────────────────────────────────────────────────────────────── */

export type LoginFormProps = {
  /** Called with the form data on submit. May return a Promise — while pending the submit button shows a loading state. */
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void | Promise<void>;
  /** Optional set of provider buttons rendered above the email/password form (e.g. Google, Apple). */
  providers?: { id: string; label: string; icon?: ReactNode; onClick: () => void }[];
  /** Pass an error string to render a Banner above the form (e.g. "Invalid credentials"). */
  error?: string | null;
  /** href for the Sign Up link. Default '/signup'. */
  signupHref?: string;
  /** href for the Forgot Password link. Default '/forgot-password'. */
  forgotHref?: string;
  /** Embed mode: when false, no full-page wrapper. */
  fullPage?: boolean;
  className?: string;
};

export function LoginForm({
  onSubmit,
  providers,
  error,
  signupHref = '/signup',
  forgotHref = '/forgot-password',
  fullPage = true,
  className = '',
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      setPending(true);
      await onSubmit({ email, password, remember });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to Refresh."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            href={signupHref}
            className="font-semibold text-refresh-text hover:underline"
          >
            Sign up
          </Link>
        </>
      }
      fullPage={fullPage}
      className={className}
    >
      {error && (
        <div className="mb-4">
          <Banner tone="error" title="Sign-in failed" description={error} />
        </div>
      )}

      {providers && providers.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            {providers.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="secondary"
                onClick={p.onClick}
                iconLeft={p.icon}
                fullWidth
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
          <div className="my-5">
            <Divider label="or" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Email" required>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@cafe.io"
            autoComplete="email"
            required
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-refresh-muted">
              Password <span aria-hidden className="text-refresh-pink">*</span>
            </span>
            <Link
              href={forgotHref}
              className="text-[11px] font-semibold text-refresh-text hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <Checkbox
          name="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          label="Keep me signed in"
        />

        <Button type="submit" disabled={pending} fullWidth>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * SignupForm
 * ────────────────────────────────────────────────────────────────────────── */

export type SignupFormProps = {
  onSubmit?: (data: {
    name: string;
    email: string;
    password: string;
    accept: boolean;
  }) => void | Promise<void>;
  error?: string | null;
  /** href for the "Already have an account? Sign in" link. Default '/login'. */
  loginHref?: string;
  /** Where the Terms link points. */
  termsHref?: string;
  privacyHref?: string;
  fullPage?: boolean;
  className?: string;
};

export function SignupForm({
  onSubmit,
  error,
  loginHref = '/login',
  termsHref = '#',
  privacyHref = '#',
  fullPage = true,
  className = '',
}: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accept, setAccept] = useState(false);
  const [pending, setPending] = useState(false);

  const passwordsMismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = email && password && confirm === password && accept;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || !canSubmit) return;
    try {
      setPending(true);
      await onSubmit({ name, email, password, accept });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Free to start — no credit card needed."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href={loginHref}
            className="font-semibold text-refresh-text hover:underline"
          >
            Sign in
          </Link>
        </>
      }
      fullPage={fullPage}
      className={className}
    >
      {error && (
        <div className="mb-4">
          <Banner tone="error" title="Couldn't create account" description={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Name">
          <Input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leslie K."
            autoComplete="name"
          />
        </FormField>

        <FormField label="Email" required>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@cafe.io"
            autoComplete="email"
            required
          />
        </FormField>

        <FormField
          label="Password"
          required
          hint="At least 8 characters."
        >
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </FormField>

        <FormField
          label="Confirm password"
          required
          error={passwordsMismatch ? "Passwords don't match." : undefined}
        >
          <Input
            type="password"
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            invalid={passwordsMismatch}
            required
          />
        </FormField>

        <Checkbox
          name="accept"
          checked={accept}
          onChange={(e) => setAccept(e.target.checked)}
          label={
            <>
              I agree to the{' '}
              <Link href={termsHref} className="text-refresh-text underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href={privacyHref} className="text-refresh-text underline">
                Privacy Policy
              </Link>
              .
            </>
          }
        />

        <Button type="submit" disabled={!canSubmit || pending} fullWidth>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * ForgotPasswordForm
 * ────────────────────────────────────────────────────────────────────────── */

export type ForgotPasswordFormProps = {
  onSubmit?: (data: { email: string }) => void | Promise<void>;
  /** When true, the form shows the "check your inbox" success state instead of the input. */
  sent?: boolean;
  error?: string | null;
  loginHref?: string;
  fullPage?: boolean;
  className?: string;
};

export function ForgotPasswordForm({
  onSubmit,
  sent = false,
  error,
  loginHref = '/login',
  fullPage = true,
  className = '',
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [internalSent, setInternalSent] = useState(false);

  const showSuccess = sent || internalSent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) {
      setInternalSent(true);
      return;
    }
    try {
      setPending(true);
      await onSubmit({ email });
      setInternalSent(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title={showSuccess ? 'Check your inbox' : 'Reset your password'}
      description={
        showSuccess
          ? `If an account exists for ${email || 'that email'}, you'll receive a reset link in the next minute.`
          : 'Enter the email tied to your account and we’ll send a reset link.'
      }
      footer={
        <>
          Remembered it?{' '}
          <Link
            href={loginHref}
            className="font-semibold text-refresh-text hover:underline"
          >
            Back to sign in
          </Link>
        </>
      }
      fullPage={fullPage}
      className={className}
    >
      {error && !showSuccess && (
        <div className="mb-4">
          <Banner tone="error" title="Couldn't send reset email" description={error} />
        </div>
      )}

      {showSuccess ? (
        <Banner
          tone="success"
          title="Reset link sent"
          description="Didn't get it? Check your spam folder, or try again with a different email."
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Email" required>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@cafe.io"
              autoComplete="email"
              required
            />
          </FormField>

          <Button type="submit" disabled={pending || email.length === 0} fullWidth>
            {pending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
