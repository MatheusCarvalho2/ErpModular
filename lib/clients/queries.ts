import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/normalize-text";

export type ClientListItem = {
  id: string;
  name: string;
  phone: string;
  personGroupId: string | null;
  active: boolean;
};

export async function listClientsForCompany(
  companyId: string,
  options: { active: boolean } = { active: true },
): Promise<ClientListItem[]> {
  return prisma.client.findMany({
    where: {
      companyId,
      active: options.active,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      personGroupId: true,
      active: true,
    },
  });
}

export async function getClientForCompany(id: string, companyId: string) {
  return prisma.client.findFirst({
    where: { id, companyId },
  });
}

export async function findClientByIdentifier(
  companyId: string,
  identifier: string,
) {
  const identifierNormalized = normalizeText(identifier);
  if (!identifierNormalized) {
    return null;
  }

  const link = await prisma.clientProduct.findFirst({
    where: {
      companyId,
      identifierNormalized,
      active: true,
    },
    include: {
      client: true,
      product: { select: { name: true } },
    },
  });

  return link;
}
