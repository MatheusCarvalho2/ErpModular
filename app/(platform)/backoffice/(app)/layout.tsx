import { redirect } from "next/navigation";
import { requirePlatformOperator } from "@/lib/platform/authz";
import { PlatformShell } from "@/components/platform/PlatformShell";

export default async function BackofficeAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    redirect("/backoffice/login");
  }

  return <PlatformShell userName={authz.user.name}>{children}</PlatformShell>;
}
