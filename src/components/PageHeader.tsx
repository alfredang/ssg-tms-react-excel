import React from "react";
import { Typography, Breadcrumb } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; path?: string }>;
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  extra,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && (
        <Breadcrumb
          style={{ marginBottom: 8 }}
          items={breadcrumb.map((item) => ({
            title: item.path ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              item.label
            ),
          }))}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          )}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
