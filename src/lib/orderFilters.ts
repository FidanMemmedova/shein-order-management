import type { Dayjs } from "dayjs";
import { normalizeText } from "./format";
import type { Cargo, Order } from "../types/order";

export type StatusFilter = "all" | "pending" | "delivered" | "returned" | "noCargo";
export type CargoFilter = "all" | Cargo | "none";
export type DateRange = [Dayjs, Dayjs] | null;

export interface OrderFilters {
  search: string;
  cargo: CargoFilter;
  range: DateRange;
}

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "pending", label: "Gözləyir" },
  { value: "delivered", label: "Təhvil alınıb" },
  { value: "returned", label: "Qaytarılma" },
  { value: "noCargo", label: "Kargo seçilməyib" },
];

export const matchesStatus = (order: Order, status: StatusFilter) => {
  switch (status) {
    case "pending":
      return !order.deliveryReceived && !order.returnRequest;
    case "delivered":
      return order.deliveryReceived;
    case "returned":
      return order.returnRequest;
    case "noCargo":
      return !order.cargo && !order.returnRequest;
    default:
      return true;
  }
};

/** Axtarış, kargo və tarix filtrləri (status ayrıca hesablanır ki, tablardakı saylar düzgün olsun). */
export const applyFilters = (orders: Order[], { search, cargo, range }: OrderFilters) => {
  const query = normalizeText(search.trim());
  const from = range?.[0].format("YYYY-MM-DD");
  const to = range?.[1].format("YYYY-MM-DD");

  return orders.filter((order) => {
    if (cargo === "none" ? order.cargo : cargo !== "all" && order.cargo !== cargo) return false;
    if (from && order.orderDate < from) return false;
    if (to && order.orderDate > to) return false;
    if (!query) return true;
    return [order.orderForName, order.orderEmail, ...order.customerNotes].some((text) =>
      normalizeText(text).includes(query)
    );
  });
};
