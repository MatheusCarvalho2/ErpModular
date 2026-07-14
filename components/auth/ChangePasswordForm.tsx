"use client";

import { type FormEvent, useState } from "react";
import { changeOwnPassword } from "@/lib/platform/actions";
import { t } from "@/lib/i18n";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newPassword || !confirmation) {
      setError(t("auth.changePassword.error.required"));
      return;
    }
    if (newPassword !== confirmation) {
      setError(t("auth.changePassword.error.mismatch"));
      return;
    }

    setPending(true);
    const result = await changeOwnPassword({ currentPassword, newPassword });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSuccess(t("auth.changePassword.success"));
    // Hard navigation so app layout re-reads mustChangePassword from DB
    window.location.assign("/app");
  }

  const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2";
  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{t("auth.changePassword.title")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("auth.changePassword.subtitle")}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">{t("auth.changePassword.current")}</label>
          <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={fieldClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">{t("auth.changePassword.next")}</label>
          <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={fieldClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmation" className="block text-sm font-medium text-slate-700">{t("auth.changePassword.confirm")}</label>
          <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={fieldClass} />
        </div>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
        {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">{success}</p> : null}
        <button type="submit" disabled={pending} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
          {pending ? t("auth.changePassword.pending") : t("auth.changePassword.submit")}
        </button>
      </form>
    </div>
  );
}
