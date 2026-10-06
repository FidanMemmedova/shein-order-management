import React, { useState } from "react";
import { Card } from "antd";
import dayjs from "dayjs";
import LimitRing from "../LimitRing/LimitRing";
import { formatMoney } from "../../lib/format";
import { MONTHLY_LIMIT_USD, formatUsd, type LimitLevel, type PersonUsage } from "../../lib/limits";
import { STORE_LABELS } from "../../types/order";
import "./PersonLimitCard.css";

const LEVELS: Record<LimitLevel, { label: string; ring: [string, string] }> = {
  free: { label: "Boşdur", ring: ["#d4d4d8", "#d4d4d8"] },
  ok: { label: "Limit daxilində", ring: ["#34d399", "#059669"] },
  near: { label: "Limitə yaxın", ring: ["#fbbf24", "#d97706"] },
  full: { label: "Limit dolub", ring: ["#f87171", "#dc2626"] },
  over: { label: "Limit aşılıb", ring: ["#f87171", "#b91c1c"] },
};

// Ada görə sabit, yumşaq avatar rəngi.
const AVATAR_COLORS = ["#ede9fe", "#e0f2fe", "#dcfce7", "#fef3c7", "#ffe4e6", "#e0e7ff", "#ccfbf1", "#fae8ff"];
const AVATAR_TEXT = ["#6d28d9", "#0369a1", "#15803d", "#b45309", "#be123c", "#4338ca", "#0f766e", "#a21caf"];

const avatarIndex = (key: string) =>
  [...key].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) % AVATAR_COLORS.length;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("az"))
    .join("");

const COLLAPSED_ORDERS = 3;

interface PersonLimitCardProps {
  usage: PersonUsage;
  /** Seçilmiş ay (başlıqda göstərilir). */
  month: dayjs.Dayjs;
  /** Telefon: kiçik halqa, sifariş siyahısı gizli — ekrana daha çox şəxs sığsın. */
  compact?: boolean;
}

const PersonLimitCard: React.FC<PersonLimitCardProps> = ({ usage, month, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const level = LEVELS[usage.level];
  const over = usage.remainingUsd < 0;
  const colorIndex = avatarIndex(usage.key);
  const percent = Math.round(usage.percent);
  const visibleOrders = expanded ? usage.orders : usage.orders.slice(0, COLLAPSED_ORDERS);

  return (
    <Card className={`limit-card limit-card--${usage.level}${compact ? " limit-card--compact" : ""}`}>
      <header className="limit-card__head">
        {!compact && (
          <span
            className="limit-card__avatar"
            style={{ background: AVATAR_COLORS[colorIndex], color: AVATAR_TEXT[colorIndex] }}
          >
            {initials(usage.name)}
          </span>
        )}
        <div className="limit-card__title">
          <h3 className="limit-card__name" title={usage.name}>
            {usage.name}
          </h3>
          <span className="limit-card__subtitle">
            {usage.orders.length ? `${usage.orders.length} sifariş` : "Sifariş yoxdur"} · {month.format("MMMM")}
          </span>
        </div>
      </header>

      <div className="limit-card__ring">
        <LimitRing percent={usage.percent} colors={level.ring} size={compact ? 116 : 168} stroke={compact ? 10 : 12}>
          <span className={`limit-card__ring-label${over ? " is-over" : ""}`}>{over ? "Aşılıb" : "Qalıq"}</span>
          <strong className={`limit-card__ring-value${over ? " is-over" : ""}`}>
            {formatUsd(Math.abs(usage.remainingUsd))}
          </strong>
          <span className="limit-card__ring-total">limit ${MONTHLY_LIMIT_USD}</span>
        </LimitRing>
        <span className={`limit-pill limit-pill--${usage.level}`}>{level.label}</span>
      </div>

      <dl className="limit-card__metrics">
        <div>
          <dt>İstifadə</dt>
          <dd>{formatUsd(usage.usedUsd)}</dd>
        </div>
        <div>
          <dt>Qalıq</dt>
          <dd className={over ? "is-over" : "is-free"}>{formatUsd(Math.max(0, usage.remainingUsd))}</dd>
        </div>
        {!compact && (
          <div>
            <dt>Doluluq</dt>
            <dd>{percent}%</dd>
          </div>
        )}
      </dl>

      {!compact &&
        (usage.orders.length ? (
          <div className="limit-card__orders">
            <ul>
              {visibleOrders.map((order) => (
                <li key={order.id}>
                  <span className="limit-card__date">{dayjs(order.orderDate).format("DD.MM")}</span>
                  <span className={`store-pill store-pill--${order.store}`}>{STORE_LABELS[order.store]}</span>
                  {usage.carriedIds.has(order.id) && (
                    <span className="carried-pill" title="Keçən ay təhvil alınmadığı üçün bu aya keçib">
                      keçən aydan
                    </span>
                  )}
                  <span className="limit-card__amount">{formatMoney(order.orderPrice, order.store)}</span>
                </li>
              ))}
            </ul>
            {usage.orders.length > COLLAPSED_ORDERS && (
              <button type="button" className="limit-card__toggle" onClick={() => setExpanded((value) => !value)}>
                {expanded ? "Daha az göstər" : `Hamısını göstər (${usage.orders.length})`}
              </button>
            )}
            {usage.iherbAzn > 0 && (
              <p className="limit-card__note">
                iHerb {formatMoney(usage.iherbAzn, "iherb")} ≈ {formatUsd(usage.usedUsd - usage.sheinUsd)} kimi sayılır
              </p>
            )}
          </div>
        ) : (
          <p className="limit-card__empty">Bu ay sifariş yoxdur — limitin hamısı boşdur.</p>
        ))}
    </Card>
  );
};

export default PersonLimitCard;
