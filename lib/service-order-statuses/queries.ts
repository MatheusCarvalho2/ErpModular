import { prisma } from "@/lib/prisma";

export async function listStatusesForCompany(
  companyId: string,
  options: { active?: boolean } = {},
) {
  return prisma.serviceOrderStatus.findMany({
    where: { companyId, ...(options.active === undefined ? {} : { active: options.active }) },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getDefaultInitialStatus(companyId: string) {
  return prisma.serviceOrderStatus.findFirst({
    where: { companyId, active: true, isDefaultInitial: true },
    orderBy: { sortOrder: "asc" },
  });
}
