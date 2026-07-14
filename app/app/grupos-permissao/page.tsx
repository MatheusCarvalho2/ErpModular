import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/permissions/authz";
import { ensureCompanyPermissionPresets } from "@/lib/permission-groups/presets";
import { listPermissionGroups } from "@/lib/permission-groups/queries";
import { PermissionGroupList } from "@/components/permission-groups/PermissionGroupList";
import { t } from "@/lib/i18n";

export default async function GruposPermissaoPage() {
  const authz = await requireAdmin();
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app");
  }

  await ensureCompanyPermissionPresets(authz.user.companyId);
  const groups = await listPermissionGroups(authz.user.companyId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("permissionGroups.title")}
        </h1>
        <Link
          href="/app/grupos-permissao/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("permissionGroups.new")}
        </Link>
      </div>
      <PermissionGroupList groups={groups} />
    </div>
  );
}
