import React, { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getLastStore, rememberStore } from "../../lib/store";
import { isStore, type Store } from "../../types/order";

interface StoreRouteProps {
  children: (store: Store) => React.ReactNode;
}

/** URL-dəki mağazanı (/shein, /iherb) yoxlayır; tanınmayan ünvanı sonuncu mağazaya yönləndirir. */
const StoreRoute: React.FC<StoreRouteProps> = ({ children }) => {
  const { store } = useParams();
  const validStore = isStore(store) ? store : null;

  useEffect(() => {
    if (validStore) rememberStore(validStore);
  }, [validStore]);

  if (!validStore) return <Navigate to={`/${getLastStore()}`} replace />;
  return <>{children(validStore)}</>;
};

export default StoreRoute;
