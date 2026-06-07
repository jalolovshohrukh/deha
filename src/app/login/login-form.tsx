"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";
import { t } from "@/lib/i18n";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "..." : t.signIn}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useFormState(loginAction, { error: "" } as { error: string });

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">{t.username}</label>
        <input name="username" className="input" autoComplete="username" autoFocus />
      </div>
      <div>
        <label className="label">{t.password}</label>
        <input name="password" type="password" className="input" autoComplete="current-password" />
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-refresh-pink/10 px-3 py-2 text-sm text-refresh-pink">{state.error}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
