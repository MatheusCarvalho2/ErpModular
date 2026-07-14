import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlatformLoginForm } from "@/components/platform/PlatformLoginForm";

export default async function BackofficeLoginPage() {
  const session = await auth();
  if (session?.sessionKind === "platform") {
    redirect("/backoffice");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <PlatformLoginForm />
    </main>
  );
}
