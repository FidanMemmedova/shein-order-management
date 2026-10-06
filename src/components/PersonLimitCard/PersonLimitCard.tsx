import React from "react";
import { Card, Progress, Tag } from "antd";
import { formatDate, formatMoney } from "../../lib/format";
import {
  LEVEL_COLORS,
  MONTHLY_LIMIT_USD,
  formatUsd,
  type LimitLevel,
  type PersonUsage,
} from "../../lib/limits";
import { STORE_LABELS } from "../../types/order";
import "./PersonLimitCard.css";

const LEVEL_TAGS: Record<LimitLevel, { label: string; color: string }> = {
  free: { label: "Boşdur", color: "default" },
  ok: { label: "Limit daxilində", color: "green" },
  near: { label: "Limitə yaxındır", color: "orange" },
  full: { label: "Limit dolub", color: "red" },
  over: { label: "Limit aşılıb", color: "red" },
};

// Smart Customs üslubu: dairənin dolan hissəsi istifadə, ortada qalıq limit.
const RING_GRADIENTS: Record<LimitLevel, { "0%": string; "100%": string }> = {
  free: { "0%": "#d4d4d8", "100%": "#d4d4d8" },
  ok: { "0%": "#4ade80", "100%": "#15803d" },
  near: { "0%": "#fcd34d", "100%": "#d97706" },
  full: { "0%": "#f87171", "100%": "#b91c1c" },
  over: { "0%": "#f87171", "100%": "#b91c1c" },
};

const VISIBLE_ORDERS = 4;

interface PersonLimitCardProps {
  usage: PersonUsage;
  /** Telefon: kiçik halqa, sifariş siyahısı gizli — ekrana daha çox şəxs sığsın. */
  compact?: boolean;
}

const PersonLimitCard: React.FC<PersonLimitCardProps> = ({ usage, compact = false }) => {
  const tag = LEVEL_TAGS[usage.level];
  const over = usage.remainingUsd < 0;

  return (
    <Card className={`surface-card limit-card limit-card--${usage.level}${compact ? " limit-card--compact" : ""}`}>
      <header className="limit-card__head">
        <h3 className="limit-card__name" title={usage.name}>
          {usage.name}
        </h3>
        <Tag color={tag.color} bordered={false}>
          {tag.label}
        </Tag>
      </header>

      <div className="limit-card__ring">
        <Progress
          type="circle"
          size={compact ? 112 : 148}
          strokeWidth={compact ? 9 : 8}
          strokeLinecap="round"
          percent={Math.min(100, usage.percent)}
          strokeColor={RING_GRADIENTS[usage.level]}
          trailColor="#f1f1f3"
          format={() => (
            <span className="limit-ring">
              <span className="limit-ring__label">{over ? "Aşılıb" : "Qalıq limit"}</span>
              <strong className={over ? "limit-ring__value--over" : undefined}>
                {formatUsd(Math.abs(usage.remainingUsd))}
              </strong>
              <span className="limit-ring__total">/ ${MONTHLY_LIMIT_USD}</span>
            </span>
          )}
        />
      </div>

      <dl className="limit-card__legend">
        <div>
          <dt>
            <span className="limit-card__dot" style={{ background: LEVEL_COLORS[usage.level] }} />
            {compact ? "İstifadə" : "İstifadə olunub"}
          </dt>
          <dd>{formatUsd(usage.usedUsd)}</dd>
        </div>
        <div>
          <dt>
            <span className="limit-card__dot limit-card__dot--rest" />
            Qalıq
          </dt>
          <dd>{formatUsd(Math.max(0, usage.remainingUsd))}</dd>
        </div>
        {!compact && usage.iherbAzn > 0 && (
          <div className="limit-card__split">
            <dt>Shein / iHerb</dt>
            <dd>
              {formatUsd(usage.sheinUsd)} / {formatMoney(usage.iherbAzn, "iherb")}
            </dd>
          </div>
        )}
      </dl>

      {compact ? null : usage.orders.length > 0 ? (
        <ul className="limit-card__orders">
          {usage.orders.slice(0, VISIBLE_ORDERS).map((order) => (
            <li key={order.id}>
              <span>{formatDate(order.orderDate)}</span>
              <span className="limit-card__store">{STORE_LABELS[order.store]}</span>
              <strong>{formatMoney(order.orderPrice, order.store)}</strong>
            </li>
          ))}
          {usage.orders.length > VISIBLE_ORDERS && (
            <li className="limit-card__more">+{usage.orders.length - VISIBLE_ORDERS} sifariş daha</li>
          )}
        </ul>
      ) : (
        <p className="limit-card__empty">Bu ay sifariş yoxdur — limit tam boşdur.</p>
      )}
    </Card>
  );
};

export default PersonLimitCard;
