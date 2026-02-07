import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  message,
  List,
  Tag,
  Descriptions,
  Spin,
  Empty,
} from "antd";
import { SearchOutlined, RightOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { useApi } from "../hooks/useApi";
import {
  getOccupations,
  getJobRolesByOccupation,
  getJobRoleDetails,
  searchJobRoles,
  getRelatedJobRoles,
} from "../api/skillsService";
import type { Occupation, JobRole } from "../types";

const SkillsFramework: React.FC = () => {
  const occupationsApi = useApi();
  const jobRolesApi = useApi();
  const detailsApi = useApi();
  const searchApi = useApi();
  const relatedApi = useApi();

  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [searchResults, setSearchResults] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<Record<string, unknown> | null>(null);
  const [relatedRoles, setRelatedRoles] = useState<JobRole[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  // ---- List Occupations ----
  const handleListOccupations = async () => {
    try {
      const result = await occupationsApi.execute(() => getOccupations());
      const data = Array.isArray(result) ? result : [];
      setOccupations(data as Occupation[]);
      message.success(`Retrieved ${data.length} occupation(s)`);
    } catch {
      setOccupations([]);
    }
  };

  // ---- Get Job Roles by Occupation ----
  const handleGetJobRoles = async (occupationId: string) => {
    try {
      const result = await jobRolesApi.execute(() => getJobRolesByOccupation(occupationId));
      const data = Array.isArray(result) ? result : [];
      setJobRoles(data as JobRole[]);
    } catch {
      setJobRoles([]);
    }
  };

  // ---- Search Job Roles ----
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      message.warning("Please enter a search keyword");
      return;
    }

    try {
      const result = await searchApi.execute(() => searchJobRoles(searchKeyword));
      const data = Array.isArray(result) ? result : [];
      setSearchResults(data as JobRole[]);
      message.success(`Found ${data.length} job role(s)`);
    } catch {
      setSearchResults([]);
    }
  };

  // ---- View Job Role Details ----
  const handleViewDetails = async (id: string) => {
    try {
      const result = await detailsApi.execute(() => getJobRoleDetails({ id }));
      setSelectedJobRole(result as Record<string, unknown>);
    } catch {
      setSelectedJobRole(null);
    }
  };

  // ---- Get Related Job Roles ----
  const handleGetRelated = async (jobRoleId: string) => {
    try {
      const result = await relatedApi.execute(() => getRelatedJobRoles(jobRoleId));
      const data = Array.isArray(result) ? result : [];
      setRelatedRoles(data as JobRole[]);
    } catch {
      setRelatedRoles([]);
    }
  };

  const jobRoleColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 100 },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description", ellipsis: true },
    { title: "Sector", dataIndex: "sector", key: "sector" },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: JobRole) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetails(record.id)}>
            Details
          </Button>
          <Button size="small" onClick={() => handleGetRelated(record.id)}>
            Related
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Skills Framework"
        subtitle="Explore occupations, job roles, skills, and competencies"
        breadcrumb={[
          { label: "Dashboard", path: "/" },
          { label: "Skills Framework" },
        ]}
      />

      {/* Search Job Roles */}
      <Card title="Search Job Roles" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Search by keyword (e.g., software engineer)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 400 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={searchApi.loading}>
            Search
          </Button>
        </Space>
        {searchResults.length > 0 && (
          <Table
            dataSource={searchResults.map((r, i) => ({ ...r, key: i }))}
            columns={jobRoleColumns}
            style={{ marginTop: 16 }}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        )}
      </Card>

      {/* Browse Occupations */}
      <Card
        title="Browse Occupations"
        style={{ marginBottom: 16 }}
        extra={
          <Button onClick={handleListOccupations} loading={occupationsApi.loading}>
            Load Occupations
          </Button>
        }
      >
        {occupations.length > 0 ? (
          <List
            dataSource={occupations}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="view"
                    size="small"
                    icon={<RightOutlined />}
                    onClick={() => handleGetJobRoles(item.id)}
                    loading={jobRolesApi.loading}
                  >
                    View Job Roles
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={
                    <>
                      ID: {item.id}
                      {item.sector && <Tag style={{ marginLeft: 8 }}>{item.sector}</Tag>}
                    </>
                  }
                />
              </List.Item>
            )}
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="Click 'Load Occupations' to browse" />
        )}
      </Card>

      {/* Job Roles for Selected Occupation */}
      {jobRoles.length > 0 && (
        <Card title="Job Roles" style={{ marginBottom: 16 }}>
          <Table
            dataSource={jobRoles.map((r, i) => ({ ...r, key: i }))}
            columns={jobRoleColumns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}

      {/* Job Role Details */}
      {selectedJobRole && (
        <Card title="Job Role Details" style={{ marginBottom: 16 }}>
          <Spin spinning={detailsApi.loading}>
            <Descriptions bordered column={1}>
              {Object.entries(selectedJobRole).map(([key, value]) => (
                <Descriptions.Item label={key} key={key}>
                  {typeof value === "object" ? (
                    <pre style={{ margin: 0, fontSize: 12 }}>
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    String(value ?? "")
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Spin>
        </Card>
      )}

      {/* Related Job Roles */}
      {relatedRoles.length > 0 && (
        <Card title="Related Job Roles" style={{ marginBottom: 16 }}>
          <Table
            dataSource={relatedRoles.map((r, i) => ({ ...r, key: i }))}
            columns={jobRoleColumns.filter((c) => c.key !== "actions")}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
};

export default SkillsFramework;
