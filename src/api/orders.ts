import { supabase } from "../lib/supabase";
import type { Cargo, Order, OrderInput, Store } from "../types/order";

interface OrderRow {
  id: number;
  store: Store;
  order_date: string;
  order_email: string;
  order_for_name: string;
  order_price: number | string;
  delivery_received: boolean;
  return_request: boolean;
  cargo: Cargo | null;
  customer_notes: string[] | null;
  profit: number | string | null;
}

const COLUMNS =
  "id, store, order_date, order_email, order_for_name, order_price, delivery_received, return_request, cargo, customer_notes, profit";

// Supabase bir sorğuda ən çox 1000 sətir qaytarır, ona görə hissə-hissə oxuyuruq.
const PAGE_SIZE = 1000;

const fromRow = (row: OrderRow): Order => ({
  id: row.id,
  store: row.store,
  orderDate: row.order_date,
  orderEmail: row.order_email,
  orderForName: row.order_for_name,
  orderPrice: Number(row.order_price),
  deliveryReceived: row.delivery_received,
  returnRequest: row.return_request,
  cargo: row.cargo,
  customerNotes: row.customer_notes ?? [],
  profit: row.profit === null ? null : Number(row.profit),
});

export const toRow = (order: Partial<OrderInput>) => {
  const row: Partial<Omit<OrderRow, "id">> = {};
  if (order.store !== undefined) row.store = order.store;
  if (order.orderDate !== undefined) row.order_date = order.orderDate;
  if (order.orderEmail !== undefined) row.order_email = order.orderEmail.trim();
  if (order.orderForName !== undefined) row.order_for_name = order.orderForName.trim();
  if (order.orderPrice !== undefined) row.order_price = order.orderPrice;
  if (order.deliveryReceived !== undefined) row.delivery_received = order.deliveryReceived;
  if (order.returnRequest !== undefined) row.return_request = order.returnRequest;
  if (order.cargo !== undefined) row.cargo = order.cargo;
  if (order.customerNotes !== undefined) row.customer_notes = cleanNotes(order.customerNotes);
  if (order.profit !== undefined) row.profit = order.profit;
  return row;
};

export const cleanNotes = (notes: string[]) =>
  notes.map((note) => note.trim()).filter(Boolean);

/** Mağaza verilməsə, hər iki mağazanın sifarişlərini qaytarır (limitlər üçün). */
export async function fetchOrders(store?: Store): Promise<Order[]> {
  const orders: Order[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase.from("orders").select(COLUMNS);
    if (store) query = query.eq("store", store);
    const { data, error } = await query
      .order("order_date", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = data as unknown as OrderRow[];
    orders.push(...rows.map(fromRow));
    if (rows.length < PAGE_SIZE) return orders;
  }
}

export async function createOrder(order: OrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert(toRow(order))
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return fromRow(data as unknown as OrderRow);
}

export async function updateOrder(id: number, patch: Partial<OrderInput>): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update(toRow(patch))
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return fromRow(data as unknown as OrderRow);
}

export async function deleteOrder(id: number): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}
