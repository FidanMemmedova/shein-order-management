import React from "react";
import { Checkbox, Popconfirm, Tooltip } from "antd";
import dayjs from "dayjs";
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

  // Qaytarılma yalnız təhvil alınmış sifarişdə mümkündür (bazada da yoxlanılır).
  if (field === "returnRequest" && !checked && !order.deliveryReceived) {
    return (
      <Tooltip title="Əvvəlcə «Təhvil alındı» qeyd edin">
        <span className="status-checkbox">
          <Checkbox checked={false} disabled>
            {label}
          </Checkbox>
        </span>
      </Tooltip>
    );
  }

  const [askCheck, askUncheck] = QUESTIONS[field];
  const alsoUndoReturn = field === "deliveryReceived" && checked && order.returnRequest;

  const patch: Partial<OrderInput> =
    field === "deliveryReceived"
      ? checked
        ? { deliveryReceived: false, deliveredAt: null, ...(order.returnRequest && { returnRequest: false }) }
        : // Təhvil tarixi limitin hansı aya sayılacağını müəyyən edir.
          { deliveryReceived: true, deliveredAt: dayjs().format("YYYY-MM-DD") }
      : { returnRequest: !checked };

  return (
    <Popconfirm
      title={checked ? askUncheck : askCheck}
      description={alsoUndoReturn ? "Qaytarılma da ləğv olunacaq." : undefined}
      okText="Bəli"
      cancelText="Xeyr"
      onConfirm={() => onPatch(order, patch, "Status yeniləndi.")}
    >
      {/* Popconfirm klik hadisəsini Checkbox-dan birbaşa tutmur, ona görə span-a bükürük. */}
      <span className="status-checkbox">
        <Checkbox checked={checked}>{label}</Checkbox>
      </span>
    </Popconfirm>
  );
};

export default StatusCheckbox;
