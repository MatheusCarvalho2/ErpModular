import Link from "next/link";
import { redirect } from "next/navigation";
import { ServiceOrderList } from "@/components/service-orders/ServiceOrderList";
import { t } from "@/lib/i18n";
import { requireSession } from "@/lib/permissions/authz";
import { listServiceOrdersForCompany } from "@/lib/service-orders/queries";
import { listStatusesForCompany } from "@/lib/service-order-statuses/queries";

export default async function ServiceOrdersPage({ searchParams }: { searchParams: Promise<{ statusId?: string }> }) {
  const session = await requireSession();
  if (!session.ok) redirect("/login");
  const can = (key: string) => session.user.isAdmin || session.user.permissions.includes(key);
  if (!can("serviceOrders:list")) redirect("/app");
  const { statusId } = await searchParams;
  const [orders, statuses] = await Promise.all([listServiceOrdersForCompany(session.user.companyId, { statusId }), listStatusesForCompany(session.user.companyId, { active: true })]);
  return <div className="mx-auto max-w-5xl space-y-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">{t("orders.title")}</h1>{can("serviceOrders:create") ? <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white" href="/app/ordens-servico/novo">{t("orders.new")}</Link> : null}</div><ServiceOrderList orders={orders} statuses={statuses} selectedStatusId={statusId} canCreate={can("serviceOrders:create")} /></div>;
}
