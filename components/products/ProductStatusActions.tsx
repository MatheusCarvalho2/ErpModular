"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProductActive } from "@/lib/products/actions";
import { t } from "@/lib/i18n";

type Props = {
  productId: string;
  active: boolean;
};

export function ProductStatusActions({ productId, active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      const result = await setProductActive(productId, !active);
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
        ? t("products.action.inactivate")
        : t("products.action.reactivate")}
    </button>
  );
}
