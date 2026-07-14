"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createServiceOrder } from "@/lib/service-orders/actions";
import { t } from "@/lib/i18n";

type Props = {
  services: { id: string; name: string; priceCents: number | null }[];
  clients: { id: string; name: string }[];
  clientProducts: { id: string; clientId: string; identifier: string; product: { name: string } }[];
  statuses: { id: string; name: string; isDefaultInitial: boolean }[];
};

export function ServiceOrderForm({ services, clients, clientProducts, statuses }: Props) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientProductId, setClientProductId] = useState("");
  const [statusId, setStatusId] = useState(statuses.find((status) => status.isDefaultInitial)?.id ?? "");
  const [priceRaw, setPriceRaw] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const products = useMemo(() => clientProducts.filter((product) => product.clientId === clientId), [clientId, clientProducts]);

  function selectService(id: string) {
    setServiceId(id);
    const price = services.find((service) => service.id === id)?.priceCents;
    setPriceRaw(price === null || price === undefined ? "" : (price / 100).toFixed(2).replace(".", ","));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(priceRaw.replace(".", "").replace(",", ".") || "0");
    setPending(true);
    const result = await createServiceOrder({ serviceId, clientId, clientProductId, statusId: statusId || undefined, priceCents: Math.round(value * 100), workDescription });
    if (!result.ok) { setError(result.error); setPending(false); return; }
    router.push("/app/ordens-servico");
    router.refresh();
  }

  const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";
  return <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4" noValidate>
    <label className="block text-sm font-medium">{t("orders.form.service")}<select aria-label={t("orders.form.service")} className={field} value={serviceId} onChange={(event) => selectService(event.target.value)} required><option value="">{t("orders.form.select")}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
    <label className="block text-sm font-medium">{t("orders.form.client")}<select aria-label={t("orders.form.client")} className={field} value={clientId} onChange={(event) => { setClientId(event.target.value); setClientProductId(""); }} required><option value="">{t("orders.form.select")}</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
    <label className="block text-sm font-medium">{t("orders.form.equipment")}<select aria-label={t("orders.form.equipment")} className={field} value={clientProductId} onChange={(event) => setClientProductId(event.target.value)} required disabled={!clientId}><option value="">{t("orders.form.select")}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.product.name} #{product.identifier}</option>)}</select></label>
    <label className="block text-sm font-medium">{t("orders.form.price")}<input aria-label={t("orders.form.price")} className={field} value={priceRaw} onChange={(event) => setPriceRaw(event.target.value)} inputMode="decimal" required /></label>
    <label className="block text-sm font-medium">{t("orders.form.status")}<select aria-label={t("orders.form.status")} className={field} value={statusId} onChange={(event) => setStatusId(event.target.value)}><option value="">{t("orders.form.select")}</option>{statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}</select></label>
    <label className="block text-sm font-medium">{t("orders.form.description")}<textarea aria-label={t("orders.form.description")} className={field} value={workDescription} onChange={(event) => setWorkDescription(event.target.value)} maxLength={4000} rows={4} /></label>
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    <div className="flex gap-3"><button disabled={pending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">{t("orders.form.submitCreate")}</button><Link href="/app/ordens-servico" className="py-2 text-sm">{t("orders.form.cancel")}</Link></div>
  </form>;
}
