import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App,
  Badge,
  Button,
  Card,
  DatePicker,
  Empty,
  FloatButton,
  Grid,
  Input,
  Result,
  Segmented,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloudDownloadOutlined,
  DollarOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  RiseOutlined,
  RollbackOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { deleteOrder, fetchOrders, updateOrder } from "../api/orders";
import { importFromMockApi } from "../api/legacyImport";
import EditOrderModal from "../components/OrderForm/EditOrderModal";
import OrdersTable from "../components/OrdersTable/OrdersTable";
import OrderCards from "../components/OrdersTable/OrderCards";
import StatCard from "../components/StatCard/StatCard";
import { exportOrdersCsv } from "../lib/exportCsv";
import { formatMoney } from "../lib/format";
import {
  STATUS_FILTERS,
  applyFilters,
  matchesStatus,
  type CargoFilter,
  type DateRange,
  type StatusFilter,
} from "../lib/orderFilters";
import {
  CARGO_OPTIONS,
  STORE_COLORS,
  STORE_LABELS,
  type Order,
  type OrderInput,
  type Store,
} from "../types/order";
import "./TablePage.css";

// Qaytarılanlar sonda, qalanları ən yenidən köhnəyə.
const byDefaultOrder = (a: Order, b: Order) =>
  Number(a.returnRequest) - Number(b.returnRequest) ||
  b.orderDate.localeCompare(a.orderDate) ||
  b.id - a.id;

