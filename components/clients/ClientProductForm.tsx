"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createClientProduct,
  updateClientProduct,
} from "@/lib/client-products/actions";
import { t } from "@/lib/i18n";

type ProductOption = { id: string; name: string };

type Props = {
  clientId: string;
  products: ProductOption[];
  mode?: "create" | "edit";
  linkId?: string;
  initial?: {
    productId: string;
    identifier: string;
    serialNumber: string | null;
    notes: string | null;
  };
  onDone?: () => void;
};

export function ClientProductForm({
  clientId,
  products,
  mode = "create",
  linkId,
  initial,
  onDone,
}: Props) {
  const router = useRouter();
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [identifier, setIdentifier] = useState(initial?.identifier ?? "");
  const [serialNumber, setSerialNumber] = useState(initial?.serialNumber ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const input = {
      clientId,
      productId,
      identifier,
      serialNumber,
      notes,
    };

    const result =
      mode === "create"
        ? await createClientProduct(input)
        : await updateClientProduct(linkId!, input);

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    setPending(false);
    if (mode === "create") {
      setProductId("");
      setIdentifier("");
      setSerialNumber("");
      setNotes("");
    }
    onDone?.();
    router.refresh();
  }

  const fieldClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

  if (products.length === 0 && mode === "create") {
    return (
      <p className="text-sm text-slate-600">
        {t("products.empty")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="productId"
          className="block text-sm font-medium text-slate-700"
        >
          {t("clientProducts.form.product")} *
        </label>
        <select
          id="productId"
          name="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={fieldClass}
          required
        >
          <option value="">—</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-slate-700"
        >
          {t("clientProducts.form.identifier")} *
        </label>
        <input
          id="identifier"
          name="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={fieldClass}
          required
          maxLength={60}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="serialNumber"
          className="block text-sm font-medium text-slate-700"
        >
          {t("clientProducts.form.serialNumber")}
        </label>
        <input
          id="serialNumber"
          name="serialNumber"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className={fieldClass}
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700"
        >
          {t("clientProducts.form.notes")}
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={fieldClass}
          rows={2}
          maxLength={2000}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending
          ? "…"
          : mode === "create"
            ? t("clientProducts.form.submitCreate")
            : t("clientProducts.form.submitEdit")}
      </button>
    </form>
  );
}
