import { redirect } from "next/navigation";
import { UserForm } from "@/components/platform/UserForm";
import { t } from "@/lib/i18n";
import { listCompaniesForSelect } from "@/lib/platform/queries";

export default async function NovoUsuarioPage() {
  const result = await listCompaniesForSelect();
  if (!result.ok) {
    redirect("/backoffice/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("backoffice.users.new")}</h1>
      <UserForm mode="create" companies={result.companies} />
    </div>
  );
}
