"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { PermissionGroupListItem } from "@/lib/permission-groups/queries";
import { deletePermissionGroup } from "@/lib/permission-groups/actions";
import {
  SYSTEM_KEY_ADMIN,
  SYSTEM_KEY_OPERADORES,
} from "@/lib/permissions/catalog";
import { t } from "@/lib/i18n";

type Props = {
  groups: PermissionGroupListItem[];
};

export function PermissionGroupList({ groups }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete(id: string) {
    if (!window.confirm(t("permissionGroups.deleteConfirm"))) return;
    startTransition(async () => {
      await deletePermissionGroup(id);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">
              {t("permissionGroups.col.name")}
            </th>
            <th className="px-4 py-3 font-medium">
              {t("permissionGroups.col.type")}
            </th>
            <th className="px-4 py-3 font-medium">
              {t("permissionGroups.col.members")}
            </th>
            <th className="px-4 py-3 font-medium">
              {t("permissionGroups.col.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const isPreset =
              group.systemKey === SYSTEM_KEY_ADMIN ||
              group.systemKey === SYSTEM_KEY_OPERADORES;
            return (
              <tr key={group.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {group.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {isPreset
                    ? t("permissionGroups.badge.system")
                    : t("permissionGroups.badge.custom")}
                </td>
                <td className="px-4 py-3 text-slate-700">{group.memberCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/app/grupos-permissao/${group.id}/editar`}
                      className="text-sm text-slate-700 underline-offset-2 hover:underline"
                    >
                      {t("permissionGroups.action.edit")}
                    </Link>
                    {!isPreset ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onDelete(group.id)}
                        className="text-sm text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
                      >
                        {t("permissionGroups.action.delete")}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
