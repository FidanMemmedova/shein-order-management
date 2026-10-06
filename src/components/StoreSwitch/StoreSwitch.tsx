import React from "react";
import { Segmented } from "antd";
import type { SegmentedProps } from "antd";
import { STORE_COLORS, STORE_LABELS, STORES, type Store } from "../../types/order";
import "./StoreSwitch.css";

// value/onChange istəyə bağlıdır ki, Form.Item içində də işləsin.
interface StoreSwitchProps {
  value?: Store;
  onChange?: (store: Store) => void;
  size?: SegmentedProps["size"];
  block?: boolean;
}

const options = STORES.map((store) => ({
  value: store,
  label: (
    <span className="store-switch__option">
      <span className="store-switch__dot" style={{ background: STORE_COLORS[store] }} />
      {STORE_LABELS[store]}
    </span>
  ),
}));

const StoreSwitch: React.FC<StoreSwitchProps> = ({ value, onChange, size, block }) => (
  <Segmented<Store>
    className="store-switch"
    options={options}
    value={value}
    size={size}
    block={block}
    onChange={onChange}
  />
);

export default StoreSwitch;
