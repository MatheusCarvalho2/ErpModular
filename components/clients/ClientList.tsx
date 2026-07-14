import Link from "next/link";
import type { ClientListItem } from "@/lib/clients/queries";
import { t } from "@/lib/i18n";
import { ClientStatusActions } from "@/components/clients/ClientStatusActions";

type Props = {
  clients: ClientListItem[];
  canCreate: boolean;
  canUpdate: boolean;
  canSetActive: boolean;
  showingInactive: boolean;
};

export function ClientList({
  clients,
  canCreate,
  canUpdate,
  canSetActive,
  showingInactive,
}: Props) {
  const showActions = true;

  if (clients.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">
          {showingInactive ? t("clients.emptyInactive") : t("clients.empty")}
        </p>
        {canCreate && !showingInactive ? (
          <Link
            href="/app/clientes/novo"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("clients.createCta")}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">{t("clients.col.name")}</th>
            <th className="px-4 py-3 font-medium">{t("clients.col.phone")}</th>
            {showActions ? (
              <th className="px-4 py-3 font-medium">{t("clients.col.actions")}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  href={`/app/clientes/${client.id}`}
                  className="underline-offset-2 hover:underline"
                >
                  {client.name}
                </Link>
                {client.personGroupId ? (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({t("clients.linkedPeople")})
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-slate-700">{client.phone}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/app/clientes/${client.id}`}
                    className="text-sm text-slate-700 underline-offset-2 hover:underline"
                  >
                    {t("clients.action.view")}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
