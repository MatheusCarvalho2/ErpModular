import { auth, loadAuthzForUser } from "@/lib/auth";
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
};

export async function requireSession(): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: "unauthenticated" }
> {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId) {
    return { ok: false, error: "unauthenticated" };
  }

  // Authoritative authz from DB (Node runtime) so grant/group changes apply
  // on the next protected action without putting Prisma in the Edge JWT path.
  const live = await loadAuthzForUser(session.user.id);
  if (!live) {
    return { ok: false, error: "unauthenticated" };
  }

  return {
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      companyId: live.companyId,
      companyName: live.companyName,
      permissionGroupId: live.permissionGroupId,
      isAdmin: live.isAdmin,
      permissions: live.permissions,
    },
  };
}

export async function requireAdmin(): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; error: "unauthenticated" | "forbidden" }
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
  | { ok: false; error: "unauthenticated" | "forbidden" }
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