const DATE_PRESETS: { label: string; value: [dayjs.Dayjs, dayjs.Dayjs] }[] = [
  { label: "Bu ay", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
  {
    label: "Keçən ay",
    value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")],
  },
  { label: "Son 30 gün", value: [dayjs().subtract(29, "day"), dayjs()] },
  { label: "Bu il", value: [dayjs().startOf("year"), dayjs().endOf("year")] },
];

// Telefonda iki aylıq təqvim sığmır, ona görə hazır dövrlərdən seçilir.
const PERIOD_OPTIONS = [
  { value: "all", label: "Bütün tarixlər" },
  ...DATE_PRESETS.map((preset, index) => ({ value: String(index), label: preset.label })),
];

const presetIndex = (range: DateRange) =>
  range
    ? DATE_PRESETS.findIndex(
        ({ value: [from, to] }) => from.isSame(range[0], "day") && to.isSame(range[1], "day")
      )
    : -1;

const CARGO_FILTER_OPTIONS: { value: CargoFilter; label: string }[] = [
  { value: "all", label: "Bütün kargolar" },
  ...CARGO_OPTIONS.map((cargo) => ({ value: cargo, label: cargo })),
  { value: "none", label: "Kargo seçilməyib" },
];

interface TablePageProps {
  store: Store;
}

const TablePage: React.FC<TablePageProps> = ({ store }) => {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.md ?? true;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [cargo, setCargo] = useState<CargoFilter>("all");
  const [range, setRange] = useState<DateRange>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Order | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      setOrders(await fetchOrders(store));
    } catch (error) {
      console.error("Sifarişlər yüklənmədi:", error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const replaceOrder = (order: Order) =>
    setOrders((list) => list.map((item) => (item.id === order.id ? order : item)));

  // Dəyişikliyi dərhal göstərir, xəta olarsa geri qaytarır.
  const patchOrder = async (order: Order, patch: Partial<OrderInput>, successText?: string) => {
    replaceOrder({ ...order, ...patch });
    try {
      replaceOrder(await updateOrder(order.id, patch));
      if (successText) message.success(successText);
      return true;
    } catch (error) {
      console.error("Yeniləmə xətası:", error);
      replaceOrder(order);
      message.error("Dəyişiklik yadda saxlanmadı.");
      return false;
    }
  };

  // Redaktədə mağaza dəyişibsə, sifariş bu siyahıdan çıxır.
  const handleSaved = (order: Order) => {
    if (order.store === store) {
      replaceOrder(order);
      return;
    }
    setOrders((list) => list.filter((item) => item.id !== order.id));
    message.info(`Sifariş ${STORE_LABELS[order.store]} bölməsinə köçürüldü.`);
  };

  const handleDelete = async (order: Order) => {
    try {
      await deleteOrder(order.id);
      setOrders((list) => list.filter((item) => item.id !== order.id));
      message.success("Sifariş silindi.");
    } catch (error) {
      console.error("Silinmə xətası:", error);
      message.error("Sifariş silinmədi.");
    }
  };

  const handleImport = () => {
    modal.confirm({
      title: "Köhnə sifarişlər köçürülsün?",
      content:
        "MockAPI-dəki bütün sifarişlər yeni bazaya əlavə olunacaq. Artıq köçürülmüş sifarişlər təkrar əlavə edilmir.",
      okText: "Köçür",
      cancelText: "Ləğv et",
      onOk: async () => {
        try {
          const count = await importFromMockApi();
          message.success(`${count} sifariş köçürüldü.`);
          await loadOrders();
        } catch (error) {
          console.error("Köçürmə xətası:", error);
          message.error("Köçürmə alınmadı. Yenidən cəhd edin.");
        }
      },
    });
  };

  const stats = useMemo(
    () => ({
      count: orders.length,
      total: orders.reduce((sum, order) => sum + order.orderPrice, 0),
      profit: orders.reduce((sum, order) => sum + (order.profit ?? 0), 0),
      delivered: orders.filter((order) => order.deliveryReceived).length,
      returned: orders.filter((order) => order.returnRequest).length,
    }),
    [orders]
  );

  const suggestions = useMemo(
    () => ({
      emails: [...new Set(orders.map((order) => order.orderEmail))],
      names: [...new Set(orders.map((order) => order.orderForName))],
    }),
    [orders]
  );

  // Axtarış / kargo / tarix tətbiq olunmuş siyahı — status tablarının sayları bundan hesablanır.
  const filteredOrders = useMemo(
    () => applyFilters(orders, { search, cargo, range }).sort(byDefaultOrder),
    [orders, search, cargo, range]
  );

  const visibleOrders = useMemo(
    () => filteredOrders.filter((order) => matchesStatus(order, status)),
    [filteredOrders, status]
  );

  const visibleTotal = visibleOrders.reduce((sum, order) => sum + order.orderPrice, 0);
  const visibleProfit = visibleOrders.reduce((sum, order) => sum + (order.profit ?? 0), 0);
  const hasFilters = Boolean(search.trim()) || cargo !== "all" || range !== null || status !== "all";

  const resetFilters = () => {
    setSearch("");
    setCargo("all");
    setRange(null);
    setStatus("all");
  };

  if (loadFailed) {
    return (
      <Card className="surface-card">
        <Result
          status="error"
          title="Sifarişlər yüklənmədi"
          subTitle="İnternet bağlantısını yoxlayıb yenidən cəhd edin."
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={loadOrders}>
              Yenidən cəhd et
            </Button>
          }
        />
      </Card>
    );
  }

  const emptyContent = hasFilters ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Filtrə uyğun sifariş tapılmadı">
      <Button onClick={resetFilters}>Filtrləri sıfırla</Button>
    </Empty>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`Hələ ${STORE_LABELS[store]} sifarişi yoxdur`}>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/${store}/new`)}>
          Yeni sifariş
        </Button>
        {store === "shein" && (
          <Button icon={<CloudDownloadOutlined />} onClick={handleImport}>
            Köhnə sifarişləri köçür
          </Button>
        )}
      </Space>
    </Empty>
  );

  const orderActions = { onPatch: patchOrder, onEdit: setEditing, onDelete: handleDelete };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="page-title__dot" style={{ background: STORE_COLORS[store] }} />
            {STORE_LABELS[store]} sifarişləri
          </h1>
          <p>Kargo seçin, statusları qeyd edin və müştəri qeydlərini birbaşa cədvəldə yeniləyin.</p>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate(`/${store}/new`)}>
          Yeni sifariş
        </Button>
      </div>

      <div className="stats-grid">
        <div className="stats-grid__profit">
          <StatCard
            tone="green"
            icon={<RiseOutlined />}
            title="Ümumi qazanc"
            value={formatMoney(stats.profit, store)}
            loading={loading}
          />
        </div>
        <StatCard tone="neutral" icon={<ShoppingOutlined />} title="Cəmi sifariş" value={stats.count} loading={loading} />
        <StatCard
          tone="blue"
          icon={<DollarOutlined />}
          title="Ümumi məbləğ"
          value={formatMoney(stats.total, store)}
          loading={loading}
        />
        <StatCard
          tone="teal"
          icon={<CheckCircleOutlined />}
          title="Təhvil alınıb"
          value={stats.delivered}
          hint={`/ ${stats.count}`}
          loading={loading}
        />
        <StatCard tone="orange" icon={<RollbackOutlined />} title="Qaytarılma" value={stats.returned} loading={loading} />
      </div>

      <Card className="surface-card orders-card">
        <div className="orders-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Ad, e-mail və ya qeyd üzrə axtar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="orders-toolbar__search"
          />
          {isDesktop ? (
            <DatePicker.RangePicker
              value={range}
              onChange={(dates) => setRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null)}
              presets={DATE_PRESETS}
              format="DD.MM.YYYY"
              placeholder={["Başlanğıc", "Son tarix"]}
              className="orders-toolbar__range"
            />
          ) : (
            filtersOpen && (
              <Select
                value={range ? (presetIndex(range) >= 0 ? String(presetIndex(range)) : "custom") : "all"}
                onChange={(value) => setRange(value === "all" ? null : DATE_PRESETS[Number(value)].value)}
                options={
                  range && presetIndex(range) < 0
                    ? [...PERIOD_OPTIONS, { value: "custom", label: "Seçilmiş aralıq", disabled: true }]
                    : PERIOD_OPTIONS
                }
                className="orders-toolbar__range"
              />
            )
          )}
          {(isDesktop || filtersOpen) && (
            <Select<CargoFilter>
              value={cargo}
              onChange={setCargo}
              options={CARGO_FILTER_OPTIONS}
              className="orders-toolbar__cargo"
            />
          )}
          <div className="orders-toolbar__actions">
            {!isDesktop && (
              <Badge dot={range !== null || cargo !== "all"}>
                <Button
                  icon={<FilterOutlined />}
                  type={filtersOpen ? "primary" : "default"}
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  Filtrlər
                </Button>
              </Badge>
            )}
            <Tooltip title="Görünən sifarişləri Excel (CSV) faylı kimi yüklə">
              <Button
                icon={<DownloadOutlined />}
                aria-label="Excel"
                disabled={!visibleOrders.length}
                onClick={() => exportOrdersCsv(visibleOrders, store)}
              >
                {isDesktop && "Excel"}
              </Button>
            </Tooltip>
            <Tooltip title="Yenilə">
              <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading} aria-label="Yenilə" />
            </Tooltip>
          </div>
        </div>

        <div className="orders-subbar">
          <Segmented<StatusFilter>
            value={status}
            onChange={setStatus}
            options={STATUS_FILTERS.map(({ value, label }) => ({
              value,
              label: (
                <span className="status-tab">
                  {label}
                  <span className="status-tab__count">
                    {filteredOrders.filter((order) => matchesStatus(order, value)).length}
                  </span>
                </span>
              ),
            }))}
            className="orders-subbar__tabs"
          />
          <div className="orders-subbar__summary">
            <span>
              <strong>{visibleOrders.length}</strong> sifariş
            </span>
            <span className="orders-subbar__divider" />
            <span>
              Cəmi <strong>{formatMoney(visibleTotal, store)}</strong>
            </span>
            <span className="orders-subbar__divider" />
            <span>
              Qazanc <strong className="orders-subbar__profit">{formatMoney(visibleProfit, store)}</strong>
            </span>
            {hasFilters && (
              <Button type="link" size="small" onClick={resetFilters}>
                Sıfırla
              </Button>
            )}
          </div>
        </div>

        {isDesktop ? (
          <OrdersTable orders={visibleOrders} loading={loading} emptyContent={emptyContent} {...orderActions} />
        ) : (
          <OrderCards orders={visibleOrders} loading={loading} emptyContent={emptyContent} {...orderActions} />
        )}
      </Card>

      {!isDesktop && (
        <FloatButton
          type="primary"
          icon={<PlusOutlined />}
          tooltip="Yeni sifariş"
          onClick={() => navigate(`/${store}/new`)}
        />
      )}

      <EditOrderModal
        order={editing}
        emails={suggestions.emails}
        names={suggestions.names}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </>
  );
};

export default TablePage;
