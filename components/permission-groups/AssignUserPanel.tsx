"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignUserToGroup } from "@/lib/permission-groups/actions";
import { t } from "@/lib/i18n";

export type MembershipRow = {
  userId: string;
  name: string;
  email: string;
  permissionGroupId: string;
  groupName: string;
  groupSystemKey: string | null;
};

type GroupOption = {
  id: string;
  name: string;
};

type Props = {
  memberships: MembershipRow[];
  groups: GroupOption[];
};

export function AssignUserPanel({ memberships, groups }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      memberships.map((m) => [m.userId, m.permissionGroupId]),
    ),
  );

  function save(userId: string) {
    setError(null);
    const permissionGroupId = draft[userId];
    if (!permissionGroupId) return;
    startTransition(async () => {
      const result = await assignUserToGroup({ userId, permissionGroupId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3" data-testid="assign-user-panel">
      <h2 className="text-lg font-semibold text-slate-900">
        {t("permissionGroups.assign.title")}
      </h2>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">
                {t("permissionGroups.assign.user")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("permissionGroups.assign.group")}
              </th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => (
              <tr key={m.userId} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{m.name}</div>
                  <div className="text-slate-500">{m.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Grupo de ${m.name}`}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    value={draft[m.userId] ?? m.permissionGroupId}
                    disabled={pending}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [m.userId]: e.target.value }))
                    }
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={
                      pending ||
                      draft[m.userId] === m.permissionGroupId
                    }
                    onClick={() => save(m.userId)}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                  >
                    {t("permissionGroups.assign.save")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
