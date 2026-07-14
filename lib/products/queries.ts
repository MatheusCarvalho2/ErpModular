import { prisma } from "@/lib/prisma";

export type ProductListItem = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export async function listProductsForCompany(
  companyId: string,
  options: { active: boolean } = { active: true },
): Promise<ProductListItem[]> {
  return prisma.product.findMany({
    where: {
      companyId,
      active: options.active,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
    },
  });
}

export async function listActiveProductsForSelect(companyId: string) {
  return prisma.product.findMany({
    where: { companyId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getProductForCompany(id: string, companyId: string) {
  return prisma.product.findFirst({
    where: { id, companyId },
  });
}
