import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/permissions/authz";
import { PermissionGroupForm } from "@/components/permission-groups/PermissionGroupForm";
import { t } from "@/lib/i18n";

export default async function NovoGrupoPage() {
  const authz = await requireAdmin();
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("permissionGroups.new")}
      </h1>
      <PermissionGroupForm mode="create" />
    </div>
  );
}
