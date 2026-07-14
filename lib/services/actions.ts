"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/service-name";
import { requirePermission } from "@/lib/permissions/authz";
import {
  parseDurationToMinutes,
  parsePriceBRLToCents,
} from "@/lib/services/format";
import { t } from "@/lib/i18n";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

type ServiceInput = {
  name: string;
  description: string;
  productDescription?: string;
  priceRaw?: string;
  hoursRaw?: string;
  minutesRaw?: string;
};

function parseFields(input: ServiceInput):
  | {
      ok: true;
      name: string;
      nameNormalized: string;
      description: string;
      productDescription: string | null;
      priceCents: number | null;
      durationMinutes: number | null;
    }
  | { ok: false; error: string } {
  const name = input.name?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const productRaw = input.productDescription?.trim() ?? "";

  if (!name || !description) {
    return { ok: false, error: t("services.error.required") };
  }
  if (name.length > 120 || description.length > 2000) {
    return { ok: false, error: t("services.error.generic") };
  }
  if (productRaw.length > 2000) {
    return { ok: false, error: t("services.error.generic") };
  }

  const priceCents = parsePriceBRLToCents(input.priceRaw ?? "");
  if (priceCents === "invalid") {
    return { ok: false, error: t("services.error.invalidPrice") };
  }

  const durationMinutes = parseDurationToMinutes(
    input.hoursRaw ?? "",
    input.minutesRaw ?? "",
  );
  if (durationMinutes === "invalid") {
    return { ok: false, error: t("services.error.invalidDuration") };
  }

  return {
    ok: true,
    name,
    nameNormalized: normalizeName(name),
    description,
    productDescription: productRaw || null,
    priceCents,
    durationMinutes,
  };
}

async function findActiveNameConflict(
  companyId: string,
  nameNormalized: string,
  excludeId?: string,
) {
  return prisma.service.findFirst({
    where: {
      companyId,
      nameNormalized,
      active: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createService(input: ServiceInput): Promise<ActionResult> {
  const authz = await requirePermission("services:create");
  if (!authz.ok) {
    return { ok: false, error: t("services.forbidden") };
  }

  const parsed = parseFields(input);
  if (!parsed.ok) {
    return parsed;
  }

  const conflict = await findActiveNameConflict(
    authz.user.companyId,
    parsed.nameNormalized,
  );
  if (conflict) {
    return { ok: false, error: t("services.error.duplicateName") };
  }

  const created = await prisma.service.create({
    data: {
      companyId: authz.user.companyId,
      name: parsed.name,
      nameNormalized: parsed.nameNormalized,
      description: parsed.description,
      productDescription: parsed.productDescription,
      priceCents: parsed.priceCents,
      durationMinutes: parsed.durationMinutes,
      active: true,
    },
  });

  revalidatePath("/app/servicos");
  return { ok: true, id: created.id };
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<ActionResult> {
  const authz = await requirePermission("services:update");
  if (!authz.ok) {
    return { ok: false, error: t("services.forbidden") };
  }

  const existing = await prisma.service.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("services.notFound") };
  }

  const parsed = parseFields(input);
  if (!parsed.ok) {
    return parsed;
  }

  if (existing.active) {
    const conflict = await findActiveNameConflict(
      authz.user.companyId,
      parsed.nameNormalized,
      id,
    );
    if (conflict) {
      return { ok: false, error: t("services.error.duplicateName") };
    }
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: parsed.name,
      nameNormalized: parsed.nameNormalized,
      description: parsed.description,
      productDescription: parsed.productDescription,
      priceCents: parsed.priceCents,
      durationMinutes: parsed.durationMinutes,
    },
  });

  revalidatePath("/app/servicos");
  revalidatePath(`/app/servicos/${id}/editar`);
  return { ok: true, id };
}

export async function setServiceActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const authz = await requirePermission("services:setActive");
  if (!authz.ok) {
    return { ok: false, error: t("services.forbidden") };
  }

  const existing = await prisma.service.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("services.notFound") };
  }

  if (existing.active === active) {
    return { ok: true, id };
  }

  if (active) {
    const conflict = await findActiveNameConflict(
      authz.user.companyId,
      existing.nameNormalized,
      id,
    );
    if (conflict) {
      return { ok: false, error: t("services.error.reactivateConflict") };
    }
  }

  await prisma.service.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/app/servicos");
  return { ok: true, id };
}
