import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions/authz";
import { listServicesForCompany } from "@/lib/services/queries";
import { ServiceList } from "@/components/services/ServiceList";
import { t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ServicosPage({ searchParams }: Props) {
  const session = await requireSession();
  if (!session.ok) {
    redirect("/login");
  }

  const params = await searchParams;
  const perms = session.user.isAdmin
    ? null
    : new Set(session.user.permissions);
  const can = (key: string) =>
    session.user.isAdmin || (perms?.has(key) ?? false);

  const canList = can("services:list");
  if (!canList) {
    redirect("/app");
  }

  const canCreate = can("services:create");
  const canUpdate = can("services:update");
  const canSetActive = can("services:setActive");
  const showingInactive = canSetActive && params.status === "inactive";
  const services = await listServicesForCompany(session.user.companyId, {
    active: !showingInactive,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("services.title")}
        </h1>
        {canCreate ? (
          <Link
            href="/app/servicos/novo"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("services.new")}
          </Link>
        ) : null}
      </div>

      {canSetActive ? (
        <div className="flex gap-3 text-sm">
          <Link
            href="/app/servicos"
            className={
              !showingInactive
                ? "font-semibold text-slate-900"
                : "text-slate-600 hover:underline"
            }
          >
            {t("services.filter.active")}
          </Link>
          <Link
            href="/app/servicos?status=inactive"
            className={
              showingInactive
                ? "font-semibold text-slate-900"
                : "text-slate-600 hover:underline"
            }
          >
            {t("services.filter.inactive")}
          </Link>
        </div>
      ) : null}

      <ServiceList
        services={services}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canSetActive={canSetActive}
        showingInactive={showingInactive}
      />
    </div>
  );
}
