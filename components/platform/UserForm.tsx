"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser, resetUserPassword, updateUser } from "@/lib/platform/actions";
import { t } from "@/lib/i18n";

type CompanyOption = { id: string; name: string };
type UserFormProps = {
  mode: "create" | "edit";
  userId?: string;
  companies?: CompanyOption[];
  initial?: { name: string; email: string; companyName?: string | null };
};

export function UserForm({ mode, userId, companies = [], initial }: UserFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    const result = mode === "create"
      ? await createUser({ name, email, password, companyId })
      : await updateUser({ id: userId!, name, email });

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push("/backoffice/usuarios");
    router.refresh();
  }

  async function onResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    const result = await resetUserPassword({ id: userId!, temporaryPassword });
    if (!result.ok) {
      setError(result.error);
    } else {
      setTemporaryPassword("");
      setSuccess(t("backoffice.users.success.passwordReset"));
    }
    setPending(false);
  }

  const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2";

  return (
    <div className="max-w-xl space-y-8">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t("backoffice.users.form.name")}</label>
          <input id="name" name="name" value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">{t("backoffice.users.form.email")}</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} required />
        </div>
        {mode === "create" ? (
          <>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">{t("backoffice.users.form.password")}</label>
              <input id="password" name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="companyId" className="block text-sm font-medium text-slate-700">{t("backoffice.users.form.company")}</label>
              <select id="companyId" name="companyId" value={companyId} onChange={(event) => setCompanyId(event.target.value)} className={fieldClass} required>
                <option value="" />
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </div>
          </>
        ) : initial?.companyName ? (
          <p className="text-sm text-slate-600">{t("backoffice.users.form.company")}: {initial.companyName}</p>
        ) : null}
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {mode === "create" ? t("backoffice.users.form.submitCreate") : t("backoffice.users.form.submitEdit")}
          </button>
          <Link href="/backoffice/usuarios" className="text-sm text-slate-600 hover:underline">{t("backoffice.users.form.cancel")}</Link>
        </div>
      </form>

      {mode === "edit" ? (
        <form onSubmit={onResetPassword} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="temporaryPassword" className="block text-sm font-medium text-slate-700">{t("backoffice.users.form.tempPassword")}</label>
            <input id="temporaryPassword" name="temporaryPassword" type="password" autoComplete="new-password" value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} className={fieldClass} required />
          </div>
          {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">{success}</p> : null}
          <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {t("backoffice.users.form.submitReset")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
