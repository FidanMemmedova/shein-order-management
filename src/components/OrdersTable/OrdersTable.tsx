import React from "react";
import { Button, Popconfirm, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CargoSelect from "../CargoSelect/CargoSelect";
import NotesCell from "../NotesEditor/NotesCell";
import StatusCheckbox from "./StatusCheckbox";
import ProfitInput from "./ProfitInput";
import { formatDate, formatMoney } from "../../lib/format";
import type { Order, OrderInput } from "../../types/order";
import "./OrdersTable.css";

export interface OrderActions {
  onPatch: (order: Order, patch: Partial<OrderInput>, successText?: string) => Promise<boolean>;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => Promise<void>;
}

interface OrdersTableProps extends OrderActions {
  orders: Order[];
  loading: boolean;
  emptyContent: React.ReactNode;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  emptyContent,
  onPatch,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<Order> = [
    {
      title: "Tarix",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 105,
      render: (date: string) => <span className="cell-date">{formatDate(date)}</span>,
      sorter: (a, b) => a.orderDate.localeCompare(b.orderDate),
    },
    {
      title: "Sifariş edilən şəxs",
      key: "customer",
      width: 220,
      sorter: (a, b) => a.orderForName.localeCompare(b.orderForName, "az"),
      render: (_, order) => (
        <div className="cell-customer">
          <span className="cell-customer__name">{order.orderForName}</span>
          <Typography.Text
            type="secondary"
            className="cell-customer__email"
            copyable={{ text: order.orderEmail, tooltips: ["Kopyala", "Kopyalandı"] }}
          >
            {order.orderEmail}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Qiymət",
      dataIndex: "orderPrice",
      key: "orderPrice",
      width: 100,
      align: "right",
      render: (price: number, order) => <span className="cell-price">{formatMoney(price, order.store)}</span>,
      sorter: (a, b) => a.orderPrice - b.orderPrice,
    },
    {
      title: "Kargo",
      dataIndex: "cargo",
      key: "cargo",
      width: 140,
      render: (_, order) => (
        <CargoSelect
          value={order.cargo ?? undefined}
          variant="filled"
          style={{ width: "100%" }}
          onChange={(cargo) => onPatch(order, { cargo: cargo ?? null }, "Kargo yadda saxlanıldı.")}
        />
      ),
    },
    {
      title: <Tooltip title="Təhvil alındı">Təhvil</Tooltip>,
      key: "deliveryReceived",
      width: 88,
      align: "center",
      render: (_, order) => <StatusCheckbox order={order} field="deliveryReceived" onPatch={onPatch} />,
    },
    {
      title: "Qaytarılma",
      key: "returnRequest",
      width: 104,
      align: "center",
      render: (_, order) => <StatusCheckbox order={order} field="returnRequest" onPatch={onPatch} />,
    },
    {
      title: "Qazanc",
      dataIndex: "profit",
      key: "profit",
      width: 124,
      sorter: (a, b) => (a.profit ?? -Infinity) - (b.profit ?? -Infinity),
      render: (_, order) => <ProfitInput order={order} onPatch={onPatch} />,
    },
    {
      title: "Müştəri qeydləri",
      key: "customerNotes",
      width: 300,
      render: (_, order) => (
        <NotesCell
          notes={order.customerNotes}
          onSave={(notes) => onPatch(order, { customerNotes: notes }, "Qeydlər yadda saxlanıldı.")}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 88,
      fixed: "right",
      align: "center",
      render: (_, order) => (
        <Space size={2}>
          <Tooltip title="Redaktə et">
            <Button type="text" icon={<EditOutlined />} aria-label="Redaktə et" onClick={() => onEdit(order)} />
          </Tooltip>
          <Popconfirm
            title="Sifariş silinsin?"
            description="Bu əməliyyat geri qaytarılmır."
            okText="Sil"
            cancelText="Ləğv et"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(order)}
          >
            <Tooltip title="Sil">
              <Button type="text" danger icon={<DeleteOutlined />} aria-label="Sil" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<Order>
      className="orders-table"
      columns={columns}
      dataSource={orders}
      loading={loading}
      rowKey="id"
      rowClassName={(order) => (order.returnRequest ? "orders-table__row--returned" : "")}
      scroll={{ x: 1270 }}
      sticky={{ offsetHeader: 64 }}
      locale={{ emptyText: emptyContent }}
      pagination={{
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        showSizeChanger: true,
        showTotal: (total, [from, to]) => `${from}–${to} / ${total} sifariş`,
      }}
    />
  );
};

export default OrdersTable;
