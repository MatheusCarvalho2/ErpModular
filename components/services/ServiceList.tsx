import Link from "next/link";
import type { ServiceListItem } from "@/lib/services/queries";
import {
  formatDurationMinutes,
  formatPriceCents,
} from "@/lib/services/format";
import { t } from "@/lib/i18n";
import { ServiceStatusActions } from "@/components/services/ServiceStatusActions";

type Props = {
  services: ServiceListItem[];
  canCreate: boolean;
  canUpdate: boolean;
  canSetActive: boolean;
  showingInactive: boolean;
};

export function ServiceList({
  services,
  canCreate,
  canUpdate,
  canSetActive,
  showingInactive,
}: Props) {
  const showActions = canUpdate || canSetActive;

  if (services.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">
          {showingInactive
            ? t("services.emptyInactive")
            : t("services.empty")}
        </p>
        {canCreate && !showingInactive ? (
          <Link
            href="/app/servicos/novo"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("services.createCta")}
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
            <th className="px-4 py-3 font-medium">{t("services.col.name")}</th>
            <th className="px-4 py-3 font-medium">{t("services.col.price")}</th>
            <th className="px-4 py-3 font-medium">{t("services.col.duration")}</th>
            {showActions ? (
              <th className="px-4 py-3 font-medium">{t("services.col.actions")}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">
                {service.name}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatPriceCents(service.priceCents)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatDurationMinutes(service.durationMinutes)}
              </td>
              {showActions ? (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    {canUpdate ? (
                      <Link
                        href={`/app/servicos/${service.id}/editar`}
                        className="text-sm text-slate-700 underline-offset-2 hover:underline"
                      >
                        {t("services.action.edit")}
                      </Link>
                    ) : null}
                    {canSetActive ? (
                      <ServiceStatusActions
                        serviceId={service.id}
                        active={service.active}
                      />
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
