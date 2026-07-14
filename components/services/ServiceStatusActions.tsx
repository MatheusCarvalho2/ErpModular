"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setServiceActive } from "@/lib/services/actions";
import { t } from "@/lib/i18n";

type Props = {
  serviceId: string;
  active: boolean;
};

export function ServiceStatusActions({ serviceId, active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      const result = await setServiceActive(serviceId, !active);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className="text-sm text-slate-700 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {active
        ? t("services.action.inactivate")
        : t("services.action.reactivate")}
    </button>
  );
}
