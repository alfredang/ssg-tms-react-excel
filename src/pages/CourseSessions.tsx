import React, { useState } from "react";
import { Form, Input, Button, Table, Card, DatePicker, Space, message, Switch } from "antd";
import type { Dayjs } from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import ExcelUpload from "../components/ExcelUpload";
import { useApi } from "../hooks/useApi";
import { getCourseSessions } from "../api/courseService";
import { parseCourseSessionsSheet } from "../utils/excelParser";
import type { CourseSession, ValidationError } from "../types";

const CourseSessions: React.FC = () => {
  const [form] = Form.useForm();
  const { data, loading, execute } = useApi();
  const [sessions, setSessions] = useState<CourseSession[]>([]);

  const handleSearch = async (values: {
    runId: string;
    courseReferenceNumber: string;
    sessionMonth?: Dayjs;
    includeExpired?: boolean;
  }) => {
    const uen = import.meta.env.VITE_SSG_UEN || "";
    const sessionMonth = values.sessionMonth
      ? values.sessionMonth.format("MMYYYY")
      : undefined;

    try {
      const result = await execute(() =>
        getCourseSessions({
          runId: values.runId,
          uen,
          courseReferenceNumber: values.courseReferenceNumber,
          sessionMonth,
          includeExpiredCourses: values.includeExpired,
        })
      );
      setSessions(Array.isArray(result) ? result : []);
      message.success("Sessions retrieved successfully");
    } catch {
      // Error handled by interceptor
    }
  };

  const handleExcelData = (_sheetName: string, excelData: unknown[]) => {
    const parsed = parseCourseSessionsSheet(
      excelData as Record<string, unknown>[]
    );

    if (parsed.errors.length > 0) {
      message.warning(`${parsed.errors.length} validation error(s) found`);
    }

    setSessions(parsed.data);
    message.success(`Loaded ${parsed.data.length} session(s) from Excel`);
  };

  const handleValidate = (
    _sheetName: string,
    excelData: unknown[]
  ): ValidationError[] => {
    const parsed = parseCourseSessionsSheet(
      excelData as Record<string, unknown>[]
    );
    return parsed.errors;
  };

  const columns = [
    { title: "Session ID", dataIndex: "sessionId", key: "sessionId" },
    { title: "Start Date", dataIndex: "startDate", key: "startDate" },
    { title: "End Date", dataIndex: "endDate", key: "endDate" },
    { title: "Start Time", dataIndex: "startTime", key: "startTime" },
    { title: "End Time", dataIndex: "endTime", key: "endTime" },
    { title: "Mode of Training", dataIndex: "modeOfTraining", key: "modeOfTraining" },
    {
      title: "Venue",
      key: "venue",
      render: (_: unknown, record: CourseSession) => {
        const v = record.venue;
        if (!v) return "-";
        return [v.block, v.street, v.building, v.postalCode]
          .filter(Boolean)
          .join(", ");
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Course Sessions"
        subtitle="Retrieve course sessions or upload from Excel"
        breadcrumb={[
          { label: "Dashboard", path: "/" },
          { label: "Course Sessions" },
        ]}
      />

      <Card title="Retrieve Course Sessions" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item
            name="runId"
            label="Run ID"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Enter Course Run ID" />
          </Form.Item>
          <Form.Item
            name="courseReferenceNumber"
            label="Course Ref No."
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Enter Course Reference Number" />
          </Form.Item>
          <Form.Item name="sessionMonth" label="Month/Year">
            <DatePicker picker="month" format="MM/YYYY" />
          </Form.Item>
          <Form.Item name="includeExpired" label="Include Expired" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              Search
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="Upload Sessions from Excel"
        style={{ marginBottom: 16 }}
        extra={
          <ExcelUpload
            onDataReady={handleExcelData}
            onValidate={handleValidate}
            acceptedSheets={["session", "sessions"]}
            title="Upload Sessions"
          />
        }
      >
        {sessions.length > 0 && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <p>{sessions.length} session(s) loaded</p>
          </Space>
        )}
      </Card>

      <Card title="Session Results">
        <Table
          dataSource={sessions.map((s, i) => ({ ...s, key: i }))}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: data === null ? "Search to view sessions" : "No sessions found" }}
        />
      </Card>
    </div>
  );
};

export default CourseSessions;
