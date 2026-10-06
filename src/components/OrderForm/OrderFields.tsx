import React from "react";
import { AutoComplete, Col, DatePicker, Form, InputNumber, Row } from "antd";
import NotesEditor from "../NotesEditor/NotesEditor";
import { normalizeText } from "../../lib/format";
import { STORE_CURRENCY, type Store } from "../../types/order";

interface OrderFieldsProps {
  store: Store;
  emails?: string[];
  names?: string[];
  /** Qeydlərdən əvvəl göstəriləcək əlavə sahələr (məs. redaktədə kargo və statuslar). */
  extra?: React.ReactNode;
}

const toOptions = (values: string[]) => values.map((value) => ({ value }));

const matches = (input: string, option?: { value: string }) =>
  normalizeText(option?.value ?? "").includes(normalizeText(input));

const OrderFields: React.FC<OrderFieldsProps> = ({ store, emails = [], names = [], extra }) => (
  <>
    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Sifariş tarixi"
          name="orderDate"
          rules={[{ required: true, message: "Tarixi seçin" }]}
        >
          <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label={`Qiymət (${STORE_CURRENCY[store]})`}
          name="orderPrice"
          rules={[{ required: true, message: "Qiyməti daxil edin" }]}
        >
          <InputNumber<number>
            {...(STORE_CURRENCY[store] === "AZN" ? { suffix: "₼" } : { prefix: "$" })}
            min={0}
            step={0.01}
            precision={2}
            placeholder="0.00"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item
      label="E-mail"
      name="orderEmail"
      rules={[
        { required: true, message: "E-maili daxil edin" },
        { type: "email", message: "E-mail düzgün deyil" },
      ]}
    >
      <AutoComplete
        options={toOptions(emails)}
        filterOption={matches}
        placeholder="Sifarişin verildiyi e-mail"
      />
    </Form.Item>

    <Form.Item
      label="Sifariş edilən şəxs"
      name="orderForName"
      rules={[{ required: true, whitespace: true, message: "Adı daxil edin" }]}
    >
      <AutoComplete options={toOptions(names)} filterOption={matches} placeholder="Ad və soyad" />
    </Form.Item>

    {extra}

    <Form.Item
      label="Müştəri qeydləri"
      name="customerNotes"
      extra="Bağlamada bir neçə müştəri varsa, hər biri üçün «Müştəri əlavə et» ilə ayrıca qutu açın."
    >
      <NotesEditor />
    </Form.Item>
  </>
);

export default OrderFields;
