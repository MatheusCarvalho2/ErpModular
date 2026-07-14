"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/normalize-text";
import { requirePermission } from "@/lib/permissions/authz";
import { t } from "@/lib/i18n";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

type ProductInput = {
  name: string;
  description?: string;
};

function parseFields(input: ProductInput):
  | {
      ok: true;
      name: string;
      nameNormalized: string;
      description: string | null;
    }
  | { ok: false; error: string } {
  const name = input.name?.trim() ?? "";
  const descriptionRaw = input.description?.trim() ?? "";

  if (!name) {
    return { ok: false, error: t("products.error.required") };
  }
  if (name.length > 120 || descriptionRaw.length > 2000) {
    return { ok: false, error: t("products.error.generic") };
  }

  return {
    ok: true,
    name,
    nameNormalized: normalizeText(name),
    description: descriptionRaw || null,
  };
}

async function findActiveNameConflict(
  companyId: string,
  nameNormalized: string,
  excludeId?: string,
) {
  return prisma.product.findFirst({
    where: {
      companyId,
      nameNormalized,
      active: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const authz = await requirePermission("products:create");
  if (!authz.ok) {
    return { ok: false, error: t("products.forbidden") };
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
    return { ok: false, error: t("products.error.duplicateName") };
  }

  const created = await prisma.product.create({
    data: {
      companyId: authz.user.companyId,
      name: parsed.name,
      nameNormalized: parsed.nameNormalized,
      description: parsed.description,
      active: true,
    },
  });

  revalidatePath("/app/produtos");
  return { ok: true, id: created.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  const authz = await requirePermission("products:update");
  if (!authz.ok) {
    return { ok: false, error: t("products.forbidden") };
  }

  const existing = await prisma.product.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("products.notFound") };
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
      return { ok: false, error: t("products.error.duplicateName") };
    }
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: parsed.name,
      nameNormalized: parsed.nameNormalized,
      description: parsed.description,
    },
  });

  revalidatePath("/app/produtos");
  revalidatePath(`/app/produtos/${id}/editar`);
  return { ok: true, id };
}

export async function setProductActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const authz = await requirePermission("products:setActive");
  if (!authz.ok) {
    return { ok: false, error: t("products.forbidden") };
  }

  const existing = await prisma.product.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("products.notFound") };
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
      return { ok: false, error: t("products.error.reactivateConflict") };
    }
  }

  await prisma.product.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/app/produtos");
  return { ok: true, id };
}
