"use client";

import { PERMISSION_MATRIX } from "@/lib/permissions/catalog";
import { t } from "@/lib/i18n";
import type { MessageKey } from "@/messages/pt-BR";

type Props = {
  selected: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
};

export function PermissionMatrix({ selected, onChange, disabled }: Props) {
  const set = new Set(selected);

  function toggle(key: string) {
    if (disabled) return;
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  }

  return (
    <div className="space-y-4" data-testid="permission-matrix">
      <p className="text-sm font-medium text-slate-800">
        {t("permissionGroups.form.permissions")}
      </p>
      {PERMISSION_MATRIX.map((resource) => (
        <fieldset
          key={resource.resource}
          className="rounded-md border border-slate-200 p-4"
        >
          <legend className="px-1 text-sm font-semibold text-slate-900">
            {t(resource.labelKey as MessageKey)}
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {resource.actions.map((action) => (
              <label
                key={action.key}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={set.has(action.key)}
                  disabled={disabled}
                  onChange={() => toggle(action.key)}
                  data-permission={action.key}
                />
                {t(action.labelKey as MessageKey)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
