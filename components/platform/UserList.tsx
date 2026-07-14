"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setUserActive } from "@/lib/platform/actions";
import { t } from "@/lib/i18n";

type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  companyName: string | null;
};

export function UserList({ users }: { users: User[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function setActive(id: string, active: boolean) {
    setError(null);
    setPendingId(id);
    const result = await setUserActive({ id, active });
    if (!result.ok) {
      setError(result.error);
    }
    setPendingId(null);
    router.refresh();
  }

  if (users.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{t("backoffice.users.empty")}</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">{t("backoffice.users.col.name")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.users.col.email")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.users.col.company")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.users.col.status")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.users.col.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-700">{user.email}</td>
                <td className="px-4 py-3 text-slate-700">{user.companyName}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {user.active ? t("backoffice.status.userActive") : t("backoffice.status.userInactive")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/backoffice/usuarios/${user.id}`} className="text-slate-700 underline-offset-2 hover:underline">
                      {t("backoffice.users.action.edit")}
                    </Link>
                    <button
                      type="button"
                      disabled={pendingId === user.id}
                      onClick={() => setActive(user.id, !user.active)}
                      className="text-slate-700 underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      {user.active ? t("backoffice.users.action.inactivate") : t("backoffice.users.action.reactivate")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
