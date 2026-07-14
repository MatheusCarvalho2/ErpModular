import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PlatformOperator = {
  id: string;
  email: string;
  name: string;
};

export async function requirePlatformOperator(): Promise<
  | { ok: true; user: PlatformOperator }
  | { ok: false; error: "unauthenticated" | "forbidden" }
> {
  const session = await auth();
  if (!session?.user?.id || session.sessionKind !== "platform") {
    return { ok: false, error: "unauthenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.active || !user.isPlatformOperator) {
    return { ok: false, error: "forbidden" };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
