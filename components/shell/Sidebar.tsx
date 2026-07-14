import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <nav className="flex flex-col gap-1 p-3" aria-label="Navegação principal">
        <Link
          href="/app"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Início
        </Link>
      </nav>
    </aside>
  );
}
