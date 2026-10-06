import React from "react";
import { Badge, Select } from "antd";
import type { SelectProps } from "antd";
import { CARGO_OPTIONS, type Cargo } from "../../types/order";

const CARGO_COLORS: Record<Cargo, string> = {
  Aramex: "#e4002b",
  Cargomax: "#1677ff",
};

const options = CARGO_OPTIONS.map((cargo) => ({
  value: cargo,
  label: <Badge color={CARGO_COLORS[cargo]} text={cargo} />,
}));

type CargoSelectProps = Omit<SelectProps<Cargo>, "options">;

const CargoSelect: React.FC<CargoSelectProps> = (props) => (
  <Select<Cargo> placeholder="Seçin" allowClear options={options} {...props} />
);

export default CargoSelect;
