import { prisma } from "@/lib/prisma";

export type ClientProductListItem = {
  id: string;
  identifier: string;
  serialNumber: string | null;
  notes: string | null;
  active: boolean;
  product: { id: string; name: string; active: boolean };
};

export async function listClientProductsForClient(
  clientId: string,
  companyId: string,
  options: { active: boolean } = { active: true },
): Promise<ClientProductListItem[]> {
  return prisma.clientProduct.findMany({
    where: {
      clientId,
      companyId,
      active: options.active,
    },
    orderBy: { identifier: "asc" },
    select: {
      id: true,
      identifier: true,
      serialNumber: true,
      notes: true,
      active: true,
      product: { select: { id: true, name: true, active: true } },
    },
  });
}
