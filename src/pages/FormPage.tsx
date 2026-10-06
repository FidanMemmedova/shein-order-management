import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Card, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { createOrder, fetchOrders } from "../api/orders";
import LimitHint from "../components/LimitHint/LimitHint";
import OrderFields from "../components/OrderForm/OrderFields";
import { toOrderFields, type OrderFormValues } from "../components/OrderForm/formValues";
import StoreSwitch from "../components/StoreSwitch/StoreSwitch";
import { STORE_LABELS, type Order, type Store } from "../types/order";

interface FormPageProps {
  store: Store;
}

const FormPage: React.FC<FormPageProps> = ({ store }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<OrderFormValues>();
  const [saving, setSaving] = useState(false);
  // Hər iki mağazanın sifarişləri: təkliflər və aylıq $300 limiti üçün.
  const [orders, setOrders] = useState<Order[]>([]);

  const name = Form.useWatch("orderForName", form);
  const date = Form.useWatch("orderDate", form);
  const price = Form.useWatch("orderPrice", form);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((error) => console.error("Sifarişlər yüklənmədi:", error));
  }, []);

  const suggestions = useMemo(() => {
    const storeOrders = orders.filter((order) => order.store === store);
    return {
      emails: [...new Set(storeOrders.map((order) => order.orderEmail))],
      names: [...new Set(storeOrders.map((order) => order.orderForName))],
    };
  }, [orders, store]);

  const handleFinish = async (values: OrderFormValues) => {
    setSaving(true);
    try {
      const order = await createOrder({
        ...toOrderFields(values),
        store,
        cargo: null,
        deliveryReceived: false,
        deliveredAt: null,
        returnRequest: false,
        profit: null,
      });
      setOrders((list) => [order, ...list]);
      form.resetFields();
      message.success({
        content: (
          <span>
            {STORE_LABELS[store]} sifarişi əlavə edildi.{" "}
            <a className="message-link" onClick={() => navigate(`/${store}`)}>
              Sifarişlərə bax
            </a>
          </span>
        ),
      });
    } catch (error) {
      console.error("Sifariş əlavə edilmədi:", error);
      message.error("Sifariş əlavə edilmədi. Yenidən cəhd edin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page--narrow">
      <div className="page-header">
        <div>
          <h1>Yeni sifariş</h1>
          <p>Kargo, təhvil və qaytarılma sonradan sifarişlər cədvəlində qeyd olunur.</p>
        </div>
      </div>

      <Card className="surface-card">
        <Form<OrderFormValues>
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          initialValues={{ orderDate: dayjs(), customerNotes: [""] }}
          onFinish={handleFinish}
        >
          <Form.Item label="Mağaza">
            <StoreSwitch
              block
              size="large"
              value={store}
              onChange={(next) => navigate(`/${next}/new`, { replace: true })}
            />
          </Form.Item>
          <OrderFields
            store={store}
            emails={suggestions.emails}
            names={suggestions.names}
            nameHint={<LimitHint orders={orders} store={store} name={name} date={date} price={price} />}
          />
          <Button type="primary" htmlType="submit" block loading={saving} icon={<PlusOutlined />}>
            {STORE_LABELS[store]} sifarişini əlavə et
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default FormPage;
