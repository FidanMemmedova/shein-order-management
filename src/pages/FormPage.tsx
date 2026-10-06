import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Card, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { createOrder, fetchSuggestions } from "../api/orders";
import OrderFields from "../components/OrderForm/OrderFields";
import { toOrderFields, type OrderFormValues } from "../components/OrderForm/formValues";
import StoreSwitch from "../components/StoreSwitch/StoreSwitch";
import { STORE_LABELS, type Store } from "../types/order";

const addUnique = (list: string[], value: string) =>
  list.includes(value) ? list : [value, ...list];

interface FormPageProps {
  store: Store;
}

const FormPage: React.FC<FormPageProps> = ({ store }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<OrderFormValues>();
  const [saving, setSaving] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetchSuggestions(store)
      .then((suggestions) => {
        if (!active) return;
        setEmails(suggestions.emails);
        setNames(suggestions.names);
      })
      .catch((error) => console.error("Təkliflər yüklənmədi:", error));
    return () => {
      active = false;
    };
  }, [store]);

  const handleFinish = async (values: OrderFormValues) => {
    setSaving(true);
    try {
      const order = await createOrder({
        ...toOrderFields(values),
        store,
        cargo: null,
        deliveryReceived: false,
        returnRequest: false,
        profit: null,
      });
      setEmails((list) => addUnique(list, order.orderEmail));
      setNames((list) => addUnique(list, order.orderForName));
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
          <OrderFields store={store} emails={emails} names={names} />
          <Button type="primary" htmlType="submit" block loading={saving} icon={<PlusOutlined />}>
            {STORE_LABELS[store]} sifarişini əlavə et
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default FormPage;
