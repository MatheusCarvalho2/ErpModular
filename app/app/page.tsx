import { auth } from "@/lib/auth";

export default async function AppHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "usuário";

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-semibold text-slate-900">
        Bem-vindo, {firstName}
      </h1>
      <p className="text-slate-600">
        Este é o início do ErpModular. Ainda não há módulos de negócio
        disponíveis — use a barra lateral para navegar enquanto o sistema
        evolui.
      </p>
      {session?.user?.companyName ? (
        <p className="text-sm text-slate-500">
          Empresa: <span className="font-medium text-slate-700">{session.user.companyName}</span>
        </p>
      ) : null}
    </div>
  );
}
