import Link from "next/link";
import { redirect } from "next/navigation";
import { UserList } from "@/components/platform/UserList";
import { t } from "@/lib/i18n";
import {
  listClientUsers,
  listCompaniesForSelect,
  type StatusFilter,
} from "@/lib/platform/queries";

type Props = {
  searchParams: Promise<{ q?: string; companyId?: string; status?: string }>;
};

function statusFrom(value?: string): StatusFilter {
  return value === "active" || value === "inactive" ? value : "all";
}

export default async function UsuariosPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = statusFrom(params.status);
  const [usersResult, companiesResult] = await Promise.all([
    listClientUsers({ q: params.q, companyId: params.companyId, status }),
    listCompaniesForSelect(),
  ]);
  if (!usersResult.ok || !companiesResult.ok) {
    redirect("/backoffice/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{t("backoffice.users.title")}</h1>
        <Link href="/backoffice/usuarios/novo" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          {t("backoffice.users.new")}
        </Link>
      </div>
      <form className="flex flex-wrap items-end gap-3" action="/backoffice/usuarios">
        <div className="space-y-1.5">
          <label htmlFor="q" className="block text-sm font-medium text-slate-700">{t("backoffice.users.search")}</label>
          <input id="q" name="q" defaultValue={params.q} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="companyId" className="block text-sm font-medium text-slate-700">{t("backoffice.users.form.company")}</label>
          <select id="companyId" name="companyId" defaultValue={params.companyId ?? ""} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
            <option value="">{t("backoffice.users.filter.all")}</option>
            {companiesResult.companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">{t("backoffice.users.col.status")}</label>
          <select id="status" name="status" defaultValue={status} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
            <option value="all">{t("backoffice.users.filter.all")}</option>
            <option value="active">{t("backoffice.users.filter.active")}</option>
            <option value="inactive">{t("backoffice.users.filter.inactive")}</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("backoffice.users.search")}</button>
      </form>
      <UserList users={usersResult.users} />
    </div>
  );
}
