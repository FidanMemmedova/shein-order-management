import type { Dayjs } from "dayjs";
import { normalizeText } from "./format";
import type { Order } from "../types/order";

/** Azərbaycan: bir şəxsin adına ayda ən çox $300-lıq bağlama. */
export const MONTHLY_LIMIT_USD = 300;
/** Manat dollara sabit məzənnə ilə bağlıdır. */
export const AZN_PER_USD = 1.7;

export type LimitLevel = "free" | "ok" | "near" | "full" | "over";

export interface PersonUsage {
  key: string;
  name: string;
  usedUsd: number;
  remainingUsd: number;
  percent: number;
  level: LimitLevel;
  /** Seçilmiş ayın sifarişləri (yenidən köhnəyə). */
  orders: Order[];
  sheinUsd: number;
  iherbAzn: number;
}

export const toUsd = (order: Pick<Order, "store" | "orderPrice">) =>
  order.store === "iherb" ? order.orderPrice / AZN_PER_USD : order.orderPrice;

/** Eyni şəxsin adı fərqli yazılsa da (böyük/kiçik hərf, ə/e, boşluqlar) bir yerdə saylsın. */
export const personKey = (name: string) => normalizeText(name).replace(/\s+/g, " ").trim();

export const limitLevel = (usedUsd: number): LimitLevel => {
  const cents = Math.round(usedUsd * 100);
  const limit = MONTHLY_LIMIT_USD * 100;
  if (cents === 0) return "free";
  if (cents > limit) return "over";
  if (cents === limit) return "full";
  return cents >= limit * 0.7 ? "near" : "ok";
};

export const LEVEL_COLORS: Record<LimitLevel, string> = {
  free: "#d4d4d8",
  ok: "#16a34a",
  near: "#f59e0b",
  full: "#dc2626",
  over: "#dc2626",
};

const inMonth = (order: Order, month: Dayjs) => order.orderDate.startsWith(month.format("YYYY-MM"));

const summarize = (key: string, name: string, monthOrders: Order[]): PersonUsage => {
  const sheinUsd = monthOrders.filter((o) => o.store === "shein").reduce((sum, o) => sum + o.orderPrice, 0);
  const iherbAzn = monthOrders.filter((o) => o.store === "iherb").reduce((sum, o) => sum + o.orderPrice, 0);
  const usedUsd = sheinUsd + iherbAzn / AZN_PER_USD;
  return {
    key,
    name,
    usedUsd,
    remainingUsd: MONTHLY_LIMIT_USD - usedUsd,
    percent: (usedUsd / MONTHLY_LIMIT_USD) * 100,
    level: limitLevel(usedUsd),
    orders: monthOrders,
    sheinUsd,
    iherbAzn,
  };
};

/** Hər tanınan şəxs üçün seçilmiş aydakı istifadə: ən çox boş yeri olan əvvəldə. */
export const monthlyUsage = (orders: Order[], month: Dayjs): PersonUsage[] => {
  const people = new Map<string, { name: string; monthOrders: Order[] }>();
  for (const order of orders) {
    const key = personKey(order.orderForName);
    if (!key) continue;
    const person = people.get(key) ?? { name: order.orderForName.trim(), monthOrders: [] };
    if (inMonth(order, month)) person.monthOrders.push(order);
    people.set(key, person);
  }
  return [...people.entries()]
    .map(([key, { name, monthOrders }]) => summarize(key, name, monthOrders))
    .sort((a, b) => b.remainingUsd - a.remainingUsd || a.name.localeCompare(b.name, "az"));
};

/** Bir şəxsin həmin aydakı istifadəsi (formda xəbərdarlıq üçün). */
export const personUsage = (orders: Order[], name: string, month: Dayjs): PersonUsage => {
  const key = personKey(name);
  return summarize(
    key,
    name.trim(),
    orders.filter((order) => personKey(order.orderForName) === key && inMonth(order, month))
  );
};

export const formatUsd = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
