import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { JWT } from "next-auth/jwt";

class OrganizationalAccessError extends CredentialsSignin {
  code = "ORGANIZATIONAL_ACCESS";
}

declare module "next-auth" {
  interface User {
    companyId?: string;
    companyName?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      companyId: string;
      companyName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    companyId?: string;
    companyName?: string;
  }
}

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
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
          include: {
            membership: {
              include: { company: true },
            },
          },
        });

        if (!user) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        if (!user.membership) {
          throw new OrganizationalAccessError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.membership.companyId,
          companyName: user.membership.company.name,
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
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }: { session: import("next-auth").Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.companyId = token.companyId ?? "";
        session.user.companyName = token.companyName ?? "";
      }
      return session;
    },
  },
  trustHost: true,
});
