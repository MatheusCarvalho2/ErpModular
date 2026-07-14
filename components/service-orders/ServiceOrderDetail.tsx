"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  correctServiceOrderLinks,
  updateServiceOrder,
} from "@/lib/service-orders/actions";
import { t } from "@/lib/i18n";

type Props = {
  order: {
    id: string;
    priceCents: number;
    workDescription: string | null;
    statusId: string;
    serviceId: string;
    clientId: string;
    clientProductId: string;
    service: { name: string };
    client: { name: string };
    clientProduct: { identifier: string; product: { name: string } };
  };
  statuses: { id: string; name: string }[];
  services: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  clientProducts: {
    id: string;
    clientId: string;
    identifier: string;
    product: { name: string };
  }[];
  canEdit: boolean;
  canCorrectLinks: boolean;
};

export function ServiceOrderDetail({
  order,
  statuses,
  services,
  clients,
  clientProducts,
  canEdit,
  canCorrectLinks,
}: Props) {
  const router = useRouter();
  const [priceRaw, setPriceRaw] = useState(
    (order.priceCents / 100).toFixed(2).replace(".", ","),
  );
  const [description, setDescription] = useState(order.workDescription ?? "");
  const [statusId, setStatusId] = useState(order.statusId);
  const [serviceId, setServiceId] = useState(order.serviceId);
  const [clientId, setClientId] = useState(order.clientId);
  const [clientProductId, setClientProductId] = useState(order.clientProductId);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const products = useMemo(
    () => clientProducts.filter((item) => item.clientId === clientId),
    [clientId, clientProducts],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const cents = Math.round(
      Number(priceRaw.replace(".", "").replace(",", ".")) * 100,
    );
    const result = await updateServiceOrder({
      id: order.id,
      priceCents: cents,
      workDescription: description,
      statusId,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function submitLinks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await correctServiceOrderLinks({
      id: order.id,
      serviceId,
      clientId,
      clientProductId,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const field =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100";

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <form onSubmit={submit} className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-4 text-sm">
          <div>
            <dt>{t("orders.col.service")}</dt>
            <dd className="font-medium">{order.service.name}</dd>
          </div>
          <div>
            <dt>{t("orders.col.client")}</dt>
            <dd className="font-medium">{order.client.name}</dd>
          </div>
          <div>
            <dt>{t("orders.col.equipment")}</dt>
            <dd className="font-medium">
              {order.clientProduct.product.name} #{order.clientProduct.identifier}
            </dd>
          </div>
        </dl>
        {!canEdit ? (
          <p className="text-sm text-slate-600">{t("orders.readonly")}</p>
        ) : null}
        <label className="block text-sm font-medium">
          {t("orders.form.price")}
          <input
            aria-label={t("orders.form.price")}
            disabled={!canEdit}
            className={field}
            value={priceRaw}
            onChange={(event) => setPriceRaw(event.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          {t("orders.form.status")}
          <select
            aria-label={t("orders.form.status")}
            disabled={!canEdit}
            className={field}
            value={statusId}
            onChange={(event) => setStatusId(event.target.value)}
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          {t("orders.form.description")}
          <textarea
            aria-label={t("orders.form.description")}
            disabled={!canEdit}
            className={field}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {error && !canCorrectLinks ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {canEdit ? (
          <button
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          >
            {t("orders.form.submitEdit")}
          </button>
        ) : null}
      </form>

      {canCorrectLinks ? (
        <form onSubmit={submitLinks} className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium">{t("orders.form.correctLinks")}</h2>
          <label className="block text-sm font-medium">
            {t("orders.form.service")}
            <select
              aria-label={`${t("orders.form.correctLinks")} ${t("orders.form.service")}`}
              className={field}
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t("orders.form.client")}
            <select
              aria-label={`${t("orders.form.correctLinks")} ${t("orders.form.client")}`}
              className={field}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setClientProductId("");
              }}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t("orders.form.equipment")}
            <select
              aria-label={`${t("orders.form.correctLinks")} ${t("orders.form.equipment")}`}
              className={field}
              value={clientProductId}
              onChange={(e) => setClientProductId(e.target.value)}
            >
              <option value="">{t("orders.form.select")}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product.name} #{product.identifier}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <button
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          >
            {t("orders.form.submitCorrectLinks")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
