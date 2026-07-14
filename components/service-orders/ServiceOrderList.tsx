import Link from "next/link";
import { t } from "@/lib/i18n";
import { formatPriceCents } from "@/lib/services/format";

type Props = {
  orders: {
    id: string;
    priceCents: number;
    service: { name: string };
    client: { name: string };
    clientProduct: { identifier: string; product: { name: string } };
    status: { name: string };
  }[];
  statuses: { id: string; name: string }[];
  selectedStatusId?: string;
  canCreate: boolean;
};

export function ServiceOrderList({ orders, statuses, selectedStatusId, canCreate }: Props) {
  if (!orders.length) return <div className="rounded-md border border-dashed p-8 text-center"><p>{t("orders.empty")}</p>{canCreate ? <Link className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white" href="/app/ordens-servico/novo">{t("orders.createCta")}</Link> : null}</div>;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3 text-sm">
      <Link href="/app/ordens-servico" className={!selectedStatusId ? "font-semibold" : "underline"}>{t("orders.filter.all")}</Link>
      {statuses.map((status) => <Link key={status.id} href={`/app/ordens-servico?statusId=${status.id}`} className={selectedStatusId === status.id ? "font-semibold" : "underline"}>{status.name}</Link>)}
      {selectedStatusId ? <Link href="/app/ordens-servico" className="underline">{t("orders.filter.clear")}</Link> : null}
    </div>
    <div className="overflow-x-auto rounded-md border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3">{t("orders.col.client")}</th><th className="px-4 py-3">{t("orders.col.service")}</th><th className="px-4 py-3">{t("orders.col.equipment")}</th><th className="px-4 py-3">{t("orders.col.price")}</th><th className="px-4 py-3">{t("orders.col.status")}</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t"><td className="px-4 py-3"><Link className="underline" href={`/app/ordens-servico/${order.id}`}>{order.client.name}</Link></td><td className="px-4 py-3">{order.service.name}</td><td className="px-4 py-3">{order.clientProduct.product.name} #{order.clientProduct.identifier}</td><td className="px-4 py-3">{formatPriceCents(order.priceCents)}</td><td className="px-4 py-3">{order.status.name}</td></tr>)}</tbody></table></div>
  </div>;
}
