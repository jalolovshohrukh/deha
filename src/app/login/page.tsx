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
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500">
            <Route className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">{t.appName}</h1>
          <p className="text-sm text-gray-500">{t.appTagline}</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-4 text-center text-xs text-gray-400">
            admin / admin123 · viewer / viewer123
          </p>
        )}
      </div>
    </main>
  );
}
