import Link from "next/link";
import { redirect } from "next/navigation";
import { CompanyList } from "@/components/platform/CompanyList";
import { t } from "@/lib/i18n";
import { listCompanies, type StatusFilter } from "@/lib/platform/queries";

type Props = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

function statusFrom(value?: string): StatusFilter {
  return value === "active" || value === "inactive" ? value : "all";
}

export default async function EmpresasPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = statusFrom(params.status);
  const result = await listCompanies({ q: params.q, status });
  if (!result.ok) {
    redirect("/backoffice/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{t("backoffice.companies.title")}</h1>
        <Link href="/backoffice/empresas/nova" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          {t("backoffice.companies.new")}
        </Link>
      </div>
      <form className="flex flex-wrap items-end gap-3" action="/backoffice/empresas">
        <div className="space-y-1.5">
          <label htmlFor="q" className="block text-sm font-medium text-slate-700">{t("backoffice.companies.search")}</label>
          <input id="q" name="q" defaultValue={params.q} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">{t("backoffice.companies.col.status")}</label>
          <select id="status" name="status" defaultValue={status} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
            <option value="all">{t("backoffice.companies.filter.all")}</option>
            <option value="active">{t("backoffice.companies.filter.active")}</option>
            <option value="inactive">{t("backoffice.companies.filter.inactive")}</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("backoffice.companies.search")}</button>
      </form>
      <CompanyList companies={result.companies} />
    </div>
  );
}
