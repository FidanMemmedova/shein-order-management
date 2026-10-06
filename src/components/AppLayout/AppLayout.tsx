import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Layout, Menu } from "antd";
import { LogoutOutlined, PlusCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../lib/auth";
import { getLastStore, storeFromPath } from "../../lib/store";
import StoreSwitch from "../StoreSwitch/StoreSwitch";
import "./AppLayout.css";

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const email = session?.user.email ?? "";

  const store = storeFromPath(location.pathname) ?? getLastStore();
  const isFormPage = location.pathname.endsWith("/new");
  const pageSuffix = isFormPage ? "/new" : "";

  return (
    <Layout className="app-layout">
      <Layout.Header className="app-header">
        <div className="app-header__inner">
          <Link to={`/${store}`} className="brand">
            <span className="brand__mark">F</span>
            <span className="brand__text">
              Fidan <strong>Business</strong>
            </span>
          </Link>

          <StoreSwitch value={store} onChange={(next) => navigate(`/${next}${pageSuffix}`)} />

          <Menu
            mode="horizontal"
            className="app-nav"
            selectedKeys={[isFormPage ? "new" : "orders"]}
            items={[
              { key: "orders", icon: <UnorderedListOutlined />, label: "Sifarişlər" },
              { key: "new", icon: <PlusCircleOutlined />, label: "Yeni sifariş" },
            ]}
            onClick={({ key }) => navigate(key === "new" ? `/${store}/new` : `/${store}`)}
          />

          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "email", label: email, disabled: true },
                { type: "divider" },
                { key: "logout", icon: <LogoutOutlined />, label: "Çıxış", danger: true },
              ],
              onClick: ({ key }) => {
                if (key === "logout") void supabase.auth.signOut();
              },
            }}
          >
            <Button type="text" className="app-header__user" aria-label="Hesab">
              <Avatar size={30} className="app-header__avatar">
                {email.charAt(0).toUpperCase() || "F"}
              </Avatar>
            </Button>
          </Dropdown>
        </div>
      </Layout.Header>

      <Layout.Content className="app-content">
        <Outlet />
      </Layout.Content>
    </Layout>
  );
};

export default AppLayout;
