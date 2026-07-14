import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user?.id || session.sessionKind !== "erp") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });
  if (!user?.mustChangePassword) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <ChangePasswordForm />
    </main>
  );
}
