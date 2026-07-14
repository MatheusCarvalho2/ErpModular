"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions/authz";
import {
  SYSTEM_KEY_ADMIN,
  SYSTEM_KEY_OPERADORES,
  filterBusinessKeys,
} from "@/lib/permissions/catalog";
import { ensureCompanyPermissionPresets } from "@/lib/permission-groups/presets";
import { t } from "@/lib/i18n";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function revalidateGroups() {
  revalidatePath("/app/grupos-permissao");
}

async function replaceGrants(groupId: string, keys: string[]) {
  const business = filterBusinessKeys(keys);
  await prisma.permissionGrant.deleteMany({
    where: { permissionGroupId: groupId },
  });
  if (business.length > 0) {
    await prisma.permissionGrant.createMany({
      data: business.map((permissionKey) => ({
        permissionGroupId: groupId,
        permissionKey,
      })),
    });
  }
}

export async function createPermissionGroup(input: {
  name: string;
  permissionKeys: string[];
}): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) {
    return { ok: false, error: t("permissionGroups.forbidden") };
  }

  const name = input.name?.trim() ?? "";
  if (!name || name.length > 80) {
    return { ok: false, error: t("permissionGroups.error.nameRequired") };
  }

  const conflict = await prisma.permissionGroup.findFirst({
    where: {
      companyId: authz.user.companyId,
      name: { equals: name },
    },
  });
  if (conflict) {
    return { ok: false, error: t("permissionGroups.error.nameConflict") };
  }

  const created = await prisma.permissionGroup.create({
    data: {
      companyId: authz.user.companyId,
      name,
      systemKey: null,
    },
  });
  await replaceGrants(created.id, input.permissionKeys);
  revalidateGroups();
  return { ok: true, id: created.id };
}

export async function updatePermissionGroup(input: {
  id: string;
  name?: string;
  permissionKeys?: string[];
}): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) {
    return { ok: false, error: t("permissionGroups.forbidden") };
  }

  const group = await prisma.permissionGroup.findFirst({
    where: { id: input.id, companyId: authz.user.companyId },
  });
  if (!group) {
    return { ok: false, error: t("permissionGroups.notFound") };
  }

  if (group.systemKey === SYSTEM_KEY_ADMIN) {
    return { ok: false, error: t("permissionGroups.error.adminImmutable") };
  }

  if (group.systemKey === SYSTEM_KEY_OPERADORES) {
    if (input.name !== undefined && input.name.trim() !== group.name) {
      return { ok: false, error: t("permissionGroups.error.operadoresNameFixed") };
    }
    if (input.permissionKeys) {
      await replaceGrants(group.id, input.permissionKeys);
    }
    revalidateGroups();
    revalidatePath(`/app/grupos-permissao/${group.id}/editar`);
    return { ok: true, id: group.id };
  }

  const data: { name?: string } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name || name.length > 80) {
      return { ok: false, error: t("permissionGroups.error.nameRequired") };
    }
    const conflict = await prisma.permissionGroup.findFirst({
      where: {
        companyId: authz.user.companyId,
        name: { equals: name },
        NOT: { id: group.id },
      },
    });
    if (conflict) {
      return { ok: false, error: t("permissionGroups.error.nameConflict") };
    }
    data.name = name;
  }

  if (Object.keys(data).length > 0) {
    await prisma.permissionGroup.update({
      where: { id: group.id },
      data,
    });
  }
  if (input.permissionKeys) {
    await replaceGrants(group.id, input.permissionKeys);
  }

  revalidateGroups();
  revalidatePath(`/app/grupos-permissao/${group.id}/editar`);
  return { ok: true, id: group.id };
}

export async function deletePermissionGroup(id: string): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) {
    return { ok: false, error: t("permissionGroups.forbidden") };
  }

  const group = await prisma.permissionGroup.findFirst({
    where: { id, companyId: authz.user.companyId },
  });
  if (!group) {
    return { ok: false, error: t("permissionGroups.notFound") };
  }
  if (group.systemKey === SYSTEM_KEY_ADMIN || group.systemKey === SYSTEM_KEY_OPERADORES) {
    return { ok: false, error: t("permissionGroups.error.cannotDeletePreset") };
  }

  const { operadores } = await ensureCompanyPermissionPresets(
    authz.user.companyId,
  );

  await prisma.$transaction([
    prisma.membership.updateMany({
      where: { permissionGroupId: group.id },
      data: { permissionGroupId: operadores.id },
    }),
    prisma.permissionGroup.delete({ where: { id: group.id } }),
  ]);

  revalidateGroups();
  return { ok: true };
}

export async function assignUserToGroup(input: {
  userId: string;
  permissionGroupId: string;
}): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) {
    return { ok: false, error: t("permissionGroups.forbidden") };
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: input.userId, companyId: authz.user.companyId },
    include: { permissionGroup: true },
  });
  if (!membership) {
    return { ok: false, error: t("permissionGroups.error.userNotFound") };
  }

  const target = await prisma.permissionGroup.findFirst({
    where: {
      id: input.permissionGroupId,
      companyId: authz.user.companyId,
    },
  });
  if (!target) {
    return { ok: false, error: t("permissionGroups.notFound") };
  }

  const leavingAdmin =
    membership.permissionGroup.systemKey === SYSTEM_KEY_ADMIN &&
    target.systemKey !== SYSTEM_KEY_ADMIN;

  if (leavingAdmin) {
    const adminCount = await prisma.membership.count({
      where: {
        companyId: authz.user.companyId,
        permissionGroup: { systemKey: SYSTEM_KEY_ADMIN },
      },
    });
    if (adminCount <= 1) {
      return { ok: false, error: t("permissionGroups.error.lastAdmin") };
    }
  }

  await prisma.membership.update({
    where: { id: membership.id },
    data: { permissionGroupId: target.id },
  });

  revalidateGroups();
  revalidatePath(`/app/grupos-permissao/${target.id}/editar`);
  return { ok: true };
}
