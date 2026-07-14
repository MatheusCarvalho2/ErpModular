"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  setServiceOrderStatusActive,
  updateServiceOrderStatus,
} from "@/lib/service-order-statuses/actions";
import { t } from "@/lib/i18n";

type StatusRow = {
  id: string;
  name: string;
  sortOrder: number;
  role: "OPERATIONAL" | "COMPLETED" | "CANCELLED";
  isDefaultInitial: boolean;
  active: boolean;
};

type Props = {
  statuses: StatusRow[];
  canUpdate: boolean;
  canSetActive: boolean;
};

export function StatusList({ statuses, canUpdate, canSetActive }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [role, setRole] = useState<StatusRow["role"]>("OPERATIONAL");
  const [isDefaultInitial, setDefault] = useState(false);
  const [pending, setPending] = useState(false);

  if (!statuses.length) return <p>{t("orderStatuses.empty")}</p>;

  function startEdit(status: StatusRow) {
    setEditingId(status.id);
    setName(status.name);
    setSortOrder(String(status.sortOrder));
    setRole(status.role);
    setDefault(status.isDefaultInitial);
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setPending(true);
    const result = await updateServiceOrderStatus(editingId, {
      name,
      sortOrder: Number(sortOrder),
      role,
      isDefaultInitial,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function toggleActive(status: StatusRow) {
    setPending(true);
    const result = await setServiceOrderStatusActive(status.id, !status.active);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const field = "rounded-md border border-slate-300 px-2 py-1 text-sm";

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">{t("orderStatuses.col.name")}</th>
              <th className="px-4 py-3">{t("orderStatuses.col.role")}</th>
              <th className="px-4 py-3">{t("orderStatuses.col.order")}</th>
              <th className="px-4 py-3">{t("orderStatuses.col.default")}</th>
              <th className="px-4 py-3">{t("orderStatuses.col.active")}</th>
              {canUpdate || canSetActive ? (
                <th className="px-4 py-3">{t("orderStatuses.col.actions")}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.id} className="border-t">
                {editingId === status.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        aria-label={t("orderStatuses.form.name")}
                        className={field}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={t("orderStatuses.form.role")}
                        className={field}
                        value={role}
                        onChange={(e) =>
                          setRole(e.target.value as StatusRow["role"])
                        }
                      >
                        {(
                          ["OPERATIONAL", "COMPLETED", "CANCELLED"] as const
                        ).map((item) => (
                          <option key={item} value={item}>
                            {t(`orderStatuses.role.${item}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        aria-label={t("orderStatuses.form.order")}
                        className={field}
                        type="number"
                        min={0}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isDefaultInitial}
                          onChange={(e) => setDefault(e.target.checked)}
                        />
                        {t("orderStatuses.form.default")}
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      {status.active ? "✓" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={pending}
                        className="rounded-md bg-slate-900 px-3 py-1 text-white"
                        onClick={saveEdit}
                      >
                        {t("orderStatuses.form.submitEdit")}
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{status.name}</td>
                    <td className="px-4 py-3">
                      {t(`orderStatuses.role.${status.role}`)}
                    </td>
                    <td className="px-4 py-3">{status.sortOrder}</td>
                    <td className="px-4 py-3">
                      {status.isDefaultInitial ? "✓" : ""}
                    </td>
                    <td className="px-4 py-3">{status.active ? "✓" : ""}</td>
                    {canUpdate || canSetActive ? (
                      <td className="space-x-2 px-4 py-3">
                        {canUpdate ? (
                          <button
                            type="button"
                            className="underline"
                            onClick={() => startEdit(status)}
                          >
                            {t("orderStatuses.action.edit")}
                          </button>
                        ) : null}
                        {canSetActive ? (
                          <button
                            type="button"
                            disabled={pending}
                            className="underline"
                            onClick={() => toggleActive(status)}
                          >
                            {status.active
                              ? t("orderStatuses.action.inactivate")
                              : t("orderStatuses.action.reactivate")}
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
