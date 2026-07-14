"use server";

import type { ServiceOrderStatusRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { normalizeName } from "@/lib/service-name";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions/authz";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string; code?: string };
type StatusInput = {
  name?: string;
  sortOrder?: number;
  role?: ServiceOrderStatusRole;
  isDefaultInitial?: boolean;
};

function validate(input: StatusInput) {
  const name = input.name?.trim();
  if (input.name !== undefined && (!name || name.length > 80)) return null;
  if (input.sortOrder !== undefined && (!Number.isInteger(input.sortOrder) || input.sortOrder < 0)) return null;
  return name;
}

function refresh() {
  revalidatePath("/app/ordens-servico");
  revalidatePath("/app/ordens-servico/status");
}

export async function createServiceOrderStatus(
  input: Required<Pick<StatusInput, "name" | "sortOrder" | "role">> & Pick<StatusInput, "isDefaultInitial">,
): Promise<ActionResult> {
  const authz = await requirePermission("serviceOrderStatuses:create");
  if (!authz.ok) return { ok: false, error: t("orderStatuses.forbidden"), code: "FORBIDDEN" };
  const name = validate(input);
  if (!name || input.isDefaultInitial && input.role !== "OPERATIONAL") {
    return { ok: false, error: t("orderStatuses.error.invalid"), code: "INVALID_DEFAULT_ROLE" };
  }
  const normalized = normalizeName(name);
  const conflict = await prisma.serviceOrderStatus.findFirst({
    where: { companyId: authz.user.companyId, nameNormalized: normalized, active: true },
  });
  if (conflict) return { ok: false, error: t("orderStatuses.error.duplicateName"), code: "NAME_IN_USE" };

  const created = await prisma.$transaction(async (tx) => {
    if (input.isDefaultInitial) {
      await tx.serviceOrderStatus.updateMany({
        where: { companyId: authz.user.companyId },
        data: { isDefaultInitial: false },
      });
    }
    return tx.serviceOrderStatus.create({
      data: { companyId: authz.user.companyId, name, nameNormalized: normalized, sortOrder: input.sortOrder, role: input.role, isDefaultInitial: Boolean(input.isDefaultInitial), active: true },
    });
  });
  refresh();
  return { ok: true, id: created.id };
}

export async function updateServiceOrderStatus(id: string, input: StatusInput): Promise<ActionResult> {
  const authz = await requirePermission("serviceOrderStatuses:update");
  if (!authz.ok) return { ok: false, error: t("orderStatuses.forbidden"), code: "FORBIDDEN" };
  const existing = await prisma.serviceOrderStatus.findFirst({ where: { id, companyId: authz.user.companyId } });
  if (!existing) return { ok: false, error: t("orderStatuses.notFound") };
  const name = validate(input);
  if (input.name !== undefined && !name) return { ok: false, error: t("orderStatuses.error.invalid") };
  const role = input.role ?? existing.role;
  const defaultInitial = input.isDefaultInitial ?? existing.isDefaultInitial;
  if (defaultInitial && (role !== "OPERATIONAL" || !existing.active)) return { ok: false, error: t("orderStatuses.error.invalidDefault"), code: "INVALID_DEFAULT_ROLE" };
  if (existing.isDefaultInitial && !defaultInitial) {
    return { ok: false, error: t("orderStatuses.error.invalidDefault") };
  }
  if (name && existing.active) {
    const conflict = await prisma.serviceOrderStatus.findFirst({ where: { companyId: authz.user.companyId, active: true, nameNormalized: normalizeName(name), id: { not: id } } });
    if (conflict) return { ok: false, error: t("orderStatuses.error.duplicateName"), code: "NAME_IN_USE" };
  }
  await prisma.$transaction(async (tx) => {
    if (defaultInitial) await tx.serviceOrderStatus.updateMany({ where: { companyId: authz.user.companyId, id: { not: id } }, data: { isDefaultInitial: false } });
    await tx.serviceOrderStatus.update({ where: { id }, data: { ...(name ? { name, nameNormalized: normalizeName(name) } : {}), ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}), ...(input.role ? { role: input.role } : {}), ...(input.isDefaultInitial !== undefined ? { isDefaultInitial: input.isDefaultInitial } : {}) } });
  });
  refresh();
  return { ok: true, id };
}

export async function setServiceOrderStatusActive(id: string, active: boolean): Promise<ActionResult> {
  const authz = await requirePermission("serviceOrderStatuses:setActive");
  if (!authz.ok) return { ok: false, error: t("orderStatuses.forbidden"), code: "FORBIDDEN" };
  const current = await prisma.serviceOrderStatus.findFirst({ where: { id, companyId: authz.user.companyId } });
  if (!current) return { ok: false, error: t("orderStatuses.notFound") };
  if (!active && current.active) {
    const activeCount = await prisma.serviceOrderStatus.count({ where: { companyId: authz.user.companyId, active: true } });
    if (activeCount <= 1 || current.isDefaultInitial) return { ok: false, error: t("orderStatuses.error.cannotDeactivateDefault"), code: "CANNOT_DEACTIVATE_DEFAULT" };
  }
  if (active && !current.active) {
    const conflict = await prisma.serviceOrderStatus.findFirst({ where: { companyId: authz.user.companyId, active: true, nameNormalized: current.nameNormalized, id: { not: id } } });
    if (conflict) return { ok: false, error: t("orderStatuses.error.duplicateName"), code: "NAME_IN_USE" };
  }
  await prisma.serviceOrderStatus.update({ where: { id }, data: { active } });
  refresh();
  return { ok: true, id };
}
