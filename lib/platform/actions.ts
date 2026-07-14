"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { t } from "@/lib/i18n";
import { requirePlatformOperator } from "@/lib/platform/authz";
import { slugifyCompanyName, uniqueSlug } from "@/lib/platform/slug";
import { ensureCompanyPermissionPresets } from "@/lib/permission-groups/presets";
import { auth } from "@/lib/auth";

function revalidateBackoffice(paths: string[] = []) {
  revalidatePath("/backoffice");
  revalidatePath("/backoffice/empresas");
  revalidatePath("/backoffice/usuarios");
  for (const p of paths) {
    revalidatePath(p);
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createCompany(input: { name: string }) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false as const, error: t("backoffice.companies.error.required") };
  }

  const conflict = await prisma.company.findFirst({
    where: { name, active: true },
  });
  if (conflict) {
    return {
      ok: false as const,
      error: t("backoffice.companies.error.duplicateName"),
    };
  }

  const existingSlugs = await prisma.company.findMany({
    select: { slug: true },
  });
  const taken = new Set(existingSlugs.map((c) => c.slug));
  const slug = uniqueSlug(slugifyCompanyName(name), taken);

  const company = await prisma.company.create({
    data: { name, slug, active: true },
  });
  await ensureCompanyPermissionPresets(company.id);

  revalidateBackoffice([`/backoffice/empresas/${company.id}`]);
  return { ok: true as const, id: company.id };
}

export async function updateCompany(input: { id: string; name: string }) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false as const, error: t("backoffice.companies.error.required") };
  }

  const company = await prisma.company.findUnique({ where: { id: input.id } });
  if (!company) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }

  const conflict = await prisma.company.findFirst({
    where: {
      name,
      active: true,
      NOT: { id: input.id },
    },
  });
  if (conflict) {
    return {
      ok: false as const,
      error: t("backoffice.companies.error.duplicateName"),
    };
  }

  await prisma.company.update({
    where: { id: input.id },
    data: { name },
  });

  revalidateBackoffice([`/backoffice/empresas/${input.id}`]);
  return { ok: true as const };
}

export async function setCompanyActive(input: { id: string; active: boolean }) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const company = await prisma.company.findUnique({ where: { id: input.id } });
  if (!company) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }

  if (company.active === input.active) {
    return { ok: true as const };
  }

  await prisma.company.update({
    where: { id: input.id },
    data: { active: input.active },
  });

  revalidateBackoffice([`/backoffice/empresas/${input.id}`]);
  return { ok: true as const };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  companyId: string;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const companyId = input.companyId;

  if (!name || !email || !password || !companyId) {
    return { ok: false as const, error: t("backoffice.users.error.required") };
  }
  if (!isValidEmail(email)) {
    return {
      ok: false as const,
      error: t("backoffice.users.error.invalidEmail"),
    };
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }
  if (!company.active) {
    return {
      ok: false as const,
      error: t("backoffice.users.error.companyInactive"),
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false as const,
      error: t("backoffice.users.error.emailConflict"),
    };
  }

  const { admin } = await ensureCompanyPermissionPresets(companyId);
  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        active: true,
        isPlatformOperator: false,
        mustChangePassword: false,
      },
    });
    await tx.membership.create({
      data: {
        userId: created.id,
        companyId,
        permissionGroupId: admin.id,
      },
    });
    return created;
  });

  revalidateBackoffice([`/backoffice/usuarios/${user.id}`]);
  return { ok: true as const, id: user.id };
}

export async function updateUser(input: {
  id: string;
  name?: string;
  email?: string;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const user = await prisma.user.findFirst({
    where: { id: input.id, isPlatformOperator: false },
  });
  if (!user) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }

  const data: { name?: string; email?: string } = {};
  if (typeof input.name === "string") {
    const name = input.name.trim();
    if (!name) {
      return { ok: false as const, error: t("backoffice.users.error.required") };
    }
    data.name = name;
  }
  if (typeof input.email === "string") {
    const email = input.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return {
        ok: false as const,
        error: t("backoffice.users.error.invalidEmail"),
      };
    }
    const conflict = await prisma.user.findFirst({
      where: { email, NOT: { id: input.id } },
    });
    if (conflict) {
      return {
        ok: false as const,
        error: t("backoffice.users.error.emailConflict"),
      };
    }
    data.email = email;
  }

  await prisma.user.update({ where: { id: input.id }, data });
  revalidateBackoffice([`/backoffice/usuarios/${input.id}`]);
  return { ok: true as const };
}

export async function setUserActive(input: { id: string; active: boolean }) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const user = await prisma.user.findFirst({
    where: { id: input.id, isPlatformOperator: false },
  });
  if (!user) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }

  if (user.active === input.active) {
    return { ok: true as const };
  }

  await prisma.user.update({
    where: { id: input.id },
    data: { active: input.active },
  });

  revalidateBackoffice([`/backoffice/usuarios/${input.id}`]);
  return { ok: true as const };
}

export async function resetUserPassword(input: {
  id: string;
  temporaryPassword: string;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  if (!input.temporaryPassword) {
    return {
      ok: false as const,
      error: t("backoffice.users.error.passwordRequired"),
    };
  }

  const user = await prisma.user.findFirst({
    where: { id: input.id, isPlatformOperator: false, active: true },
  });
  if (!user) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }

  const passwordHash = await hashPassword(input.temporaryPassword);
  await prisma.user.update({
    where: { id: input.id },
    data: { passwordHash, mustChangePassword: true },
  });

  revalidateBackoffice([`/backoffice/usuarios/${input.id}`]);
  return { ok: true as const };
}

export async function setPlatformOperatorActive(input: {
  id: string;
  active: boolean;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: t("backoffice.forbidden") };
  }

  const user = await prisma.user.findFirst({
    where: { id: input.id, isPlatformOperator: true },
  });
  if (!user) {
    return { ok: false as const, error: t("backoffice.notFound") };
  }

  if (user.active === input.active) {
    return { ok: true as const };
  }

  if (!input.active) {
    const activeOperators = await prisma.user.count({
      where: { isPlatformOperator: true, active: true },
    });
    if (activeOperators <= 1) {
      return {
        ok: false as const,
        error: t("backoffice.users.error.lastOperator"),
      };
    }
  }

  await prisma.user.update({
    where: { id: input.id },
    data: { active: input.active },
  });

  return { ok: true as const };
}

export async function changeOwnPassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.sessionKind !== "erp") {
    return { ok: false as const, error: t("auth.changePassword.error.generic") };
  }

  if (!input.currentPassword || !input.newPassword) {
    return {
      ok: false as const,
      error: t("auth.changePassword.error.required"),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || !user.mustChangePassword) {
    return { ok: false as const, error: t("auth.changePassword.error.generic") };
  }

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    return {
      ok: false as const,
      error: t("auth.changePassword.error.invalidCurrent"),
    };
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  return { ok: true as const };
}
