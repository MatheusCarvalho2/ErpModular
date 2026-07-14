import { notFound, redirect } from "next/navigation";
import { ServiceOrderDetail } from "@/components/service-orders/ServiceOrderDetail";
import { t } from "@/lib/i18n";
import { requireSession } from "@/lib/permissions/authz";
import {
  canCorrectServiceOrderLinks,
  canEditServiceOrder,
} from "@/lib/service-orders/gates";
import {
  getServiceOrderForCompany,
  listActiveOrderClients,
  listActiveOrderServices,
  listAllActiveClientProducts,
} from "@/lib/service-orders/queries";
import { listStatusesForCompany } from "@/lib/service-order-statuses/queries";

export default async function ServiceOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!session.ok) redirect("/login");
  const can = (key: string) =>
    session.user.isAdmin || session.user.permissions.includes(key);
  if (!can("serviceOrders:list")) redirect("/app");
  const { id } = await params;
  const order = await getServiceOrderForCompany(id, session.user.companyId);
  if (!order) notFound();
  const [statuses, services, clients, clientProducts] = await Promise.all([
    listStatusesForCompany(session.user.companyId, { active: true }),
    listActiveOrderServices(session.user.companyId),
    listActiveOrderClients(session.user.companyId),
    listAllActiveClientProducts(session.user.companyId),
  ]);
  const canEdit =
    can("serviceOrders:update") &&
    canEditServiceOrder(
      order.status.role,
      session.user.isAdmin,
      can("serviceOrders:editClosed"),
    );
  const canCorrectLinks = canCorrectServiceOrderLinks(
    order.status.role,
    session.user.isAdmin,
    can("serviceOrders:correctLinks"),
    can("serviceOrders:editClosed"),
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("orders.detail")}</h1>
      <ServiceOrderDetail
        order={order}
        statuses={statuses}
        services={services}
        clients={clients}
        clientProducts={clientProducts}
        canEdit={canEdit}
        canCorrectLinks={canCorrectLinks}
      />
    </div>
  );
}
