import { isStore, type Store } from "../types/order";

const LAST_STORE_KEY = "fbm:lastStore";

/** Sonuncu açılan mağaza: növbəti girişdə həmin mağaza açılsın. */
export const getLastStore = (): Store => {
  try {
    const saved = localStorage.getItem(LAST_STORE_KEY);
    return isStore(saved) ? saved : "shein";
  } catch {
    return "shein";
  }
};

export const rememberStore = (store: Store) => {
  try {
    localStorage.setItem(LAST_STORE_KEY, store);
  } catch {
    // Brauzer yaddaşı bağlıdırsa, sadəcə yadda saxlamırıq.
  }
};

/** URL-in ilk hissəsindən mağazanı oxuyur: /shein, /iherb/new … */
export const storeFromPath = (pathname: string): Store | null => {
  const segment = pathname.split("/")[1];
  return isStore(segment) ? segment : null;
};
