import React, { useState } from "react";
import { App, Checkbox, Col, DatePicker, Form, InputNumber, Modal, Row } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { updateOrder } from "../../api/orders";
import { STORE_CURRENCY, type Order, type Store } from "../../types/order";
import CargoSelect from "../CargoSelect/CargoSelect";
import StoreSwitch from "../StoreSwitch/StoreSwitch";
import OrderFields from "./OrderFields";
import { toOrderFields, type OrderFormValues } from "./formValues";

interface EditOrderModalProps {
  order: Order | null;
  emails: string[];
  names: string[];
  onClose: () => void;
  onSaved: (order: Order) => void;
}

type EditValues = OrderFormValues & { store: Store; profit?: number | null; deliveredAt?: Dayjs | null };

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, emails, names, onClose, onSaved }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<EditValues>();
  const [saving, setSaving] = useState(false);
  // Qiymətin valyutası seçilmiş mağazaya görə dəyişir ($ / ₼).
  const selectedStore = Form.useWatch("store", form) ?? order?.store ?? "shein";
  const delivered = Form.useWatch("deliveryReceived", form) ?? order?.deliveryReceived ?? false;

  const handleSave = async () => {
    if (!order) return;
    let values: EditValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateOrder(order.id, {
        ...toOrderFields(values),
        store: values.store,
        cargo: values.cargo ?? null,
        deliveryReceived: Boolean(values.deliveryReceived),
        // Təhvil alınıbsa və tarix yazılmayıbsa, bu günü götürürük (limit hesabı üçün).
        deliveredAt: values.deliveryReceived
          ? (values.deliveredAt ?? dayjs()).format("YYYY-MM-DD")
          : null,
        returnRequest: Boolean(values.returnRequest),
        profit: values.profit ?? null,
      });
      onSaved(updated);
      message.success("Sifariş yeniləndi.");
      onClose();
    } catch (error) {
      console.error("Yeniləmə xətası:", error);
      message.error("Sifariş yenilənmədi. Yenidən cəhd edin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(order)}
      title="Sifarişi redaktə et"
      okText="Yadda saxla"
      cancelText="Bağla"
      width={620}
      confirmLoading={saving}
      onOk={handleSave}
      onCancel={onClose}
      destroyOnClose
    >
      {order && (
        <Form<EditValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onValuesChange={(changed: Partial<EditValues>) => {
            // Təhvil ləğv olunursa, qaytarılma da ləğv olunur.
            if (changed.deliveryReceived === false) form.setFieldValue("returnRequest", false);
          }}
          initialValues={{
            ...order,
            orderDate: dayjs(order.orderDate),
            deliveredAt: order.deliveredAt ? dayjs(order.deliveredAt) : null,
            customerNotes: order.customerNotes.length ? order.customerNotes : [""],
          }}
        >
          <Form.Item
            label="Mağaza"
            name="store"
            extra="Sifariş səhv bölmədədirsə, buradan digər mağazaya keçirin."
          >
            <StoreSwitch block />
          </Form.Item>
          <OrderFields
            store={selectedStore}
            emails={emails}
            names={names}
            extra={
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Kargo" name="cargo">
                    <CargoSelect placeholder="Seçilməyib" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={`Qazanc (${STORE_CURRENCY[selectedStore]})`} name="profit">
                    <InputNumber<number>
                      {...(STORE_CURRENCY[selectedStore] === "AZN" ? { suffix: "₼" } : { prefix: "$" })}
                      precision={2}
                      step={0.01}
                      placeholder="0.00"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={delivered ? 12 : 24}>
                  <Form.Item label="Status">
                    <div className="status-checks">
                      <Form.Item name="deliveryReceived" valuePropName="checked" noStyle>
                        <Checkbox>Təhvil alındı</Checkbox>
                      </Form.Item>
                      <Form.Item name="returnRequest" valuePropName="checked" noStyle>
                        <Checkbox disabled={!delivered}>Qaytarılma</Checkbox>
                      </Form.Item>
                    </div>
                  </Form.Item>
                </Col>
                {delivered && (
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Təhvil tarixi"
                      name="deliveredAt"
                      tooltip="Aylıq $300 limiti bağlamanın təhvil alındığı aya sayılır."
                    >
                      <DatePicker format="DD.MM.YYYY" placeholder="Bu gün" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            }
          />
        </Form>
      )}
    </Modal>
  );
};

export default EditOrderModal;
