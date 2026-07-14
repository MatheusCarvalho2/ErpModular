"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizePhoneDigits } from "@/lib/phone";
import { requirePermission } from "@/lib/permissions/authz";
import { t } from "@/lib/i18n";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string }
  | {
      ok: false;
      code: "PHONE_IN_USE";
      error: string;
      existingClient: { id: string; name: string; phone: string };
    };

type ClientInput = {
  name: string;
  phone: string;
  linkToPersonId?: string;
};

function parseFields(input: ClientInput):
  | {
      ok: true;
      name: string;
      phone: string;
      phoneNormalized: string;
    }
  | { ok: false; error: string } {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const phoneNormalized = normalizePhoneDigits(phone);

  if (!name || !phoneNormalized) {
    return { ok: false, error: t("clients.error.required") };
  }
  if (name.length > 120 || phone.length > 40) {
    return { ok: false, error: t("clients.error.generic") };
  }

  return { ok: true, name, phone, phoneNormalized };
}

async function findActivePhoneConflict(
  companyId: string,
  phoneNormalized: string,
  excludeId?: string,
) {
  return prisma.client.findFirst({
    where: {
      companyId,
      phoneNormalized,
      active: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

async function ensureSharedPersonGroup(
  companyId: string,
  existingId: string,
  phoneNormalized: string,
): Promise<string | { error: string }> {
  const existing = await prisma.client.findFirst({
    where: { id: existingId, companyId, active: true },
  });
  if (!existing) {
    return { error: t("clients.error.linkTargetInvalid") };
  }
  if (existing.phoneNormalized !== phoneNormalized) {
    return { error: t("clients.error.linkTargetInvalid") };
  }

  const groupId = existing.personGroupId ?? randomUUID();
  if (!existing.personGroupId) {
    await prisma.client.update({
      where: { id: existing.id },
      data: { personGroupId: groupId },
    });
  } else {
    await prisma.client.updateMany({
      where: {
        companyId,
        personGroupId: existing.personGroupId,
        active: true,
      },
      data: { personGroupId: groupId },
    });
  }
  return groupId;
}

export async function createClient(input: ClientInput): Promise<ActionResult> {
  const authz = await requirePermission("clients:create");
  if (!authz.ok) {
    return { ok: false, error: t("clients.forbidden") };
  }

  const parsed = parseFields(input);
  if (!parsed.ok) {
    return parsed;
  }

  const conflict = await findActivePhoneConflict(
    authz.user.companyId,
    parsed.phoneNormalized,
  );

  if (conflict && !input.linkToPersonId) {
    return {
      ok: false,
      code: "PHONE_IN_USE",
      error: t("clients.error.phoneInUse"),
      existingClient: {
        id: conflict.id,
        name: conflict.name,
        phone: conflict.phone,
      },
    };
  }

  let personGroupId: string | null = null;
  if (conflict && input.linkToPersonId) {
    if (input.linkToPersonId !== conflict.id) {
      const targetOk = await prisma.client.findFirst({
        where: {
          id: input.linkToPersonId,
          companyId: authz.user.companyId,
          phoneNormalized: parsed.phoneNormalized,
          active: true,
        },
      });
      if (!targetOk) {
        return { ok: false, error: t("clients.error.linkTargetInvalid") };
      }
    }
    const group = await ensureSharedPersonGroup(
      authz.user.companyId,
      input.linkToPersonId,
      parsed.phoneNormalized,
    );
    if (typeof group === "object") {
      return { ok: false, error: group.error };
    }
    personGroupId = group;
  }

  const created = await prisma.client.create({
    data: {
      companyId: authz.user.companyId,
      name: parsed.name,
      phone: parsed.phone,
      phoneNormalized: parsed.phoneNormalized,
      personGroupId,
      active: true,
    },
  });

  revalidatePath("/app/clientes");
  return { ok: true, id: created.id };
}

export async function updateClient(
  id: string,
  input: ClientInput,
): Promise<ActionResult> {
  const authz = await requirePermission("clients:update");
  if (!authz.ok) {
    return { ok: false, error: t("clients.forbidden") };
  }

  const existing = await prisma.client.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("clients.notFound") };
  }

  const parsed = parseFields(input);
  if (!parsed.ok) {
    return parsed;
  }

  const conflict = await findActivePhoneConflict(
    authz.user.companyId,
    parsed.phoneNormalized,
    id,
  );

  let personGroupId = existing.personGroupId;

  if (conflict) {
    const sameGroup =
      existing.personGroupId &&
      conflict.personGroupId &&
      existing.personGroupId === conflict.personGroupId;

    if (!sameGroup && !input.linkToPersonId) {
      return {
        ok: false,
        code: "PHONE_IN_USE",
        error: t("clients.error.phoneInUse"),
        existingClient: {
          id: conflict.id,
          name: conflict.name,
          phone: conflict.phone,
        },
      };
    }

    if (!sameGroup && input.linkToPersonId) {
      const group = await ensureSharedPersonGroup(
        authz.user.companyId,
        input.linkToPersonId,
        parsed.phoneNormalized,
      );
      if (typeof group === "object") {
        return { ok: false, error: group.error };
      }
      personGroupId = group;
    }
  }

  await prisma.client.update({
    where: { id },
    data: {
      name: parsed.name,
      phone: parsed.phone,
      phoneNormalized: parsed.phoneNormalized,
      personGroupId,
    },
  });

  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${id}`);
  revalidatePath(`/app/clientes/${id}/editar`);
  return { ok: true, id };
}

export async function setClientActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const authz = await requirePermission("clients:setActive");
  if (!authz.ok) {
    return { ok: false, error: t("clients.forbidden") };
  }

  const existing = await prisma.client.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!existing) {
    return { ok: false, error: t("clients.notFound") };
  }

  if (existing.active === active) {
    return { ok: true, id };
  }

  if (active) {
    const conflict = await findActivePhoneConflict(
      authz.user.companyId,
      existing.phoneNormalized,
      id,
    );
    if (conflict) {
      const sameGroup =
        existing.personGroupId &&
        conflict.personGroupId &&
        existing.personGroupId === conflict.personGroupId;
      if (!sameGroup) {
        return { ok: false, error: t("clients.error.reactivatePhoneConflict") };
      }
    }
  }

  await prisma.client.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${id}`);
  return { ok: true, id };
}
