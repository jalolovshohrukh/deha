import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Nav from "./nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Nav name={user.name} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 md:pb-10">{children}</main>
    </div>
  );
}
