import React from "react";
import { Alert, Progress } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
  LEVEL_COLORS,
  MONTHLY_LIMIT_USD,
  formatUsd,
  limitLevel,
  personUsage,
  toUsd,
} from "../../lib/limits";
import type { Order, Store } from "../../types/order";

interface LimitHintProps {
  orders: Order[];
  store: Store;
  name?: string;
  date?: Dayjs | null;
  price?: number | null;
  /** Redaktə zamanı həmin sifariş özü ikinci dəfə sayılmasın. */
  excludeOrderId?: number;
}

/** Formda: sifariş edilən şəxsin həmin aydakı $300 limitindən nə qədər istifadə olunub. */
const LimitHint: React.FC<LimitHintProps> = ({ orders, store, name, date, price, excludeOrderId }) => {
  if (!name?.trim()) return null;

  // Yeni bağlama hələ gəlməyib: keçmiş aya yazılsa belə, cari ayın limitinə düşür.
  const orderMonth = (date ?? dayjs()).startOf("month");
  const month = orderMonth.isBefore(dayjs(), "month") ? dayjs().startOf("month") : orderMonth;
  const usage = personUsage(
    orders.filter((order) => order.id !== excludeOrderId),
    name,
    month
  );
  const newUsd = price ? toUsd({ store, orderPrice: price }) : 0;
  const totalUsd = usage.usedUsd + newUsd;
  const level = limitLevel(totalUsd);
  const over = totalUsd - MONTHLY_LIMIT_USD;

  const type = level === "over" ? "error" : level === "near" || level === "full" ? "warning" : "success";
  const monthName = month.format("MMMM");

  return (
    <Alert
      type={type}
      showIcon
      className="limit-hint"
      message={
        <span>
          <strong>{name.trim()}</strong> · {monthName} ayı: {formatUsd(usage.usedUsd)} / ${MONTHLY_LIMIT_USD}
          {usage.orders.length > 0 && ` (${usage.orders.length} sifariş)`}
        </span>
      }
      description={
        <>
          <Progress
            percent={Math.min(100, (totalUsd / MONTHLY_LIMIT_USD) * 100)}
            // Boz hissə: artıq istifadə olunan; rəngli hissə: bu sifariş. Limit aşılırsa, zolaq tam qırmızı olur.
            success={{
              percent: level === "over" ? 0 : Math.min(100, (usage.usedUsd / MONTHLY_LIMIT_USD) * 100),
              strokeColor: "#a1a1aa",
            }}
            strokeColor={LEVEL_COLORS[level]}
            showInfo={false}
            size="small"
          />
          {newUsd > 0
            ? over > 0
              ? `Bu sifarişlə ${formatUsd(totalUsd)} olacaq — limit ${formatUsd(over)} aşılır!`
              : `Bu sifarişlə ${formatUsd(totalUsd)} olacaq, qalan yer: ${formatUsd(-over)}.`
            : `Qalan yer: ${formatUsd(Math.max(0, MONTHLY_LIMIT_USD - usage.usedUsd))}.`}
          {store === "iherb" && newUsd > 0 && " (₼ → $ 1.70 ilə)"}
        </>
      }
    />
  );
};

export default LimitHint;
