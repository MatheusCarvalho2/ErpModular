import type { ReactNode } from "react";

type LoginSplitLayoutProps = {
  children: ReactNode;
};

export function LoginSplitLayout({ children }: LoginSplitLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <section className="flex w-full flex-1 items-center justify-center bg-[var(--login-form-bg)] px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </section>

      <aside
        className="relative hidden w-1/2 overflow-hidden lg:block"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/login-hero.svg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-slate-950/70" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
            ErpModular
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight">
            Gestão integrada para o dia a dia da sua empresa
          </h2>
        </div>
      </aside>
    </div>
  );
}
