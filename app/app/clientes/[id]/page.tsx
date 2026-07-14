import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions/authz";
import { getClientForCompany } from "@/lib/clients/queries";
import { listActiveProductsForSelect } from "@/lib/products/queries";
import { listClientProductsForClient } from "@/lib/client-products/queries";
import { ClientProductList } from "@/components/clients/ClientProductList";
import { ClientStatusActions } from "@/components/clients/ClientStatusActions";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ links?: string }>;
};

export default async function ClienteDetailPage({
  params,
  searchParams,
}: Props) {
  const session = await requireSession();
  if (!session.ok) {
    redirect("/login");
  }

  const perms = session.user.isAdmin
    ? null
    : new Set(session.user.permissions);
  const can = (key: string) =>
    session.user.isAdmin || (perms?.has(key) ?? false);

  if (!can("clients:list")) {
    redirect("/app");
  }

  const { id } = await params;
  const query = await searchParams;
  const client = await getClientForCompany(id, session.user.companyId);
  if (!client) {
    notFound();
  }

  const canUpdate = can("clients:update");
  const canSetActive = can("clients:setActive");
  const canListLinks = can("clientProducts:list");
  const canCreateLink = can("clientProducts:create");
  const canUpdateLink = can("clientProducts:update");
  const canSetActiveLink = can("clientProducts:setActive");
  const showingInactiveLinks =
    canSetActiveLink && query.links === "inactive";

  const products = canCreateLink
    ? await listActiveProductsForSelect(session.user.companyId)
    : [];
  const links = canListLinks
    ? await listClientProductsForClient(client.id, session.user.companyId, {
        active: !showingInactiveLinks,
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            {client.name}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/clientes"
              className="text-sm text-slate-600 hover:underline"
            >
              {t("clients.form.cancel")}
            </Link>
            {canUpdate ? (
              <Link
                href={`/app/clientes/${client.id}/editar`}
                className="text-sm text-slate-700 underline-offset-2 hover:underline"
              >
                {t("clients.action.edit")}
              </Link>
            ) : null}
            {canSetActive ? (
              <ClientStatusActions
                clientId={client.id}
                active={client.active}
              />
            ) : null}
          </div>
        </div>
        <p className="text-slate-700">
          {t("clients.col.phone")}: {client.phone}
          {!client.active ? " · inativo" : ""}
          {client.personGroupId ? ` · ${t("clients.linkedPeople")}` : ""}
        </p>
      </div>

      {canListLinks ? (
        <div className="space-y-3">
          {canSetActiveLink ? (
            <div className="flex gap-3 text-sm">
              <Link
                href={`/app/clientes/${client.id}`}
                className={
                  !showingInactiveLinks
                    ? "font-semibold text-slate-900"
                    : "text-slate-600 hover:underline"
                }
              >
                {t("clientProducts.filter.active")}
              </Link>
              <Link
                href={`/app/clientes/${client.id}?links=inactive`}
                className={
                  showingInactiveLinks
                    ? "font-semibold text-slate-900"
                    : "text-slate-600 hover:underline"
                }
              >
                {t("clientProducts.filter.inactive")}
              </Link>
            </div>
          ) : null}
          <ClientProductList
            clientId={client.id}
            items={links}
            products={products}
            canCreate={canCreateLink}
            canUpdate={canUpdateLink}
            canSetActive={canSetActiveLink}
            showingInactive={showingInactiveLinks}
          />
        </div>
      ) : null}
    </div>
  );
}
