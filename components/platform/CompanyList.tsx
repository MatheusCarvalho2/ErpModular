"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setCompanyActive } from "@/lib/platform/actions";
import { t } from "@/lib/i18n";

type Company = {
  id: string;
  name: string;
  active: boolean;
  userCount: number;
};

export function CompanyList({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function setActive(id: string, active: boolean) {
    setError(null);
    setPendingId(id);
    const result = await setCompanyActive({ id, active });
    if (!result.ok) {
      setError(result.error);
    }
    setPendingId(null);
    router.refresh();
  }

  if (companies.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{t("backoffice.companies.empty")}</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">{t("backoffice.companies.col.name")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.companies.col.users")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.companies.col.status")}</th>
              <th className="px-4 py-3 font-medium">{t("backoffice.companies.col.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{company.name}</td>
                <td className="px-4 py-3 text-slate-700">{company.userCount}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${company.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {company.active ? t("backoffice.status.active") : t("backoffice.status.inactive")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/backoffice/empresas/${company.id}`} className="text-slate-700 underline-offset-2 hover:underline">
                      {t("backoffice.companies.action.edit")}
                    </Link>
                    <button
                      type="button"
                      disabled={pendingId === company.id}
                      onClick={() => setActive(company.id, !company.active)}
                      className="text-slate-700 underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      {company.active ? t("backoffice.companies.action.inactivate") : t("backoffice.companies.action.reactivate")}
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
