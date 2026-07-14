import { CompanyForm } from "@/components/platform/CompanyForm";
import { t } from "@/lib/i18n";

export default function NovaEmpresaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("backoffice.companies.new")}</h1>
      <CompanyForm mode="create" />
    </div>
  );
}
