import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/authz";
import { getClientForCompany } from "@/lib/clients/queries";
import { ClientForm } from "@/components/clients/ClientForm";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarClientePage({ params }: Props) {
  const authz = await requirePermission("clients:update");
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app/clientes");
  }

  const { id } = await params;
  const client = await getClientForCompany(id, authz.user.companyId);
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("clients.edit")}
      </h1>
      <ClientForm
        mode="edit"
        clientId={client.id}
        initial={{ name: client.name, phone: client.phone }}
      />
    </div>
  );
}
