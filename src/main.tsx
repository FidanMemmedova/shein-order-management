import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App as AntApp, ConfigProvider } from "antd";
import azAZ from "antd/locale/az_AZ";
import dayjs from "dayjs";
import "dayjs/locale/az";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App.tsx";

dayjs.locale("az");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={azAZ}
      theme={{
        token: {
          colorPrimary: "#18181b",
          colorLink: "#18181b",
          colorTextBase: "#18181b",
          borderRadius: 8,
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        },
        components: {
          Layout: { headerBg: "transparent", bodyBg: "transparent" },
          Menu: { itemBg: "transparent", horizontalItemSelectedColor: "#18181b" },
          Table: { headerBg: "#fafafa", rowHoverBg: "#fafafa" },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>
);
