import Link from "next/link";
import { auth } from "@/lib/auth";
import { t } from "@/lib/i18n";

export async function Sidebar() {
  const session = await auth();
  const isAdmin = Boolean(session?.user?.isAdmin);
  const permissions = new Set(session?.user?.permissions ?? []);
  const can = (key: string) => isAdmin || permissions.has(key);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <nav className="flex flex-col gap-1 p-3" aria-label="Navegação principal">
        <Link
          href="/app"
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          {t("nav.home")}
        </Link>
        {can("services:list") ? (
          <Link
            href="/app/servicos"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {t("nav.services")}
          </Link>
        ) : null}
        {can("products:list") ? (
          <Link
            href="/app/produtos"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {t("nav.products")}
          </Link>
        ) : null}
        {can("clients:list") ? (
          <Link
            href="/app/clientes"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {t("nav.clients")}
          </Link>
        ) : null}
        {isAdmin ? (
          <Link
            href="/app/grupos-permissao"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {t("nav.permissionGroups")}
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}
