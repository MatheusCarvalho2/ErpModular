"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCompany, updateCompany } from "@/lib/platform/actions";
import { t } from "@/lib/i18n";

type CompanyFormProps = {
  mode: "create" | "edit";
  companyId?: string;
  initialName?: string;
};

export function CompanyForm({ mode, companyId, initialName = "" }: CompanyFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = mode === "create"
      ? await createCompany({ name })
      : await updateCompany({ id: companyId!, name });

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push(mode === "create" ? "/backoffice/empresas" : `/backoffice/empresas/${companyId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          {t("backoffice.companies.form.name")}
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2"
          required
          maxLength={120}
        />
      </div>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
          {mode === "create" ? t("backoffice.companies.form.submitCreate") : t("backoffice.companies.form.submitEdit")}
        </button>
        <Link href="/backoffice/empresas" className="text-sm text-slate-600 hover:underline">
          {t("backoffice.companies.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
