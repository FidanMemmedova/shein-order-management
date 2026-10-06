import React from "react";
import { Checkbox, Popconfirm } from "antd";
import type { Order, OrderInput } from "../../types/order";

export type StatusField = "deliveryReceived" | "returnRequest";

const QUESTIONS: Record<StatusField, [check: string, uncheck: string]> = {
  deliveryReceived: ["Təhvil alındı kimi qeyd edilsin?", "Təhvil alındı statusu ləğv edilsin?"],
  returnRequest: ["Qaytarılma kimi qeyd edilsin?", "Qaytarılma statusu ləğv edilsin?"],
};

interface StatusCheckboxProps {
  order: Order;
  field: StatusField;
  label?: string;
  onPatch: (order: Order, patch: Partial<OrderInput>, successText?: string) => Promise<boolean>;
}

/** Statusu dəyişməzdən əvvəl checkbox-un yanında qısa təsdiq soruşur. */
const StatusCheckbox: React.FC<StatusCheckboxProps> = ({ order, field, label, onPatch }) => {
  const checked = order[field];
  const [askCheck, askUncheck] = QUESTIONS[field];

  return (
    <Popconfirm
      title={checked ? askUncheck : askCheck}
      okText="Bəli"
      cancelText="Xeyr"
      onConfirm={() => onPatch(order, { [field]: !checked }, "Status yeniləndi.")}
    >
      {/* Popconfirm klik hadisəsini Checkbox-dan birbaşa tutmur, ona görə span-a bükürük. */}
      <span className="status-checkbox">
        <Checkbox checked={checked}>{label}</Checkbox>
      </span>
    </Popconfirm>
  );
};

export default StatusCheckbox;
