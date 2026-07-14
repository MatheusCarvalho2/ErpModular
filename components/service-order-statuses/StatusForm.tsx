"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createServiceOrderStatus } from "@/lib/service-order-statuses/actions";
import { t } from "@/lib/i18n";

export function StatusForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("60");
  const [role, setRole] = useState<"OPERATIONAL" | "COMPLETED" | "CANCELLED">(
    "OPERATIONAL",
  );
  const [isDefaultInitial, setDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await createServiceOrderStatus({
      name,
      sortOrder: Number(sortOrder),
      role,
      isDefaultInitial,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setSortOrder("60");
    setDefault(false);
    setError(null);
    router.refresh();
  }

  const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";
  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border bg-white p-4">
      <h2 className="font-medium">{t("orderStatuses.new")}</h2>
      <label className="block text-sm">
        {t("orderStatuses.form.name")}
        <input
          aria-label={t("orderStatuses.form.name")}
          className={field}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={80}
        />
      </label>
      <label className="block text-sm">
        {t("orderStatuses.form.order")}
        <input
          aria-label={t("orderStatuses.form.order")}
          className={field}
          type="number"
          min={0}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        {t("orderStatuses.form.role")}
        <select
          aria-label={t("orderStatuses.form.role")}
          className={field}
          value={role}
          onChange={(event) => setRole(event.target.value as typeof role)}
        >
          {(["OPERATIONAL", "COMPLETED", "CANCELLED"] as const).map((item) => (
            <option key={item} value={item}>
              {t(`orderStatuses.role.${item}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDefaultInitial}
          onChange={(event) => setDefault(event.target.checked)}
        />
        {t("orderStatuses.form.default")}
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
      >
        {t("orderStatuses.form.submitCreate")}
      </button>
    </form>
  );
}
