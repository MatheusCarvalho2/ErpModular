import { auth } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default async function AppHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "usuário";

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("home.welcome", { name: firstName })}
      </h1>
      <p className="text-slate-600">{t("home.intro")}</p>
      {session?.user?.companyName ? (
        <p className="text-sm text-slate-500">
          {t("home.company")}{" "}
          <span className="font-medium text-slate-700">
            {session.user.companyName}
          </span>
        </p>
      ) : null}
    </div>
  );
}
