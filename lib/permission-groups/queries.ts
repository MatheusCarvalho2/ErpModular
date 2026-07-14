import { prisma } from "@/lib/prisma";
import {
  SYSTEM_KEY_ADMIN,
  SYSTEM_KEY_OPERADORES,
} from "@/lib/permissions/catalog";

export type PermissionGroupListItem = {
  id: string;
  name: string;
  systemKey: string | null;
  memberCount: number;
  grantKeys: string[];
};

export async function listPermissionGroups(
  companyId: string,
): Promise<PermissionGroupListItem[]> {
  const groups = await prisma.permissionGroup.findMany({
    where: { companyId },
    include: {
      grants: true,
      _count: { select: { memberships: true } },
    },
  });

  const rank = (systemKey: string | null) => {
    if (systemKey === SYSTEM_KEY_ADMIN) return 0;
    if (systemKey === SYSTEM_KEY_OPERADORES) return 1;
    return 2;
  };

  return groups
    .map((g) => ({
      id: g.id,
      name: g.name,
      systemKey: g.systemKey,
      memberCount: g._count.memberships,
      grantKeys: g.grants.map((x) => x.permissionKey),
    }))
    .sort((a, b) => {
      const r = rank(a.systemKey) - rank(b.systemKey);
      if (r !== 0) return r;
      return a.name.localeCompare(b.name, "pt-BR");
    });
}

export async function getPermissionGroupForCompany(
  companyId: string,
  id: string,
) {
  return prisma.permissionGroup.findFirst({
    where: { id, companyId },
    include: {
      grants: true,
      memberships: {
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      },
    },
  });
}

export async function listCompanyMemberships(companyId: string) {
  return prisma.membership.findMany({
    where: { companyId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      permissionGroup: { select: { id: true, name: true, systemKey: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}
