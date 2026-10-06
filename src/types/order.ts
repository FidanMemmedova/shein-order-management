export const STORES = ["shein", "iherb"] as const;

export type Store = (typeof STORES)[number];

export const STORE_LABELS: Record<Store, string> = {
  shein: "Shein",
  iherb: "iHerb",
};

export const STORE_COLORS: Record<Store, string> = {
  shein: "#18181b",
  iherb: "#458500",
};

/** Shein qiymətləri dollarla, iHerb qiymətləri manatla qeyd olunur. */
export const STORE_CURRENCY: Record<Store, "USD" | "AZN"> = {
  shein: "USD",
  iherb: "AZN",
};

export const isStore = (value: unknown): value is Store =>
  typeof value === "string" && (STORES as readonly string[]).includes(value);

export const CARGO_OPTIONS = ["Aramex", "Cargomax"] as const;

export type Cargo = (typeof CARGO_OPTIONS)[number];

export interface Order {
  id: number;
  store: Store;
  /** YYYY-MM-DD */
  orderDate: string;
  orderEmail: string;
  orderForName: string;
  orderPrice: number;
  deliveryReceived: boolean;
  returnRequest: boolean;
  cargo: Cargo | null;
  customerNotes: string[];
  /** Qazanc (mağazanın valyutasında); null = hələ yazılmayıb. */
  profit: number | null;
}

export type OrderInput = Omit<Order, "id">;
