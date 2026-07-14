"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setClientActive } from "@/lib/clients/actions";
import { t } from "@/lib/i18n";

type Props = {
  clientId: string;
  active: boolean;
};

export function ClientStatusActions({ clientId, active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      const result = await setClientActive(clientId, !active);
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
        ? t("clients.action.inactivate")
        : t("clients.action.reactivate")}
    </button>
  );
}
