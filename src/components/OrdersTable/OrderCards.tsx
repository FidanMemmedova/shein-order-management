import React, { useState } from "react";
import { Button, Empty, Popconfirm, Spin, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CargoSelect from "../CargoSelect/CargoSelect";
import NotesCell from "../NotesEditor/NotesCell";
import StatusCheckbox from "./StatusCheckbox";
import ProfitInput from "./ProfitInput";
import type { OrderActions } from "./OrdersTable";
import { formatDate, formatMoney } from "../../lib/format";
import type { Order } from "../../types/order";
import "./OrderCards.css";

const PAGE_SIZE = 20;

interface OrderCardsProps extends OrderActions {
  orders: Order[];
  loading: boolean;
  emptyContent: React.ReactNode;
}

/** Telefon ekranı üçün: hər sifariş ayrıca kartda. */
const OrderCards: React.FC<OrderCardsProps> = ({ orders, loading, emptyContent, onPatch, onEdit, onDelete }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (loading && !orders.length) {
    return (
      <div className="order-cards__state">
        <Spin />
      </div>
    );
  }

  if (!orders.length) {
    return <div className="order-cards__state">{emptyContent ?? <Empty />}</div>;
  }

  return (
    <div className="order-cards">
      {orders.slice(0, visibleCount).map((order) => (
        <article
          key={order.id}
          className={`order-card${order.returnRequest ? " order-card--returned" : ""}`}
        >
          <header className="order-card__head">
            <div className="order-card__who">
              <span className="order-card__name">{order.orderForName}</span>
              <Typography.Text
                type="secondary"
                className="order-card__email"
                copyable={{ text: order.orderEmail, tooltips: ["Kopyala", "Kopyalandı"] }}
              >
                {order.orderEmail}
              </Typography.Text>
            </div>
            <div className="order-card__meta">
              <span className="order-card__price">{formatMoney(order.orderPrice, order.store)}</span>
              <span className="order-card__date">{formatDate(order.orderDate)}</span>
            </div>
          </header>

          <div className="order-card__controls">
            <CargoSelect
              value={order.cargo ?? undefined}
              variant="filled"
              className="order-card__cargo"
              onChange={(cargo) => onPatch(order, { cargo: cargo ?? null }, "Kargo yadda saxlanıldı.")}
            />
            <StatusCheckbox
              order={order}
              field="deliveryReceived"
              label={order.deliveryReceived && order.deliveredAt ? `Təhvil · ${formatDate(order.deliveredAt)}` : "Təhvil"}
              onPatch={onPatch}
            />
            <StatusCheckbox order={order} field="returnRequest" label="Qaytarılma" onPatch={onPatch} />
            <label className="order-card__profit">
              <span>Qazanc</span>
              <ProfitInput order={order} onPatch={onPatch} />
            </label>
          </div>

          <NotesCell
            notes={order.customerNotes}
            onSave={(notes) => onPatch(order, { customerNotes: notes }, "Qeydlər yadda saxlanıldı.")}
          />

          <footer className="order-card__actions">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(order)}>
              Redaktə et
            </Button>
            <Popconfirm
              title="Sifariş silinsin?"
              description="Bu əməliyyat geri qaytarılmır."
              okText="Sil"
              cancelText="Ləğv et"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(order)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Sil
              </Button>
            </Popconfirm>
          </footer>
        </article>
      ))}

      {visibleCount < orders.length && (
        <Button block onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Daha çox göstər ({orders.length - visibleCount})
        </Button>
      )}
    </div>
  );
};

export default OrderCards;
