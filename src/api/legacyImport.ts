import { supabase } from "../lib/supabase";
import { cleanNotes, toRow } from "./orders";

const MOCKAPI_ORDERS_URL = "https://67faa1b08ee14a54262839ee.mockapi.io/orders";
const DEFAULT_OWNER = "Fidan Məmmədova";

interface MockOrder {
  id: string;
  orderDate: string;
  orderOwner?: string;
  orderEmail: string;
  orderForName: string;
  orderPrice: string | number;
  returnRequest?: boolean;
  deliveryReceived?: boolean;
  customerInfo?: string;
}

// MockAPI tarixləri Bakı gecəyarısının UTC ifadəsidir (məs. 2025-12-06T20:00Z = 07.12.2025).
const toBakuDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Baku" });

/** Köhnə MockAPI (Shein) sifarişlərini Supabase-ə köçürür. Təkrar işə salınsa, artıq köçürülənləri ötürür. */
export async function importFromMockApi(): Promise<number> {
  const response = await fetch(MOCKAPI_ORDERS_URL);
  if (!response.ok) throw new Error(`MockAPI cavab vermədi (${response.status})`);
  const mockOrders = (await response.json()) as MockOrder[];

  const rows = mockOrders.map((mock) => {
    // Hər sətir ayrıca müştəri qutusuna çevrilir.
    const notes = (mock.customerInfo ?? "").split(/\r?\n/);
    if (mock.orderOwner && mock.orderOwner !== DEFAULT_OWNER) {
      notes.unshift(`Sahibi: ${mock.orderOwner}`);
    }
    return {
      ...toRow({
        store: "shein",
        orderDate: toBakuDate(mock.orderDate),
        orderEmail: mock.orderEmail,
        orderForName: mock.orderForName,
        orderPrice: Number(mock.orderPrice),
        deliveryReceived: Boolean(mock.deliveryReceived),
        returnRequest: Boolean(mock.returnRequest),
        customerNotes: cleanNotes(notes),
      }),
      legacy_id: mock.id,
    };
  });

  const { data, error } = await supabase
    .from("orders")
    .upsert(rows, { onConflict: "legacy_id", ignoreDuplicates: true })
    .select("id");
  if (error) throw error;
  return data.length;
}
