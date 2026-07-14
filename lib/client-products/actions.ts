"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/normalize-text";
import { requirePermission } from "@/lib/permissions/authz";
import { t } from "@/lib/i18n";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

type ClientProductInput = {
  clientId: string;
  productId: string;
  identifier: string;
  serialNumber?: string;
  notes?: string;
};

function parseOptionalText(value: string | undefined, max: number) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return { ok: true as const, value: null };
  }
  if (trimmed.length > max) {
    return { ok: false as const };
  }
  return { ok: true as const, value: trimmed };
}

function parseFields(input: ClientProductInput):
  | {
      ok: true;
      clientId: string;
      productId: string;
      identifier: string;
      identifierNormalized: string;
      serialNumber: string | null;
      notes: string | null;
    }
  | { ok: false; error: string } {
  const clientId = input.clientId?.trim() ?? "";
  const productId = input.productId?.trim() ?? "";
  const identifier = input.identifier?.trim() ?? "";

  if (!clientId || !productId || !identifier) {
    return { ok: false, error: t("clientProducts.error.required") };
  }
  if (identifier.length > 60) {
    return { ok: false, error: t("clientProducts.error.generic") };
  }

  const serial = parseOptionalText(input.serialNumber, 120);
  const notes = parseOptionalText(input.notes, 2000);
  if (!serial.ok || !notes.ok) {
    return { ok: false, error: t("clientProducts.error.generic") };
  }

  return {
    ok: true,
    clientId,
    productId,
    identifier,
    identifierNormalized: normalizeText(identifier),
    serialNumber: serial.value,
    notes: notes.value,
  };
}

async function findActiveIdentifierConflict(
  companyId: string,
  identifierNormalized: string,
  excludeId?: string,
) {
  return prisma.clientProduct.findFirst({
    where: {
      companyId,
      identifierNormalized,
      active: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createClientProduct(
  input: ClientProductInput,
): Promise<ActionResult> {
  const authz = await requirePermission("clientProducts:create");
  if (!authz.ok) {
    return { ok: false, error: t("clientProducts.forbidden") };
  }

  const parsed = parseFields(input);
  if (!parsed.ok) {
    return parsed;
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.clientId, companyId: authz.user.companyId },
  });
  if (!client) {
    return { ok: false, error: t("clients.notFound") };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: parsed.productId,
      companyId: authz.user.companyId,
      active: true,
    },
  });
  if (!product) {
    return { ok: false, error: t("clientProducts.error.productUnavailable") };
  }

  const conflict = await findActiveIdentifierConflict(
    authz.user.companyId,
    parsed.identifierNormalized,
  );
  if (conflict) {
    return { ok: false, error: t("clientProducts.error.duplicateIdentifier") };
  }

  const created = await prisma.clientProduct.create({
    data: {
      companyId: authz.user.companyId,
      clientId: parsed.clientId,
      productId: parsed.productId,
      identifier: parsed.identifier,
      identifierNormalized: parsed.identifierNormalized,
      serialNumber: parsed.serialNumber,
      notes: parsed.notes,
      active: true,
    },
  });

  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${parsed.clientId}`);
  return { ok: true, id: created.id };
}

export async function updateClientProduct(
  id: string,
  input: Omit<ClientProductInput, "clientId"> & { clientId?: string },
): Promise<ActionResult> {
  const authz = await requirePermission("clientProducts:update");
  if (!authz.ok) {
    return { ok: false, error: t("clientProducts.forbidden") };
  }

  const existing = await prisma.clientProduct.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("clientProducts.notFound") };
  }

  const parsed = parseFields({
    clientId: existing.clientId,
    productId: input.productId,
    identifier: input.identifier,
    serialNumber: input.serialNumber,
    notes: input.notes,
  });
  if (!parsed.ok) {
    return parsed;
  }

  const product = await prisma.product.findFirst({
    where: {
      id: parsed.productId,
      companyId: authz.user.companyId,
      OR: [{ active: true }, { id: existing.productId }],
    },
  });
  if (!product) {
    return { ok: false, error: t("clientProducts.error.productUnavailable") };
  }

  if (existing.active) {
    const conflict = await findActiveIdentifierConflict(
      authz.user.companyId,
      parsed.identifierNormalized,
      id,
    );
    if (conflict) {
      return { ok: false, error: t("clientProducts.error.duplicateIdentifier") };
    }
  }

  await prisma.clientProduct.update({
    where: { id },
    data: {
      productId: parsed.productId,
      identifier: parsed.identifier,
      identifierNormalized: parsed.identifierNormalized,
      serialNumber: parsed.serialNumber,
      notes: parsed.notes,
    },
  });

  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${existing.clientId}`);
  return { ok: true, id };
}

export async function setClientProductActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const authz = await requirePermission("clientProducts:setActive");
  if (!authz.ok) {
    return { ok: false, error: t("clientProducts.forbidden") };
  }

  const existing = await prisma.clientProduct.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("clientProducts.notFound") };
  }

  if (existing.active === active) {
    return { ok: true, id };
  }

  if (active) {
    const conflict = await findActiveIdentifierConflict(
      authz.user.companyId,
      existing.identifierNormalized,
      id,
    );
    if (conflict) {
      return {
        ok: false,
        error: t("clientProducts.error.reactivateConflict"),
      };
    }
  }

  await prisma.clientProduct.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${existing.clientId}`);
  return { ok: true, id };
}
