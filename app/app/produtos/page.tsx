import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions/authz";
import { listProductsForCompany } from "@/lib/products/queries";
import { ProductList } from "@/components/products/ProductList";
import { t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ProdutosPage({ searchParams }: Props) {
  const session = await requireSession();
  if (!session.ok) {
    redirect("/login");
  }

  const params = await searchParams;
  const perms = session.user.isAdmin
    ? null
    : new Set(session.user.permissions);
  const can = (key: string) =>
    session.user.isAdmin || (perms?.has(key) ?? false);

  if (!can("products:list")) {
    redirect("/app");
  }

  const canCreate = can("products:create");
  const canUpdate = can("products:update");
  const canSetActive = can("products:setActive");
  const showingInactive = canSetActive && params.status === "inactive";
  const products = await listProductsForCompany(session.user.companyId, {
    active: !showingInactive,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("products.title")}
        </h1>
        {canCreate ? (
          <Link
            href="/app/produtos/novo"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("products.new")}
          </Link>
        ) : null}
      </div>

      {canSetActive ? (
        <div className="flex gap-3 text-sm">
          <Link
            href="/app/produtos"
            className={
              !showingInactive
                ? "font-semibold text-slate-900"
                : "text-slate-600 hover:underline"
            }
          >
            {t("products.filter.active")}
          </Link>
          <Link
            href="/app/produtos?status=inactive"
            className={
              showingInactive
                ? "font-semibold text-slate-900"
                : "text-slate-600 hover:underline"
            }
          >
            {t("products.filter.inactive")}
          </Link>
        </div>
      ) : null}

      <ProductList
        products={products}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canSetActive={canSetActive}
        showingInactive={showingInactive}
      />
    </div>
  );
}
