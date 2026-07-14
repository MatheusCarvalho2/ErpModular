"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createPermissionGroup,
  updatePermissionGroup,
} from "@/lib/permission-groups/actions";
import { businessPermissionKeys } from "@/lib/permissions/catalog";
import { PermissionMatrix } from "@/components/permission-groups/PermissionMatrix";
import { t } from "@/lib/i18n";

type Props =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      groupId: string;
      initialName: string;
      initialKeys: string[];
      nameEditable: boolean;
      matrixEditable: boolean;
    };

export function PermissionGroupForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(
    props.mode === "edit" ? props.initialName : "",
  );
  const [keys, setKeys] = useState<string[]>(
    props.mode === "edit" ? props.initialKeys : businessPermissionKeys(),
  );
  const [error, setError] = useState<string | null>(null);

  const nameEditable = props.mode === "create" || props.nameEditable;
  const matrixEditable = props.mode === "create" || props.matrixEditable;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fromDom = matrixEditable
      ? Array.from(
          form.querySelectorAll<HTMLInputElement>(
            "[data-permission]:checked",
          ),
        ).map((el) => el.getAttribute("data-permission")!)
      : keys;

    startTransition(async () => {
      if (props.mode === "create") {
        const result = await createPermissionGroup({
          name,
          permissionKeys: fromDom,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push("/app/grupos-permissao");
        router.refresh();
        return;
      }

      const result = await updatePermissionGroup({
        id: props.groupId,
        name: nameEditable ? name : undefined,
        permissionKeys: matrixEditable ? fromDom : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      <div className="space-y-1">
        <label htmlFor="group-name" className="text-sm font-medium text-slate-800">
          {t("permissionGroups.form.name")}
        </label>
        <input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!nameEditable || pending}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          required={nameEditable}
        />
      </div>

      {matrixEditable ? (
        <PermissionMatrix
          selected={keys}
          onChange={setKeys}
          disabled={pending}
        />
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {matrixEditable || nameEditable ? (
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {props.mode === "create"
              ? t("permissionGroups.form.submitCreate")
              : t("permissionGroups.form.submitEdit")}
          </button>
        ) : null}
        <Link
          href="/app/grupos-permissao"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
        >
          {t("permissionGroups.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
