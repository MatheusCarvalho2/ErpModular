import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/authz";
import { ClientForm } from "@/components/clients/ClientForm";
import { t } from "@/lib/i18n";

export default async function NovoClientePage() {
  const authz = await requirePermission("clients:create");
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app/clientes");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("clients.new")}</h1>
      <ClientForm mode="create" />
    </div>
  );
}
