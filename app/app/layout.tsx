import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/shell/Header";
import { Sidebar } from "@/components/shell/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header
        userName={session.user.name}
        userEmail={session.user.email}
        companyName={session.user.companyName}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
