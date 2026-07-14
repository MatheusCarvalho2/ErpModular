import Link from "next/link";
import type { ProductListItem } from "@/lib/products/queries";
import { t } from "@/lib/i18n";
import { ProductStatusActions } from "@/components/products/ProductStatusActions";

type Props = {
  products: ProductListItem[];
  canCreate: boolean;
  canUpdate: boolean;
  canSetActive: boolean;
  showingInactive: boolean;
};

export function ProductList({
  products,
  canCreate,
  canUpdate,
  canSetActive,
  showingInactive,
}: Props) {
  const showActions = canUpdate || canSetActive;

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">
          {showingInactive ? t("products.emptyInactive") : t("products.empty")}
        </p>
        {canCreate && !showingInactive ? (
          <Link
            href="/app/produtos/novo"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("products.createCta")}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">{t("products.col.name")}</th>
            <th className="px-4 py-3 font-medium">
              {t("products.col.description")}
            </th>
            {showActions ? (
              <th className="px-4 py-3 font-medium">
                {t("products.col.actions")}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">
                {product.name}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {product.description ?? "—"}
              </td>
              {showActions ? (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    {canUpdate ? (
                      <Link
                        href={`/app/produtos/${product.id}/editar`}
                        className="text-sm text-slate-700 underline-offset-2 hover:underline"
                      >
                        {t("products.action.edit")}
                      </Link>
                    ) : null}
                    {canSetActive ? (
                      <ProductStatusActions
                        productId={product.id}
                        active={product.active}
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
  );
}
