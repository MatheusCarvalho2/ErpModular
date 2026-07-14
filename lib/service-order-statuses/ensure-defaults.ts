import { ServiceOrderStatusRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/service-name";

const DEFAULT_STATUSES: {
  name: string;
  sortOrder: number;
  role: ServiceOrderStatusRole;
  isDefaultInitial: boolean;
}[] = [
  { name: "Recebido", sortOrder: 10, role: "OPERATIONAL", isDefaultInitial: true },
  { name: "Orçando", sortOrder: 20, role: "OPERATIONAL", isDefaultInitial: false },
  { name: "Aguardando", sortOrder: 30, role: "OPERATIONAL", isDefaultInitial: false },
  { name: "Fazendo", sortOrder: 40, role: "OPERATIONAL", isDefaultInitial: false },
  { name: "Pronto", sortOrder: 50, role: "COMPLETED", isDefaultInitial: false },
];

export async function ensureDefaultServiceOrderStatuses(companyId: string) {
  await prisma.$transaction(async (tx) => {
    for (const status of DEFAULT_STATUSES) {
      const nameNormalized = normalizeName(status.name);
      const existing = await tx.serviceOrderStatus.findFirst({
        where: { companyId, nameNormalized },
      });
      if (!existing) {
        await tx.serviceOrderStatus.create({
          data: { companyId, nameNormalized, ...status, active: true },
        });
      }
    }
  });
}
