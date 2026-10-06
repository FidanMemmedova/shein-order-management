import dayjs from "dayjs";
import { formatDate } from "./format";
import { STORE_CURRENCY, STORE_LABELS, type Order, type Store } from "../types/order";

const header = (store: Store) => [
  "Tarix",
  "Sifariş edilən şəxs",
  "E-mail",
  `Qiymət (${STORE_CURRENCY[store]})`,
  "Kargo",
  "Təhvil alındı",
  "Təhvil tarixi",
  "Qaytarılma",
  `Qazanc (${STORE_CURRENCY[store]})`,
  "Müştəri qeydləri",
];

const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** Görünən sifarişləri Excel-in açdığı CSV faylı kimi yükləyir. */
export const exportOrdersCsv = (orders: Order[], store: Store) => {
  const rows = orders.map((order) => [
    formatDate(order.orderDate),
    order.orderForName,
    order.orderEmail,
    order.orderPrice.toFixed(2),
    order.cargo ?? "",
    order.deliveryReceived ? "Bəli" : "Xeyr",
    order.deliveredAt ? formatDate(order.deliveredAt) : "",
    order.returnRequest ? "Bəli" : "Xeyr",
    order.profit === null ? "" : order.profit.toFixed(2),
    order.customerNotes.join(" | "),
  ]);
  // BOM: Excel-də Azərbaycan hərfləri düzgün görünsün.
  const csv = "﻿" + [header(store), ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${STORE_LABELS[store]}-sifarisler-${dayjs().format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
