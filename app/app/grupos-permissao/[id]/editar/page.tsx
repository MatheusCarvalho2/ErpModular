import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/permissions/authz";
import {
  getPermissionGroupForCompany,
  listCompanyMemberships,
  listPermissionGroups,
} from "@/lib/permission-groups/queries";
import { PermissionGroupForm } from "@/components/permission-groups/PermissionGroupForm";
import {
  AssignUserPanel,
  type MembershipRow,
} from "@/components/permission-groups/AssignUserPanel";
import {
  SYSTEM_KEY_ADMIN,
  SYSTEM_KEY_OPERADORES,
} from "@/lib/permissions/catalog";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarGrupoPage({ params }: Props) {
  const authz = await requireAdmin();
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app");
  }

  const { id } = await params;
  const group = await getPermissionGroupForCompany(authz.user.companyId, id);
  if (!group) {
    notFound();
  }

  const isAdminGroup = group.systemKey === SYSTEM_KEY_ADMIN;
  const isOperadores = group.systemKey === SYSTEM_KEY_OPERADORES;
  const grantKeys = group.grants.map((g) => g.permissionKey);

  const [memberships, allGroups] = await Promise.all([
    listCompanyMemberships(authz.user.companyId),
    listPermissionGroups(authz.user.companyId),
  ]);

  const membershipRows: MembershipRow[] = memberships.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    permissionGroupId: m.permissionGroupId,
    groupName: m.permissionGroup.name,
    groupSystemKey: m.permissionGroup.systemKey,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("permissionGroups.edit")}: {group.name}
      </h1>

      {isAdminGroup ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {t("permissionGroups.adminReadonly")}
        </p>
      ) : null}

      {isOperadores ? (
        <p className="text-sm text-slate-600">
          {t("permissionGroups.operadoresHint")}
        </p>
      ) : null}

      {!isAdminGroup ? (
        <PermissionGroupForm
          mode="edit"
          groupId={group.id}
          initialName={group.name}
          initialKeys={grantKeys}
          nameEditable={!isOperadores}
          matrixEditable
        />
      ) : null}

      <AssignUserPanel
        memberships={membershipRows}
        groups={allGroups.map((g) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
