"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createService, updateService } from "@/lib/services/actions";
import { t } from "@/lib/i18n";
import {
  centsToPriceInput,
  splitDurationMinutes,
} from "@/lib/services/format";

type ServiceFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
  initial?: {
    name: string;
    description: string;
    productDescription: string | null;
    priceCents: number | null;
    durationMinutes: number | null;
  };
};

export function ServiceForm({ mode, serviceId, initial }: ServiceFormProps) {
  const router = useRouter();
  const duration = splitDurationMinutes(initial?.durationMinutes);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [productDescription, setProductDescription] = useState(
    initial?.productDescription ?? "",
  );
  const [priceRaw, setPriceRaw] = useState(centsToPriceInput(initial?.priceCents));
  const [hoursRaw, setHoursRaw] = useState(duration.hours);
  const [minutesRaw, setMinutesRaw] = useState(duration.minutes);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const input = {
      name,
      description,
      productDescription,
      priceRaw,
      hoursRaw,
      minutesRaw,
    };

    const result =
      mode === "create"
        ? await createService(input)
        : await updateService(serviceId!, input);

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/app/servicos");
    router.refresh();
  }

  const fieldClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          {t("services.form.name")} *
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="price" className="block text-sm font-medium text-slate-700">
          {t("services.form.price")}
        </label>
        <input
          id="price"
          name="price"
          value={priceRaw}
          onChange={(e) => setPriceRaw(e.target.value)}
          className={fieldClass}
          placeholder="0,00"
          inputMode="decimal"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="hours" className="block text-sm font-medium text-slate-700">
            {t("services.form.hours")}
          </label>
          <input
            id="hours"
            name="hours"
            type="number"
            min={0}
            value={hoursRaw}
            onChange={(e) => setHoursRaw(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="minutes"
            className="block text-sm font-medium text-slate-700"
          >
            {t("services.form.minutes")}
          </label>
          <input
            id="minutes"
            name="minutes"
            type="number"
            min={0}
            max={59}
            value={minutesRaw}
            onChange={(e) => setMinutesRaw(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700"
        >
          {t("services.form.description")} *
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldClass}
          rows={4}
          required
          maxLength={2000}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="productDescription"
          className="block text-sm font-medium text-slate-700"
        >
          {t("services.form.productDescription")}
        </label>
        <textarea
          id="productDescription"
          name="productDescription"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className={fieldClass}
          rows={3}
          maxLength={2000}
        />
      </div>

      {error ? (
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
              ? t("services.form.submitCreate")
              : t("services.form.submitEdit")}
        </button>
        <Link href="/app/servicos" className="text-sm text-slate-600 hover:underline">
          {t("services.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
