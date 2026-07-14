import { notFound, redirect } from "next/navigation";
import { UserForm } from "@/components/platform/UserForm";
import { t } from "@/lib/i18n";
import { getClientUser } from "@/lib/platform/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarUsuarioPage({ params }: Props) {
  const { id } = await params;
  const result = await getClientUser(id);
  if (!result.ok) {
    if (result.error === "notFound") {
      notFound();
    }
    redirect("/backoffice/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{t("backoffice.users.edit")}</h1>
      <UserForm
        mode="edit"
        userId={result.user.id}
        initial={{
          name: result.user.name,
          email: result.user.email,
          companyName: result.user.companyName,
        }}
      />
    </div>
  );
}
