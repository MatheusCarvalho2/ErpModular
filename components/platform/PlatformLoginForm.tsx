"use client";

import { type FormEvent, useState, useSyncExternalStore } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function PlatformLoginForm() {
  const router = useRouter();
  const ready = useIsClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t("backoffice.login.error.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t("backoffice.login.error.invalidEmail"));
      return;
    }

    setPending(true);
    try {
      const result = await signIn("platform", {
        email: trimmedEmail,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(t("backoffice.login.error.invalid"));
        setPending(false);
        return;
      }

      router.push("/backoffice");
      router.refresh();
    } catch {
      setError(t("backoffice.login.error.generic"));
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {t("backoffice.brand")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {t("backoffice.login.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("backoffice.login.subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate data-ready={ready ? "true" : "false"}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t("backoffice.login.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t("backoffice.login.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2"
          />
        </div>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? t("backoffice.login.pending") : t("backoffice.login.submit")}
        </button>
      </form>
    </div>
  );
}
