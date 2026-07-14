"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, updateClient } from "@/lib/clients/actions";
import { t } from "@/lib/i18n";

type ClientFormProps = {
  mode: "create" | "edit";
  clientId?: string;
  initial?: {
    name: string;
    phone: string;
  };
};

type ExistingClient = { id: string; name: string; phone: string };

export function ClientForm({ mode, clientId, initial }: ClientFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [phoneConflict, setPhoneConflict] = useState<ExistingClient | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  async function submit(linkToPersonId?: string) {
    setError(null);
    setPending(true);

    const input = { name, phone, linkToPersonId };
    const result =
      mode === "create"
        ? await createClient(input)
        : await updateClient(clientId!, input);

    if (!result.ok) {
      if ("code" in result && result.code === "PHONE_IN_USE") {
        setPhoneConflict(result.existingClient);
        setError(result.error);
      } else {
        setPhoneConflict(null);
        setError(result.error);
      }
      setPending(false);
      return;
    }

    if (mode === "create" && result.id) {
      router.push(`/app/clientes/${result.id}`);
    } else {
      router.push(clientId ? `/app/clientes/${clientId}` : "/app/clientes");
    }
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(undefined);
  }

  const fieldClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          {t("clients.form.name")} *
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPhoneConflict(null);
          }}
          className={fieldClass}
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-slate-700"
        >
          {t("clients.form.phone")} *
        </label>
        <input
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneConflict(null);
          }}
          className={fieldClass}
          required
          maxLength={40}
        />
      </div>

      {phoneConflict ? (
        <div
          className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="alert"
        >
          <p>
            {t("clients.phoneConflict", {
              name: phoneConflict.name,
              phone: phoneConflict.phone,
            })}
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(phoneConflict.id)}
            className="rounded-md bg-amber-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {t("clients.form.linkPeople")}
          </button>
        </div>
      ) : null}

      {error && !phoneConflict ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending
            ? "…"
            : mode === "create"
              ? t("clients.form.submitCreate")
              : t("clients.form.submitEdit")}
        </button>
        <Link href="/app/clientes" className="text-sm text-slate-600 hover:underline">
          {t("clients.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
