import { prisma } from "@/lib/prisma";

export type ServiceListItem = {
  id: string;
  name: string;
  description: string;
  productDescription: string | null;
  priceCents: number | null;
  durationMinutes: number | null;
  active: boolean;
};

export async function listServicesForCompany(
  companyId: string,
  options: { active: boolean } = { active: true },
): Promise<ServiceListItem[]> {
  return prisma.service.findMany({
    where: {
      companyId,
      active: options.active,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      productDescription: true,
      priceCents: true,
      durationMinutes: true,
      active: true,
    },
  });
}

export async function getServiceForCompany(id: string, companyId: string) {
  return prisma.service.findFirst({
    where: { id, companyId },
  });
}
