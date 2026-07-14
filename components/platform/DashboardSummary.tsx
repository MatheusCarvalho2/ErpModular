import { t } from "@/lib/i18n";

type DashboardSummaryProps = {
  summary: {
    companies: { total: number; active: number; inactive: number };
    clientUsers: { total: number; active: number; inactive: number };
    usersPerCompany: {
      companyId: string;
      companyName: string;
      active: boolean;
      userCount: number;
    }[];
  };
};

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  const metrics = [
    [t("backoffice.dashboard.companiesTotal"), summary.companies.total],
    [t("backoffice.dashboard.companiesActive"), summary.companies.active],
    [t("backoffice.dashboard.companiesInactive"), summary.companies.inactive],
    [t("backoffice.dashboard.usersTotal"), summary.clientUsers.total],
    [t("backoffice.dashboard.usersActive"), summary.clientUsers.active],
    [t("backoffice.dashboard.usersInactive"), summary.clientUsers.inactive],
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("backoffice.dashboard.perCompany")}
        </h2>
        {summary.usersPerCompany.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            {t("backoffice.dashboard.empty")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("backoffice.dashboard.col.company")}</th>
                  <th className="px-4 py-3 font-medium">{t("backoffice.dashboard.col.status")}</th>
                  <th className="px-4 py-3 font-medium">{t("backoffice.dashboard.col.users")}</th>
                </tr>
              </thead>
              <tbody>
                {summary.usersPerCompany.map((company) => (
                  <tr key={company.companyId} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{company.companyName}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${company.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                        {company.active ? t("backoffice.status.active") : t("backoffice.status.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{company.userCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
