import { redirect } from "next/navigation";
import { DashboardSummary } from "@/components/platform/DashboardSummary";
import { t } from "@/lib/i18n";
import { getDashboardSummary } from "@/lib/platform/queries";

export default async function BackofficeDashboardPage() {
  const result = await getDashboardSummary();
  if (!result.ok) {
    redirect("/backoffice/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("backoffice.dashboard.title")}
      </h1>
      <DashboardSummary summary={result.summary} />
    </div>
  );
}
