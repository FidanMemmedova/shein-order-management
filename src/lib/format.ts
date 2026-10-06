import dayjs from "dayjs";
import { STORE_CURRENCY, type Store } from "../types/order";

/** Shein: $220.49 · iHerb: 220.49 ₼ */
export const formatMoney = (value: number, store: Store) => {
  const amount = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return STORE_CURRENCY[store] === "AZN" ? `${amount} ₼` : `$${amount}`;
};

export const formatDate = (value: string) => dayjs(value).format("DD.MM.YYYY");

/** Axtarış üçün: böyük/kiçik hərf və ə, ş, ç, ğ, ö, ü, ı fərqlərini nəzərə almır. */
export const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e");
