import React from "react";
import { Card, Col, Row } from "antd";
import {
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  UserAddOutlined,
  FileTextOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const modules = [
  {
    key: "/course-sessions",
    title: "Course Sessions",
    description: "View and upload course session details",
    icon: <CalendarOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
  },
  {
    key: "/course-runs",
    title: "Course Runs",
    description: "Publish, edit, delete and view course runs",
    icon: <BookOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
  },
  {
    key: "/trainers",
    title: "Trainers",
    description: "Manage trainer profiles and qualifications",
    icon: <TeamOutlined style={{ fontSize: 32, color: "#fa8c16" }} />,
  },
  {
    key: "/enrolments",
    title: "Enrolments",
    description: "Create, update, cancel, and search enrolments",
    icon: <UserAddOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
  },
  {
    key: "/assessments",
    title: "Assessments",
    description: "Create, update, void, and search assessments",
    icon: <FileTextOutlined style={{ fontSize: 32, color: "#eb2f96" }} />,
  },
  {
    key: "/skills-framework",
    title: "Skills Framework",
    description: "Explore occupations, job roles, and skills",
    icon: <ApartmentOutlined style={{ fontSize: 32, color: "#13c2c2" }} />,
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="SSG Training Management System — Select a module to get started"
      />

      <Row gutter={[16, 16]}>
        {modules.map((mod) => (
          <Col xs={24} sm={12} lg={8} key={mod.key}>
            <Card
              hoverable
              onClick={() => navigate(mod.key)}
              style={{ height: "100%" }}
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                {mod.icon}
                <h3 style={{ margin: "12px 0 4px" }}>{mod.title}</h3>
                <p style={{ color: "#666", margin: 0 }}>{mod.description}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
