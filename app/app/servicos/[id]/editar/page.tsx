import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions/authz";
import { getServiceForCompany } from "@/lib/services/queries";
import { ServiceForm } from "@/components/services/ServiceForm";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarServicoPage({ params }: Props) {
  const authz = await requirePermission("services:update");
  if (!authz.ok) {
    if (authz.error === "unauthenticated") {
      redirect("/login");
    }
    redirect("/app/servicos");
  }

  const { id } = await params;
  const service = await getServiceForCompany(id, authz.user.companyId);
  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("services.edit")}
      </h1>
      <ServiceForm
        mode="edit"
        serviceId={service.id}
        initial={{
          name: service.name,
          description: service.description,
          productDescription: service.productDescription,
          priceCents: service.priceCents,
          durationMinutes: service.durationMinutes,
        }}
      />
    </div>
  );
}
