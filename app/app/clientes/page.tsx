import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions/authz";
import {
  findClientByIdentifier,
  listClientsForCompany,
} from "@/lib/clients/queries";
import { ClientList } from "@/components/clients/ClientList";
import { t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ status?: string; identifier?: string }>;
};

export default async function ClientesPage({ searchParams }: Props) {
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

  if (!can("clients:list")) {
    redirect("/app");
  }

  const canCreate = can("clients:create");
  const canUpdate = can("clients:update");
  const canSetActive = can("clients:setActive");
  const showingInactive = canSetActive && params.status === "inactive";
  const clients = await listClientsForCompany(session.user.companyId, {
    active: !showingInactive,
  });

  const identifierQuery = params.identifier?.trim() ?? "";
  const identifierMatch = identifierQuery
    ? await findClientByIdentifier(session.user.companyId, identifierQuery)
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("clients.title")}
        </h1>
        {canCreate ? (
          <Link
            href="/app/clientes/novo"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("clients.new")}
          </Link>
        ) : null}
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <div className="space-y-1.5">
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-slate-700"
          >
            {t("clients.search.identifier")}
          </label>
          <input
            id="identifier"
            name="identifier"
            defaultValue={identifierQuery}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
        >
          {t("clients.search.submit")}
        </button>
      </form>

      {identifierQuery ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          {identifierMatch ? (
            <p>
              {t("clients.search.result", {
                client: identifierMatch.client.name,
                product: identifierMatch.product.name,
                identifier: identifierMatch.identifier,
              })}{" "}
              <Link
                href={`/app/clientes/${identifierMatch.clientId}`}
                className="font-medium underline"
              >
                {t("clients.action.view")}
              </Link>
            </p>
          ) : (
            <p className="text-slate-600">{t("clients.search.notFound")}</p>
          )}
        </div>
      ) : null}

      {canSetActive ? (
        <div className="flex gap-3 text-sm">
          <Link
            href="/app/clientes"
            className={
              !showingInactive
                ? "font-semibold text-slate-900"
                : "text-slate-600 hover:underline"
            }
          >
            {t("clients.filter.active")}
          </Link>
          <Link
            href="/app/clientes?status=inactive"
            className={
              showingInactive
                ? "font-semibold text-slate-900"
                : "text-slate-600 hover:underline"
            }
          >
            {t("clients.filter.inactive")}
          </Link>
        </div>
      ) : null}

      <ClientList
        clients={clients}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canSetActive={canSetActive}
        showingInactive={showingInactive}
      />
    </div>
  );
}
