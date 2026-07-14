"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClientProductListItem } from "@/lib/client-products/queries";
import { setClientProductActive } from "@/lib/client-products/actions";
import { ClientProductForm } from "@/components/clients/ClientProductForm";
import { t } from "@/lib/i18n";

type Props = {
  clientId: string;
  items: ClientProductListItem[];
  products: { id: string; name: string }[];
  canCreate: boolean;
  canUpdate: boolean;
  canSetActive: boolean;
  showingInactive: boolean;
};

export function ClientProductList({
  clientId,
  items,
  products,
  canCreate,
  canUpdate,
  canSetActive,
  showingInactive,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  function onToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await setClientProductActive(id, !active);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        {t("clientProducts.title")}
      </h2>

      {canCreate && !showingInactive ? (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <ClientProductForm clientId={clientId} products={products} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-slate-600">
          {showingInactive
            ? t("clientProducts.emptyInactive")
            : t("clientProducts.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">
                  {t("clientProducts.col.product")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("clientProducts.col.identifier")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("clientProducts.col.serial")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("clientProducts.col.notes")}
                </th>
                {canUpdate || canSetActive ? (
                  <th className="px-4 py-3 font-medium">
                    {t("clientProducts.col.actions")}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.product.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.identifier}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.serialNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.notes ?? "—"}
                  </td>
                  {canUpdate || canSetActive ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-3">
                          {canUpdate ? (
                            <button
                              type="button"
                              className="text-sm text-slate-700 underline-offset-2 hover:underline"
                              onClick={() =>
                                setEditingId(
                                  editingId === item.id ? null : item.id,
                                )
                              }
                            >
                              {t("clientProducts.action.edit")}
                            </button>
                          ) : null}
                          {canSetActive ? (
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => onToggle(item.id, item.active)}
                              className="text-sm text-slate-700 underline-offset-2 hover:underline disabled:opacity-50"
                            >
                              {item.active
                                ? t("clientProducts.action.inactivate")
                                : t("clientProducts.action.reactivate")}
                            </button>
                          ) : null}
                        </div>
                        {editingId === item.id ? (
                          <ClientProductForm
                            clientId={clientId}
                            products={
                              products.some((p) => p.id === item.product.id)
                                ? products
                                : [
                                    ...products,
                                    {
                                      id: item.product.id,
                                      name: item.product.name,
                                    },
                                  ]
                            }
                            mode="edit"
                            linkId={item.id}
                            initial={{
                              productId: item.product.id,
                              identifier: item.identifier,
                              serialNumber: item.serialNumber,
                              notes: item.notes,
                            }}
                            onDone={() => setEditingId(null)}
                          />
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
