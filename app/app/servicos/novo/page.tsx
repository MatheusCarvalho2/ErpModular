import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/authz";
import { ServiceForm } from "@/components/services/ServiceForm";
import { t } from "@/lib/i18n";

export default async function NovoServicoPage() {
  const authz = await requirePermission("services:create");
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app/servicos");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("services.new")}</h1>
      <ServiceForm mode="create" />
    </div>
  );
}
