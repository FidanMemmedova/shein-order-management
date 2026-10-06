import React, { useEffect, useState } from "react";
import { InputNumber } from "antd";
import { STORE_CURRENCY, type Order, type OrderInput } from "../../types/order";

interface ProfitInputProps {
  order: Order;
  onPatch: (order: Order, patch: Partial<OrderInput>, successText?: string) => Promise<boolean>;
}

/** Cədvəldə qazancı birbaşa yazmaq üçün: sahədən çıxanda və ya Enter basanda yadda saxlanır. */
const ProfitInput: React.FC<ProfitInputProps> = ({ order, onPatch }) => {
  const [draft, setDraft] = useState<number | null>(order.profit);

  useEffect(() => setDraft(order.profit), [order.profit]);

  const commit = () => {
    if (draft === order.profit) return;
    void onPatch(order, { profit: draft }, "Qazanc yadda saxlanıldı.");
  };

  const currency = STORE_CURRENCY[order.store] === "AZN" ? { suffix: "₼" } : { prefix: "$" };
  const tone = draft === null ? "" : draft > 0 ? " profit-input--gain" : draft < 0 ? " profit-input--loss" : "";

  return (
    <InputNumber<number>
      {...currency}
      className={`profit-input${tone}`}
      value={draft}
      precision={2}
      step={0.01}
      controls={false}
      variant="filled"
      placeholder="0.00"
      aria-label="Qazanc"
      onChange={(value) => setDraft(value ?? null)}
      onBlur={commit}
      onPressEnter={(event) => event.currentTarget.blur()}
    />
  );
};

export default ProfitInput;
