import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, DatePicker, Empty, Grid, Input, Result, Segmented, Select, Spin } from "antd";
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { fetchOrders } from "../api/orders";
import PersonLimitCard from "../components/PersonLimitCard/PersonLimitCard";
import StatCard from "../components/StatCard/StatCard";
import { normalizeText } from "../lib/format";
import { AZN_PER_USD, MONTHLY_LIMIT_USD, formatUsd, monthlyUsage } from "../lib/limits";
import type { Order } from "../types/order";
import "./LimitsPage.css";

type Scope = "active" | "all";
type SortOrder = "free" | "full";

const LimitsPage: React.FC = () => {
  const isPhone = !(Grid.useBreakpoint().md ?? true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("free");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      setOrders(await fetchOrders());
    } catch (error) {
      console.error("Sifarişlər yüklənmədi:", error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const usage = useMemo(() => monthlyUsage(orders, month), [orders, month]);
  const active = usage.filter((person) => person.usedUsd > 0);

  const visible = useMemo(() => {
    const query = normalizeText(search.trim());
    const filtered = usage.filter(
      (person) => (scope === "all" || person.usedUsd > 0) && (!query || person.key.includes(query))
    );
    // usage ən boşdan ən doluya sıralanıb.
    return sortOrder === "free" ? filtered : [...filtered].reverse();
  }, [usage, scope, search, sortOrder]);

  if (loadFailed) {
    return (
      <Card className="surface-card">
        <Result
          status="error"
          title="Məlumatlar yüklənmədi"
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={loadOrders}>
              Yenidən cəhd et
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Aylıq limitlər</h1>
          <p>
            Bir şəxsin adına ayda ən çox ${MONTHLY_LIMIT_USD}-lıq bağlama göndərmək olar. Hesab sifariş tarixinə
            görə aparılır və hər ayın 1-də sıfırlanır.
          </p>
        </div>
        <DatePicker
          picker="month"
          allowClear={false}
          value={month}
          format="MMMM YYYY"
          onChange={(value) => value && setMonth(value.startOf("month"))}
          className="limits-month"
        />
      </div>

      <div className="limits-stats">
        <StatCard tone="neutral" icon={<TeamOutlined />} title="Sifariş verilən şəxslər" value={active.length} loading={loading} />
        <StatCard
          tone="orange"
          icon={<ExclamationCircleOutlined />}
          title="Limitə yaxın (70%+)"
          value={active.filter((person) => person.level === "near").length}
          loading={loading}
        />
        <StatCard
          tone="neutral"
          icon={<StopOutlined />}
          title="Limit dolub / aşılıb"
          value={active.filter((person) => person.level === "full" || person.level === "over").length}
          loading={loading}
        />
        <StatCard
          tone="blue"
          icon={<WalletOutlined />}
          title="Bu ay cəmi"
          value={formatUsd(active.reduce((sum, person) => sum + person.usedUsd, 0))}
          loading={loading}
        />
      </div>

      <Card className="surface-card limits-card">
        <div className="limits-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Şəxsin adı ilə axtar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="limits-toolbar__search"
          />
          <div className="limits-toolbar__controls">
            <Segmented<Scope>
              value={scope}
              onChange={setScope}
              options={[
                { value: "all", label: `Hamısı (${usage.length})` },
                { value: "active", label: `Bu ay sifarişi olanlar (${active.length})` },
              ]}
            />
            <Select<SortOrder>
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "free", label: "Ən çox boş yer əvvəldə" },
                { value: "full", label: "Ən dolu əvvəldə" },
              ]}
              className="limits-toolbar__sort"
            />
          </div>
        </div>

        <Alert
          type="info"
          showIcon
          className="limits-note"
          message={`Shein və iHerb sifarişləri birlikdə sayılır; iHerb məbləğləri 1 $ = ${AZN_PER_USD.toFixed(2)} ₼ ilə dollara çevrilir.`}
        />

        {loading ? (
          <div className="limits-state">
            <Spin />
          </div>
        ) : visible.length ? (
          <div className="limits-grid">
            {visible.map((person) => (
              <PersonLimitCard key={person.key} usage={person} compact={isPhone} />
            ))}
          </div>
        ) : (
          <div className="limits-state">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={search ? "Bu adla şəxs tapılmadı" : `${month.format("MMMM YYYY")} ayında sifariş yoxdur`}
            />
          </div>
        )}
      </Card>
    </>
  );
};

export default LimitsPage;
