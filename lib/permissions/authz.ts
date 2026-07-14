import { auth, loadAuthzForUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PermissionKey } from "@/lib/permissions/catalog";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  companyId: string;
  companyName: string;
  permissionGroupId: string;
  isAdmin: boolean;
  permissions: string[];
  mustChangePassword: boolean;
};

export async function requireSession(): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; error: "unauthenticated" | "mustChangePassword" }
> {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.sessionKind !== "erp" ||
    !session.user.companyId
  ) {
    return { ok: false, error: "unauthenticated" };
  }

  const live = await loadAuthzForUser(session.user.id);
  if (!live) {
    return { ok: false, error: "unauthenticated" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true, email: true, name: true },
  });
  if (!dbUser) {
    return { ok: false, error: "unauthenticated" };
  }

  if (dbUser.mustChangePassword) {
    return { ok: false, error: "mustChangePassword" };
  }

  return {
    ok: true,
    user: {
      id: session.user.id,
      email: dbUser.email,
      name: dbUser.name,
      companyId: live.companyId,
      companyName: live.companyName,
      permissionGroupId: live.permissionGroupId,
      isAdmin: live.isAdmin,
      permissions: live.permissions,
      mustChangePassword: false,
    },
  };
}

export async function requireAdmin(): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; error: "unauthenticated" | "forbidden" | "mustChangePassword" }
> {
  const session = await requireSession();
  if (!session.ok) {
    return session;
  }
  if (!session.user.isAdmin) {
    return { ok: false, error: "forbidden" };
  }
  return session;
}

export async function requirePermission(
  key: PermissionKey,
): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; error: "unauthenticated" | "forbidden" | "mustChangePassword" }
> {
  const session = await requireSession();
  if (!session.ok) {
    return session;
  }
  if (session.user.isAdmin || session.user.permissions.includes(key)) {
    return session;
  }
  return { ok: false, error: "forbidden" };
}
