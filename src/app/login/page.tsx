import { redirect } from "next/navigation";
import { Route } from "lucide-react";
import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-refresh-sage">
            <Route className="h-7 w-7 text-refresh-on-pastel" />
          </div>
          <h1 className="text-xl font-bold text-refresh-text">{t.appName}</h1>
          <p className="text-sm text-refresh-muted">{t.appTagline}</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-4 text-center text-xs text-refresh-muted-2">
            admin / admin123 · viewer / viewer123
          </p>
        )}
      </div>
    </main>
  );
}
