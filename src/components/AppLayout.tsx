import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  UserAddOutlined,
  FileTextOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/course-sessions", icon: <CalendarOutlined />, label: "Course Sessions" },
  { key: "/course-runs", icon: <BookOutlined />, label: "Course Runs" },
  { key: "/trainers", icon: <TeamOutlined />, label: "Trainers" },
  { key: "/enrolments", icon: <UserAddOutlined />, label: "Enrolments" },
  { key: "/assessments", icon: <FileTextOutlined />, label: "Assessments" },
  { key: "/skills-framework", icon: <ApartmentOutlined />, label: "Skills Framework" },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: collapsed ? 14 : 18,
            fontWeight: 700,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {collapsed ? "SSG" : "SSG TMS"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16 }}>
            SSG Training Management System
          </h2>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
