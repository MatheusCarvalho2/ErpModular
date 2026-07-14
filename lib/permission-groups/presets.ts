import { prisma } from "@/lib/prisma";
import {
  SYSTEM_KEY_ADMIN,
  SYSTEM_KEY_OPERADORES,
  businessPermissionKeys,
} from "@/lib/permissions/catalog";

export async function ensureCompanyPermissionPresets(companyId: string) {
  let admin = await prisma.permissionGroup.findFirst({
    where: { companyId, systemKey: SYSTEM_KEY_ADMIN },
  });
  if (!admin) {
    admin = await prisma.permissionGroup.create({
      data: {
        companyId,
        name: "Admin",
        systemKey: SYSTEM_KEY_ADMIN,
      },
    });
  }

  let operadores = await prisma.permissionGroup.findFirst({
    where: { companyId, systemKey: SYSTEM_KEY_OPERADORES },
  });
  let operadoresCreated = false;
  if (!operadores) {
    operadores = await prisma.permissionGroup.create({
      data: {
        companyId,
        name: "Operadores",
        systemKey: SYSTEM_KEY_OPERADORES,
      },
    });
    operadoresCreated = true;
  }

  // Only seed full business grants on first creation — never re-add keys
  // an admin intentionally removed (would undo customização de Operadores).
  if (operadoresCreated) {
    const keys = businessPermissionKeys();
    await prisma.permissionGrant.createMany({
      data: keys.map((permissionKey) => ({
        permissionGroupId: operadores.id,
        permissionKey,
      })),
    });
  }

  return { admin, operadores };
}
