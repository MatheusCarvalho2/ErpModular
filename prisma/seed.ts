import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("Admin123!");

  const company = await prisma.company.upsert({
    where: { slug: "demo" },
    update: { name: "Empresa Demo" },
    create: {
      name: "Empresa Demo",
      slug: "demo",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: {
      name: "Admin Demo",
      passwordHash,
    },
    create: {
      email: "admin@demo.local",
      name: "Admin Demo",
      passwordHash,
    },
  });

  await prisma.membership.upsert({
    where: { userId: user.id },
    update: {
      companyId: company.id,
      role: "ADMIN",
    },
    create: {
      userId: user.id,
      companyId: company.id,
      role: "ADMIN",
    },
  });

  console.log("Seed OK:", {
    company: company.slug,
    user: user.email,
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
