import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { normalizeName } from "../lib/service-name";
import { normalizeText } from "../lib/normalize-text";
import { normalizePhoneDigits } from "../lib/phone";
import { ensureCompanyPermissionPresets } from "../lib/permission-groups/presets";
import {
  operadoresPermissionKeys,
  SYSTEM_KEY_ADMIN,
  SYSTEM_KEY_OPERADORES,
} from "../lib/permissions/catalog";
import { ensureDefaultServiceOrderStatuses } from "../lib/service-order-statuses/ensure-defaults";

const prisma = new PrismaClient();

async function upsertService(params: {
  companyId: string;
  name: string;
  description: string;
  productDescription?: string;
  priceCents?: number;
  durationMinutes?: number;
  active: boolean;
}) {
  const nameNormalized = normalizeName(params.name);
  const existing = await prisma.service.findFirst({
    where: {
      companyId: params.companyId,
      nameNormalized,
    },
  });

  const data = {
    name: params.name,
    nameNormalized,
    description: params.description,
    productDescription: params.productDescription ?? null,
    priceCents: params.priceCents ?? null,
    durationMinutes: params.durationMinutes ?? null,
    active: params.active,
  };

  if (existing) {
    return prisma.service.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.service.create({
    data: {
      companyId: params.companyId,
      ...data,
    },
  });
}

async function upsertProduct(params: {
  companyId: string;
  name: string;
  description?: string;
  active: boolean;
}) {
  const nameNormalized = normalizeText(params.name);
  const existing = await prisma.product.findFirst({
    where: { companyId: params.companyId, nameNormalized },
  });
  const data = {
    name: params.name,
    nameNormalized,
    description: params.description ?? null,
    active: params.active,
  };
  if (existing) {
    return prisma.product.update({ where: { id: existing.id }, data });
  }
  return prisma.product.create({
    data: { companyId: params.companyId, ...data },
  });
}

async function upsertClient(params: {
  companyId: string;
  name: string;
  phone: string;
  personGroupId?: string | null;
  active: boolean;
}) {
  const phoneNormalized = normalizePhoneDigits(params.phone);
  const existing = await prisma.client.findFirst({
    where: {
      companyId: params.companyId,
      name: params.name,
      phoneNormalized,
    },
  });
  const data = {
    name: params.name,
    phone: params.phone,
    phoneNormalized,
    personGroupId: params.personGroupId ?? null,
    active: params.active,
  };
  if (existing) {
    return prisma.client.update({ where: { id: existing.id }, data });
  }
  return prisma.client.create({
    data: { companyId: params.companyId, ...data },
  });
}

async function upsertClientProduct(params: {
  companyId: string;
  clientId: string;
  productId: string;
  identifier: string;
  serialNumber?: string;
  notes?: string;
  active: boolean;
}) {
  const identifierNormalized = normalizeText(params.identifier);
  const existing = await prisma.clientProduct.findFirst({
    where: {
      companyId: params.companyId,
      identifierNormalized,
    },
  });
  const data = {
    clientId: params.clientId,
    productId: params.productId,
    identifier: params.identifier,
    identifierNormalized,
    serialNumber: params.serialNumber ?? null,
    notes: params.notes ?? null,
    active: params.active,
  };
  if (existing) {
    return prisma.clientProduct.update({ where: { id: existing.id }, data });
  }
  return prisma.clientProduct.create({
    data: { companyId: params.companyId, ...data },
  });
}

async function upsertMembership(params: {
  userId: string;
  companyId: string;
  systemKey: typeof SYSTEM_KEY_ADMIN | typeof SYSTEM_KEY_OPERADORES;
}) {
  const { admin, operadores } = await ensureCompanyPermissionPresets(
    params.companyId,
  );
  const groupId =
    params.systemKey === SYSTEM_KEY_ADMIN ? admin.id : operadores.id;

  await prisma.membership.upsert({
    where: { userId: params.userId },
    update: {
      companyId: params.companyId,
      permissionGroupId: groupId,
    },
    create: {
      userId: params.userId,
      companyId: params.companyId,
      permissionGroupId: groupId,
    },
  });
}

async function resetOperadoresToOperationalBusiness(companyId: string) {
  const { operadores } = await ensureCompanyPermissionPresets(companyId);
  await prisma.permissionGrant.deleteMany({
    where: { permissionGroupId: operadores.id },
  });
  const keys = operadoresPermissionKeys();
  await prisma.permissionGrant.createMany({
    data: keys.map((permissionKey) => ({
      permissionGroupId: operadores.id,
      permissionKey,
    })),
  });
}

async function main() {
  const adminPasswordHash = await hashPassword("Admin123!");
  const memberPasswordHash = await hashPassword("Membro123!");

  const company = await prisma.company.upsert({
    where: { slug: "demo" },
    update: { name: "Empresa Demo", active: true },
    create: {
      name: "Empresa Demo",
      slug: "demo",
      active: true,
    },
  });

  const otherCompany = await prisma.company.upsert({
    where: { slug: "outra" },
    update: { name: "Outra Empresa", active: true },
    create: {
      name: "Outra Empresa",
      slug: "outra",
      active: true,
    },
  });

  const inactiveCompany = await prisma.company.upsert({
    where: { slug: "inativa-demo" },
    update: { name: "Empresa Inativa Demo", active: false },
    create: {
      name: "Empresa Inativa Demo",
      slug: "inativa-demo",
      active: false,
    },
  });

  await ensureCompanyPermissionPresets(company.id);
  await ensureCompanyPermissionPresets(otherCompany.id);
  await ensureCompanyPermissionPresets(inactiveCompany.id);
  await resetOperadoresToOperationalBusiness(company.id);
  await resetOperadoresToOperationalBusiness(otherCompany.id);
  await resetOperadoresToOperationalBusiness(inactiveCompany.id);
  await ensureDefaultServiceOrderStatuses(company.id);
  await ensureDefaultServiceOrderStatuses(otherCompany.id);
  await ensureDefaultServiceOrderStatuses(inactiveCompany.id);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: {
      name: "Admin Demo",
      passwordHash: adminPasswordHash,
      active: true,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
    create: {
      email: "admin@demo.local",
      name: "Admin Demo",
      passwordHash: adminPasswordHash,
      active: true,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
  });

  await upsertMembership({
    userId: admin.id,
    companyId: company.id,
    systemKey: SYSTEM_KEY_ADMIN,
  });

  const member = await prisma.user.upsert({
    where: { email: "membro@demo.local" },
    update: {
      name: "Membro Demo",
      passwordHash: memberPasswordHash,
      active: true,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
    create: {
      email: "membro@demo.local",
      name: "Membro Demo",
      passwordHash: memberPasswordHash,
      active: true,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
  });

  await upsertMembership({
    userId: member.id,
    companyId: company.id,
    systemKey: SYSTEM_KEY_OPERADORES,
  });

  const otherAdmin = await prisma.user.upsert({
    where: { email: "admin@outra.local" },
    update: {
      name: "Admin Outra",
      passwordHash: adminPasswordHash,
      active: true,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
    create: {
      email: "admin@outra.local",
      name: "Admin Outra",
      passwordHash: adminPasswordHash,
      active: true,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
  });

  await upsertMembership({
    userId: otherAdmin.id,
    companyId: otherCompany.id,
    systemKey: SYSTEM_KEY_ADMIN,
  });

  const platformOperator = await prisma.user.upsert({
    where: { email: "plataforma@demo.local" },
    update: {
      name: "Operador da Plataforma",
      passwordHash: adminPasswordHash,
      active: true,
      isPlatformOperator: true,
      mustChangePassword: false,
    },
    create: {
      email: "plataforma@demo.local",
      name: "Operador da Plataforma",
      passwordHash: adminPasswordHash,
      active: true,
      isPlatformOperator: true,
      mustChangePassword: false,
    },
  });

  // Operador de plataforma não possui Membership
  await prisma.membership.deleteMany({
    where: { userId: platformOperator.id },
  });

  const inactiveUser = await prisma.user.upsert({
    where: { email: "inativo@demo.local" },
    update: {
      name: "Usuário Inativo Demo",
      passwordHash: memberPasswordHash,
      active: false,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
    create: {
      email: "inativo@demo.local",
      name: "Usuário Inativo Demo",
      passwordHash: memberPasswordHash,
      active: false,
      isPlatformOperator: false,
      mustChangePassword: false,
    },
  });

  await upsertMembership({
    userId: inactiveUser.id,
    companyId: company.id,
    systemKey: SYSTEM_KEY_OPERADORES,
  });

  await upsertService({
    companyId: company.id,
    name: "Troca de óleo",
    description: "Troca de óleo do motor com filtro.",
    productDescription: "Óleo 5W30 sintético",
    priceCents: 18990,
    durationMinutes: 90,
    active: true,
  });

  const repairService = await upsertService({
    companyId: company.id,
    name: "Reparo de eletrodoméstico",
    description: "Diagnóstico e reparo de eletrodomésticos.",
    priceCents: 15000,
    durationMinutes: 60,
    active: true,
  });

  await upsertService({
    companyId: company.id,
    name: "Alinhamento",
    description: "Alinhamento de direção.",
    priceCents: 12000,
    durationMinutes: 60,
    active: false,
  });

  await upsertService({
    companyId: otherCompany.id,
    name: "Serviço Outra",
    description: "Serviço exclusivo da outra empresa.",
    priceCents: 5000,
    durationMinutes: 30,
    active: true,
  });

  const airFryer = await upsertProduct({
    companyId: company.id,
    name: "Air fryer",
    description: "Fritadeira elétrica",
    active: true,
  });

  await upsertProduct({
    companyId: otherCompany.id,
    name: "Air fryer",
    description: "Produto da outra empresa",
    active: true,
  });

  const maria = await upsertClient({
    companyId: company.id,
    name: "Maria Demo",
    phone: "(11) 98888-0001",
    active: true,
  });

  const jose = await upsertClient({
    companyId: company.id,
    name: "José Demo",
    phone: "(11) 98888-0002",
    active: true,
  });

  await upsertClientProduct({
    companyId: company.id,
    clientId: maria.id,
    productId: airFryer.id,
    identifier: "1",
    serialNumber: "SN-MARIA",
    notes: "Equipamento seed",
    active: true,
  });

  const joseAirFryer = await upsertClientProduct({
    companyId: company.id,
    clientId: jose.id,
    productId: airFryer.id,
    identifier: "2",
    active: true,
  });

  const received = await prisma.serviceOrderStatus.findFirstOrThrow({
    where: {
      companyId: company.id,
      nameNormalized: normalizeName("Recebido"),
      active: true,
    },
  });
  const existingOrder = await prisma.serviceOrder.findFirst({
    where: {
      companyId: company.id,
      serviceId: repairService.id,
      clientId: jose.id,
      clientProductId: joseAirFryer.id,
    },
  });
  if (existingOrder) {
    await prisma.serviceOrder.update({
      where: { id: existingOrder.id },
      data: { statusId: received.id, priceCents: 15000 },
    });
  } else {
    await prisma.serviceOrder.create({
      data: {
        companyId: company.id,
        serviceId: repairService.id,
        clientId: jose.id,
        clientProductId: joseAirFryer.id,
        statusId: received.id,
        priceCents: 15000,
        workDescription: "Ordem de demonstração.",
      },
    });
  }

  console.log("Seed OK:", {
    company: company.slug,
    inactiveCompany: inactiveCompany.slug,
    admin: admin.email,
    member: member.email,
    inactiveUser: inactiveUser.email,
    otherCompany: otherCompany.slug,
    otherAdmin: otherAdmin.email,
    platformOperator: platformOperator.email,
    product: airFryer.name,
    clients: [maria.name, jose.name],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
