import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/authz";
import { getProductForCompany } from "@/lib/products/queries";
import { ProductForm } from "@/components/products/ProductForm";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarProdutoPage({ params }: Props) {
  const authz = await requirePermission("products:update");
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app/produtos");
  }

  const { id } = await params;
  const product = await getProductForCompany(id, authz.user.companyId);
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("products.edit")}
      </h1>
      <ProductForm
        mode="edit"
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description,
        }}
      />
    </div>
  );
}
