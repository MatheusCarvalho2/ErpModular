import { notFound, redirect } from "next/navigation";
import { CompanyForm } from "@/components/platform/CompanyForm";
import { t } from "@/lib/i18n";
import { getCompany } from "@/lib/platform/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarEmpresaPage({ params }: Props) {
  const { id } = await params;
  const result = await getCompany(id);
  if (!result.ok) {
    if (result.error === "notFound") {
      notFound();
    }
    redirect("/backoffice/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("backoffice.companies.edit")}</h1>
      <CompanyForm mode="edit" companyId={result.company.id} initialName={result.company.name} />
    </div>
  );
}
