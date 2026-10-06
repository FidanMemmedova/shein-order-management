import type { Dayjs } from "dayjs";
import type { Cargo, OrderInput } from "../../types/order";

export interface OrderFormValues {
  orderDate: Dayjs;
  orderEmail: string;
  orderForName: string;
  orderPrice: number;
  customerNotes?: string[];
  cargo?: Cargo | null;
  deliveryReceived?: boolean;
  returnRequest?: boolean;
}

type OrderFields = Omit<
  OrderInput,
  "store" | "cargo" | "deliveryReceived" | "deliveredAt" | "returnRequest" | "profit"
>;

export const toOrderFields = (values: OrderFormValues): OrderFields => ({
  orderDate: values.orderDate.format("YYYY-MM-DD"),
  orderEmail: values.orderEmail,
  orderForName: values.orderForName,
  orderPrice: values.orderPrice,
  customerNotes: values.customerNotes ?? [],
});
