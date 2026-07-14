import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { JWT } from "next-auth/jwt";
import { SYSTEM_KEY_ADMIN } from "@/lib/permissions/catalog";
import { ensureCompanyPermissionPresets } from "@/lib/permission-groups/presets";

class OrganizationalAccessError extends CredentialsSignin {
  code = "ORGANIZATIONAL_ACCESS";
}

export type SessionKind = "erp" | "platform";

declare module "next-auth" {
  interface User {
    sessionKind?: SessionKind;
    companyId?: string;
    companyName?: string;
    permissionGroupId?: string;
    isAdmin?: boolean;
    permissions?: string[];
    mustChangePassword?: boolean;
  }

  interface Session {
    sessionKind: SessionKind;
    user: {
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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sessionKind?: SessionKind;
    companyId?: string;
    companyName?: string;
    permissionGroupId?: string;
    isAdmin?: boolean;
    permissions?: string[];
    mustChangePassword?: boolean;
  }
}

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export async function loadAuthzForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.active || user.isPlatformOperator) {
    return null;
  }

  const membership = await prisma.membership.findUnique({
    where: { userId },
    include: {
      company: true,
      permissionGroup: { include: { grants: true } },
    },
  });
  if (!membership || !membership.company.active) {
    return null;
  }

  await ensureCompanyPermissionPresets(membership.companyId);

  const group = await prisma.permissionGroup.findUnique({
    where: { id: membership.permissionGroupId },
    include: { grants: true },
  });
  if (!group) {
    return null;
  }

  const isAdmin = group.systemKey === SYSTEM_KEY_ADMIN;
  return {
    companyId: membership.companyId,
    companyName: membership.company.name,
    permissionGroupId: group.id,
    isAdmin,
    permissions: isAdmin ? [] : group.grants.map((g) => g.permissionKey),
    mustChangePassword: user.mustChangePassword,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.active || user.isPlatformOperator) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        const authz = await loadAuthzForUser(user.id);
        if (!authz) {
          throw new OrganizationalAccessError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          sessionKind: "erp" as const,
          ...authz,
        };
      },
    }),
    Credentials({
      id: "platform",
      name: "platform",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.active || !user.isPlatformOperator) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          sessionKind: "platform" as const,
          companyId: "",
          companyName: "",
          permissionGroupId: "",
          isAdmin: false,
          permissions: [],
          mustChangePassword: false,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SEVEN_DAYS,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Do NOT hit Prisma here — jwt may run on Edge (middleware).
      if (user) {
        token.id = user.id;
        token.sessionKind = user.sessionKind ?? "erp";
        token.companyId = user.companyId ?? "";
        token.companyName = user.companyName ?? "";
        token.permissionGroupId = user.permissionGroupId ?? "";
        token.isAdmin = user.isAdmin ?? false;
        token.permissions = user.permissions ?? [];
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: import("next-auth").Session;
      token: JWT;
    }) {
      session.sessionKind = token.sessionKind ?? "erp";
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.companyId = token.companyId ?? "";
        session.user.companyName = token.companyName ?? "";
        session.user.permissionGroupId = token.permissionGroupId ?? "";
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.permissions = token.permissions ?? [];
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  trustHost: true,
});
