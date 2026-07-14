"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { t } from "@/lib/i18n";

type PlatformShellProps = {
  userName: string;
  children: React.ReactNode;
};

export function PlatformShell({ userName, children }: PlatformShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/backoffice" className="font-semibold">
            {t("backoffice.brand")}
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/backoffice" className="text-slate-200 hover:text-white">
              {t("backoffice.nav.dashboard")}
            </Link>
            <Link href="/backoffice/empresas" className="text-slate-200 hover:text-white">
              {t("backoffice.nav.companies")}
            </Link>
            <Link href="/backoffice/usuarios" className="text-slate-200 hover:text-white">
              {t("backoffice.nav.users")}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{userName}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/backoffice/login" })}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {t("backoffice.nav.logout")}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-6">{children}</main>
    </div>
  );
}
