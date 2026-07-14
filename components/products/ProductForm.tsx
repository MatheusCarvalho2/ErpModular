"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct, updateProduct } from "@/lib/products/actions";
import { t } from "@/lib/i18n";

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initial?: {
    name: string;
    description: string | null;
  };
};

export function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const input = { name, description };
    const result =
      mode === "create"
        ? await createProduct(input)
        : await updateProduct(productId!, input);

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/app/produtos");
    router.refresh();
  }

  const fieldClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          {t("products.form.name")} *
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
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700"
        >
          {t("products.form.description")}
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
              ? t("products.form.submitCreate")
              : t("products.form.submitEdit")}
        </button>
        <Link href="/app/produtos" className="text-sm text-slate-600 hover:underline">
          {t("products.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
