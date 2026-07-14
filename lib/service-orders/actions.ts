"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { requirePermission } from "@/lib/permissions/authz";
import { canCorrectServiceOrderLinks, canEditServiceOrder } from "@/lib/service-orders/gates";
import { getDefaultInitialStatus } from "@/lib/service-order-statuses/queries";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string; code?: string };
type CreateInput = { serviceId: string; clientId: string; clientProductId: string; priceCents: number; workDescription?: string | null; statusId?: string };
type UpdateInput = { id: string; priceCents?: number; workDescription?: string | null; statusId?: string };
type LinksInput = { id: string; serviceId: string; clientId: string; clientProductId: string };

function validPrice(value: number | undefined) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function cleanDescription(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text || null;
}

function refresh(id?: string) {
  revalidatePath("/app/ordens-servico");
  if (id) revalidatePath(`/app/ordens-servico/${id}`);
}

async function validLinks(companyId: string, input: Pick<LinksInput, "serviceId" | "clientId" | "clientProductId">) {
  const [service, client, clientProduct] = await Promise.all([
    prisma.service.findFirst({ where: { id: input.serviceId, companyId, active: true } }),
    prisma.client.findFirst({ where: { id: input.clientId, companyId, active: true } }),
    prisma.clientProduct.findFirst({ where: { id: input.clientProductId, companyId, clientId: input.clientId, active: true } }),
  ]);
  return Boolean(service && client && clientProduct);
}

export async function createServiceOrder(input: CreateInput): Promise<ActionResult> {
  const authz = await requirePermission("serviceOrders:create");
  if (!authz.ok) return { ok: false, error: t("orders.forbidden"), code: "FORBIDDEN" };
  if (!validPrice(input.priceCents) || !await validLinks(authz.user.companyId, input)) return { ok: false, error: t("orders.error.invalid") };
  if ((input.workDescription?.trim().length ?? 0) > 4000) return { ok: false, error: t("orders.error.invalid") };
  const status = input.statusId
    ? await prisma.serviceOrderStatus.findFirst({ where: { id: input.statusId, companyId: authz.user.companyId, active: true } })
    : await getDefaultInitialStatus(authz.user.companyId);
  if (!status || (!input.statusId && status.role !== "OPERATIONAL")) return { ok: false, error: t("orders.error.statusUnavailable") };
  const created = await prisma.serviceOrder.create({ data: { companyId: authz.user.companyId, serviceId: input.serviceId, clientId: input.clientId, clientProductId: input.clientProductId, statusId: status.id, priceCents: input.priceCents, workDescription: cleanDescription(input.workDescription) } });
  refresh(created.id);
  return { ok: true, id: created.id };
}

export async function updateServiceOrder(input: UpdateInput): Promise<ActionResult> {
  const authz = await requirePermission("serviceOrders:update");
  if (!authz.ok) return { ok: false, error: t("orders.forbidden"), code: "FORBIDDEN" };
  const existing = await prisma.serviceOrder.findFirst({ where: { id: input.id, companyId: authz.user.companyId }, include: { status: true } });
  if (!existing) return { ok: false, error: t("orders.notFound") };
  const editClosed = authz.user.permissions.includes("serviceOrders:editClosed");
  if (!canEditServiceOrder(existing.status.role, authz.user.isAdmin, editClosed)) return { ok: false, error: t("orders.error.closed"), code: "FORBIDDEN" };
  if (input.priceCents !== undefined && !validPrice(input.priceCents)) return { ok: false, error: t("orders.error.invalid") };
  if ((input.workDescription?.trim().length ?? 0) > 4000) return { ok: false, error: t("orders.error.invalid") };
  if (input.statusId) {
    const status = await prisma.serviceOrderStatus.findFirst({ where: { id: input.statusId, companyId: authz.user.companyId, active: true } });
    if (!status) return { ok: false, error: t("orders.error.statusUnavailable") };
  }
  await prisma.serviceOrder.update({ where: { id: input.id }, data: { ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}), ...(input.workDescription !== undefined ? { workDescription: cleanDescription(input.workDescription) } : {}), ...(input.statusId ? { statusId: input.statusId } : {}) } });
  refresh(input.id);
  return { ok: true, id: input.id };
}

export async function correctServiceOrderLinks(input: LinksInput): Promise<ActionResult> {
  const authz = await requirePermission("serviceOrders:update");
  if (!authz.ok) return { ok: false, error: t("orders.forbidden"), code: "FORBIDDEN" };
  const existing = await prisma.serviceOrder.findFirst({ where: { id: input.id, companyId: authz.user.companyId }, include: { status: true } });
  if (!existing) return { ok: false, error: t("orders.notFound") };
  const correctLinks = authz.user.permissions.includes("serviceOrders:correctLinks");
  const editClosed = authz.user.permissions.includes("serviceOrders:editClosed");
  if (!canCorrectServiceOrderLinks(existing.status.role, authz.user.isAdmin, correctLinks, editClosed)) return { ok: false, error: t("orders.error.linksForbidden"), code: "FORBIDDEN" };
  if (!await validLinks(authz.user.companyId, input)) return { ok: false, error: t("orders.error.invalid") };
  await prisma.serviceOrder.update({ where: { id: input.id }, data: { serviceId: input.serviceId, clientId: input.clientId, clientProductId: input.clientProductId } });
  refresh(input.id);
  return { ok: true, id: input.id };
}
