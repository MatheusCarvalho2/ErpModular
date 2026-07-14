import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginSplitLayout } from "@/components/auth/LoginSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.sessionKind === "erp") {
    redirect("/app");
  }
  if (session?.sessionKind === "platform") {
    redirect("/backoffice");
  }

  return (
    <LoginSplitLayout>
      <Suspense fallback={<p className="text-sm text-slate-500">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </LoginSplitLayout>
  );
}
