import { prisma } from "@/lib/prisma";

export async function listServiceOrdersForCompany(
  companyId: string,
  options: { statusId?: string } = {},
) {
  return prisma.serviceOrder.findMany({
    where: { companyId, ...(options.statusId ? { statusId: options.statusId } : {}) },
    include: {
      service: true,
      client: true,
      clientProduct: { include: { product: true } },
      status: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getServiceOrderForCompany(id: string, companyId: string) {
  return prisma.serviceOrder.findFirst({
    where: { id, companyId },
    include: { service: true, client: true, clientProduct: { include: { product: true } }, status: true },
  });
}

export async function listActiveOrderServices(companyId: string) {
  return prisma.service.findMany({ where: { companyId, active: true }, orderBy: { name: "asc" } });
}

export async function listActiveOrderClients(companyId: string) {
  return prisma.client.findMany({ where: { companyId, active: true }, orderBy: { name: "asc" } });
}

export async function listActiveClientProducts(companyId: string, clientId: string) {
  return prisma.clientProduct.findMany({
    where: { companyId, clientId, active: true },
    include: { product: true },
    orderBy: { identifier: "asc" },
  });
}

export async function listAllActiveClientProducts(companyId: string) {
  return prisma.clientProduct.findMany({
    where: { companyId, active: true },
    include: { product: true },
    orderBy: { identifier: "asc" },
  });
}
