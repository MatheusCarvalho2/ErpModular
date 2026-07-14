import { prisma } from "@/lib/prisma";
import { requirePlatformOperator } from "@/lib/platform/authz";

export type StatusFilter = "all" | "active" | "inactive";

export async function listCompanies(params?: {
  q?: string;
  status?: StatusFilter;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: authz.error };
  }

  const status = params?.status ?? "all";
  const q = params?.q?.trim();

  const companies = await prisma.company.findMany({
    where: {
      ...(status === "active"
        ? { active: true }
        : status === "inactive"
          ? { active: false }
          : {}),
      ...(q
        ? { name: { contains: q } }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { memberships: true } },
    },
  });

  return {
    ok: true as const,
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      active: c.active,
      userCount: c._count.memberships,
    })),
  };
}

export async function getCompany(id: string) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: authz.error };
  }

  const company = await prisma.company.findUnique({
    where: { id },
    include: { _count: { select: { memberships: true } } },
  });
  if (!company) {
    return { ok: false as const, error: "notFound" as const };
  }

  return {
    ok: true as const,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      active: company.active,
      userCount: company._count.memberships,
    },
  };
}

export async function listClientUsers(params?: {
  q?: string;
  companyId?: string;
  status?: StatusFilter;
}) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: authz.error };
  }

  const status = params?.status ?? "all";
  const q = params?.q?.trim().toLowerCase();

  const users = await prisma.user.findMany({
    where: {
      isPlatformOperator: false,
      ...(status === "active"
        ? { active: true }
        : status === "inactive"
          ? { active: false }
          : {}),
      ...(params?.companyId
        ? { membership: { companyId: params.companyId } }
        : {}),
    },
    include: {
      membership: { include: { company: true } },
    },
    orderBy: { name: "asc" },
  });

  const filtered = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.membership?.company.name.toLowerCase().includes(q) ?? false),
      )
    : users;

  return {
    ok: true as const,
    users: filtered.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      active: u.active,
      mustChangePassword: u.mustChangePassword,
      companyId: u.membership?.companyId ?? null,
      companyName: u.membership?.company.name ?? null,
    })),
  };
}

export async function getClientUser(id: string) {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: authz.error };
  }

  const user = await prisma.user.findFirst({
    where: { id, isPlatformOperator: false },
    include: { membership: { include: { company: true } } },
  });
  if (!user) {
    return { ok: false as const, error: "notFound" as const };
  }

  return {
    ok: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
      companyId: user.membership?.companyId ?? null,
      companyName: user.membership?.company.name ?? null,
    },
  };
}

export async function listCompaniesForSelect() {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: authz.error };
  }

  const companies = await prisma.company.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return { ok: true as const, companies };
}

export async function getDashboardSummary() {
  const authz = await requirePlatformOperator();
  if (!authz.ok) {
    return { ok: false as const, error: authz.error };
  }

  const [
    companiesTotal,
    companiesActive,
    companiesInactive,
    clientUsersTotal,
    clientUsersActive,
    clientUsersInactive,
    companies,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { active: true } }),
    prisma.company.count({ where: { active: false } }),
    prisma.user.count({ where: { isPlatformOperator: false } }),
    prisma.user.count({ where: { isPlatformOperator: false, active: true } }),
    prisma.user.count({ where: { isPlatformOperator: false, active: false } }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true } } },
    }),
  ]);

  return {
    ok: true as const,
    summary: {
      companies: {
        total: companiesTotal,
        active: companiesActive,
        inactive: companiesInactive,
      },
      clientUsers: {
        total: clientUsersTotal,
        active: clientUsersActive,
        inactive: clientUsersInactive,
      },
      usersPerCompany: companies.map((c) => ({
        companyId: c.id,
        companyName: c.name,
        active: c.active,
        userCount: c._count.memberships,
      })),
    },
  };
}
