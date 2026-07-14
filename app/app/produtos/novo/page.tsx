import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/authz";
import { ProductForm } from "@/components/products/ProductForm";
import { t } from "@/lib/i18n";

export default async function NovoProdutoPage() {
  const authz = await requirePermission("products:create");
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app/produtos");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("products.new")}</h1>
      <ProductForm mode="create" />
    </div>
  );
}
