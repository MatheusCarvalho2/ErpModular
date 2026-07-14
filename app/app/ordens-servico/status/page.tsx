import { redirect } from "next/navigation";
import { StatusForm } from "@/components/service-order-statuses/StatusForm";
import { StatusList } from "@/components/service-order-statuses/StatusList";
import { t } from "@/lib/i18n";
import { requireSession } from "@/lib/permissions/authz";
import { listStatusesForCompany } from "@/lib/service-order-statuses/queries";

export default async function ServiceOrderStatusesPage() {
  const session = await requireSession();
  if (!session.ok) redirect("/login");
  const can = (key: string) =>
    session.user.isAdmin || session.user.permissions.includes(key);
  if (!can("serviceOrderStatuses:list")) redirect("/app");
  const statuses = await listStatusesForCompany(session.user.companyId);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">{t("orderStatuses.title")}</h1>
      {can("serviceOrderStatuses:create") ? <StatusForm /> : null}
      <StatusList
        statuses={statuses}
        canUpdate={can("serviceOrderStatuses:update")}
        canSetActive={can("serviceOrderStatuses:setActive")}
      />
    </div>
  );
}
