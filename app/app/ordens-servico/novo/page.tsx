import { redirect } from "next/navigation";
import { ServiceOrderForm } from "@/components/service-orders/ServiceOrderForm";
import { t } from "@/lib/i18n";
import { requirePermission } from "@/lib/permissions/authz";
import { listActiveOrderClients, listActiveOrderServices } from "@/lib/service-orders/queries";
import { listStatusesForCompany } from "@/lib/service-order-statuses/queries";
import { prisma } from "@/lib/prisma";

export default async function NewServiceOrderPage() {
  const authz = await requirePermission("serviceOrders:create");
  if (!authz.ok) redirect(authz.error === "unauthenticated" ? "/login" : "/app/ordens-servico");
  const [services, clients, statuses, clientProducts] = await Promise.all([
    listActiveOrderServices(authz.user.companyId),
    listActiveOrderClients(authz.user.companyId),
    listStatusesForCompany(authz.user.companyId, { active: true }),
    prisma.clientProduct.findMany({ where: { companyId: authz.user.companyId, active: true }, include: { product: true }, orderBy: { identifier: "asc" } }),
  ]);
  return <div className="space-y-6"><h1 className="text-2xl font-semibold">{t("orders.new")}</h1><ServiceOrderForm services={services} clients={clients} clientProducts={clientProducts} statuses={statuses} /></div>;
}
