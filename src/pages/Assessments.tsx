import React, { useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Table,
  Card,
  Select,
  InputNumber,
  DatePicker,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  StopOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { useApi } from "../hooks/useApi";
import {
  createAssessment,
  updateAssessment,
  voidAssessment,
  searchAssessment,
  viewAssessment,
} from "../api/assessmentService";
import { validateAssessment } from "../utils/validators";
import {
  IdType,
  IdTypeLabels,
  Grade,
  Results,
  SortField,
  SortOrder,
} from "../types";
import type {
  CreateAssessmentPayload,
  UpdateVoidAssessmentPayload,
  SearchAssessmentPayload,
  AssessmentRecord,
} from "../types";
import dayjs from "dayjs";

const Assessments: React.FC = () => {
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [voidForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const createApi = useApi();
  const updateApi = useApi();
  const voidApi = useApi();
  const searchApi = useApi();
  const viewApi = useApi();

  const [searchResults, setSearchResults] = useState<AssessmentRecord[]>([]);
  const [viewResult, setViewResult] = useState<Record<string, unknown> | null>(null);

  const idTypeOptions = Object.entries(IdTypeLabels).map(([v, l]) => ({ value: v, label: l }));
  const gradeOptions = Object.values(Grade).map((v) => ({ value: v, label: v }));
  const resultOptions = Object.values(Results).map((v) => ({ value: v, label: v }));
  const sortFieldOptions = Object.entries(SortField).map(([k, v]) => ({ value: v, label: k }));
  const sortOrderOptions = Object.entries(SortOrder).map(([k, v]) => ({ value: v, label: k }));

  // ---- Create ----
  const handleCreate = async (values: Record<string, unknown>) => {
    const payload: CreateAssessmentPayload = {
      assessment: {
        course: {
          runId: values.courseRunId as string,
          referenceNumber: values.courseRefNumber as string,
        },
        result: values.result as string,
        grade: values.grade as string,
        score: values.score as number,
        assessmentDate: (values.assessmentDate as dayjs.Dayjs)?.format("YYYY-MM-DD") || "",
        skillCode: values.skillCode as string,
        trainee: {
          id: values.traineeId as string,
          idType: {
            code: values.traineeIdType as string,
            description: IdTypeLabels[values.traineeIdType as IdType] || "",
          },
          fullName: values.traineeFullName as string,
        },
        trainingPartner: {
          code: values.tpCode as string,
          uen: values.tpUen as string,
        },
        conferringInstitute: values.conferringInstCode
          ? { code: values.conferringInstCode as string }
          : undefined,
      },
    };

    const validation = validateAssessment(payload.assessment);
    if (!validation.valid) {
      validation.errors.forEach((e) => message.error(`${e.field}: ${e.message}`));
      return;
    }

    try {
      await createApi.execute(() => createAssessment(payload));
      message.success("Assessment created successfully");
      createForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Update ----
  const handleUpdate = async (values: Record<string, unknown>) => {
    const refNum = values.updateRefNum as string;
    const payload: UpdateVoidAssessmentPayload = {
      assessment: {
        action: "update",
        result: values.updateResult as string,
        grade: values.updateGrade as string,
        score: values.updateScore as number,
        assessmentDate: (values.updateDate as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        skillCode: values.updateSkillCode as string,
      },
    };

    try {
      await updateApi.execute(() => updateAssessment(refNum, payload));
      message.success("Assessment updated successfully");
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Void ----
  const handleVoid = async (values: { voidRefNum: string }) => {
    const payload: UpdateVoidAssessmentPayload = {
      assessment: { action: "void" },
    };

    try {
      await voidApi.execute(() => voidAssessment(values.voidRefNum, payload));
      message.success("Assessment voided successfully");
      voidForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Search ----
  const handleSearch = async (values: Record<string, unknown>) => {
    const payload: SearchAssessmentPayload = {
      meta: {
        lastUpdateDateFrom: (values.dateFrom as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        lastUpdateDateTo: (values.dateTo as dayjs.Dayjs)?.format("YYYY-MM-DD"),
      },
      sortBy: values.sortField
        ? { field: values.sortField as string, order: (values.sortOrder as string) || "desc" }
        : undefined,
      parameters: {
        page: (values.page as number) || 0,
        pageSize: (values.pageSize as number) || 20,
      },
      assessment: {
        course: values.searchCourseRunId
          ? { runId: values.searchCourseRunId as string, referenceNumber: values.searchCourseRef as string }
          : undefined,
        trainee: values.searchTraineeId
          ? { id: values.searchTraineeId as string }
          : undefined,
        skillCode: values.searchSkillCode as string,
        trainingPartner: values.searchTpUen
          ? { uen: values.searchTpUen as string, code: values.searchTpCode as string }
          : undefined,
      },
    };

    try {
      const result = await searchApi.execute(() => searchAssessment(payload));
      const data = result as { data?: AssessmentRecord[] };
      setSearchResults(Array.isArray(data?.data) ? data.data : Array.isArray(result) ? result as AssessmentRecord[] : []);
      message.success("Search completed");
    } catch {
      setSearchResults([]);
    }
  };

  // ---- View ----
  const handleView = async (values: { viewRefNum: string }) => {
    try {
      const result = await viewApi.execute(() => viewAssessment(values.viewRefNum));
      setViewResult(result as Record<string, unknown>);
      message.success("Assessment details retrieved");
    } catch {
      setViewResult(null);
    }
  };

  const searchColumns = [
    { title: "Reference Number", dataIndex: "referenceNumber", key: "referenceNumber" },
    {
      title: "Course Run ID",
      key: "courseRunId",
      render: (_: unknown, r: AssessmentRecord) => r.course?.runId,
    },
    { title: "Result", dataIndex: "result", key: "result" },
    { title: "Grade", dataIndex: "grade", key: "grade" },
    { title: "Score", dataIndex: "score", key: "score" },
    { title: "Assessment Date", dataIndex: "assessmentDate", key: "assessmentDate" },
    {
      title: "Trainee",
      key: "trainee",
      render: (_: unknown, r: AssessmentRecord) => r.trainee?.fullName,
    },
    { title: "Skill Code", dataIndex: "skillCode", key: "skillCode" },
  ];

  const tabItems = [
    {
      key: "create",
      label: "Create",
      children: (
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Card title="Course Information" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="courseRunId" label="Course Run ID" rules={[{ required: true }]}>
                <Input placeholder="Course Run ID" />
              </Form.Item>
              <Form.Item name="courseRefNumber" label="Course Reference Number" rules={[{ required: true }]}>
                <Input placeholder="e.g., TGS-2020123456" />
              </Form.Item>
            </Space>
          </Card>
          <Card title="Assessment Details" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="result" label="Result" rules={[{ required: true }]}>
                <Select options={resultOptions} style={{ width: 120 }} />
              </Form.Item>
              <Form.Item name="grade" label="Grade">
                <Select options={gradeOptions} style={{ width: 100 }} allowClear />
              </Form.Item>
              <Form.Item name="score" label="Score">
                <InputNumber min={0} max={999} />
              </Form.Item>
              <Form.Item name="assessmentDate" label="Assessment Date" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item name="skillCode" label="Skill Code">
                <Input placeholder="Skill code (optional)" />
              </Form.Item>
            </Space>
          </Card>
          <Card title="Trainee Information" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="traineeId" label="Trainee ID" rules={[{ required: true }]}>
                <Input placeholder="NRIC/FIN" />
              </Form.Item>
              <Form.Item name="traineeIdType" label="ID Type" rules={[{ required: true }]}>
                <Select options={idTypeOptions} style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="traineeFullName" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Trainee full name" />
              </Form.Item>
            </Space>
          </Card>
          <Card title="Training Partner" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="tpCode" label="TP Code" rules={[{ required: true }]}>
                <Input placeholder="Training Partner Code" />
              </Form.Item>
              <Form.Item name="tpUen" label="TP UEN">
                <Input placeholder="Training Partner UEN" />
              </Form.Item>
              <Form.Item name="conferringInstCode" label="Conferring Institute Code">
                <Input placeholder="Optional" />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createApi.loading}>
              Create Assessment
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "update",
      label: "Update",
      children: (
        <Form form={updateForm} layout="vertical" onFinish={handleUpdate}>
          <Card style={{ marginBottom: 16 }}>
            <Form.Item name="updateRefNum" label="Assessment Reference Number" rules={[{ required: true }]}>
              <Input placeholder="Reference number to update" />
            </Form.Item>
            <Space wrap>
              <Form.Item name="updateResult" label="Result">
                <Select options={resultOptions} style={{ width: 120 }} allowClear />
              </Form.Item>
              <Form.Item name="updateGrade" label="Grade">
                <Select options={gradeOptions} style={{ width: 100 }} allowClear />
              </Form.Item>
              <Form.Item name="updateScore" label="Score">
                <InputNumber min={0} max={999} />
              </Form.Item>
              <Form.Item name="updateDate" label="Assessment Date">
                <DatePicker />
              </Form.Item>
              <Form.Item name="updateSkillCode" label="Skill Code">
                <Input />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<EditOutlined />} loading={updateApi.loading}>
              Update Assessment
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "void",
      label: "Void",
      children: (
        <Form form={voidForm} layout="inline" onFinish={handleVoid}>
          <Form.Item name="voidRefNum" label="Reference Number" rules={[{ required: true }]}>
            <Input placeholder="Assessment reference to void" />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="Are you sure you want to void this assessment?"
              onConfirm={() => voidForm.submit()}
              okText="Yes, Void It"
              cancelText="No"
              okType="danger"
            >
              <Button danger icon={<StopOutlined />} loading={voidApi.loading}>
                Void Assessment
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "search",
      label: "Search",
      children: (
        <div>
          <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
            <Card style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="searchCourseRunId" label="Course Run ID">
                  <Input placeholder="Filter by Course Run ID" />
                </Form.Item>
                <Form.Item name="searchCourseRef" label="Course Ref No.">
                  <Input placeholder="Course Reference Number" />
                </Form.Item>
                <Form.Item name="searchTraineeId" label="Trainee ID">
                  <Input placeholder="Filter by Trainee ID" />
                </Form.Item>
                <Form.Item name="searchSkillCode" label="Skill Code">
                  <Input placeholder="Filter by Skill Code" />
                </Form.Item>
              </Space>
              <Space wrap>
                <Form.Item name="searchTpUen" label="TP UEN">
                  <Input />
                </Form.Item>
                <Form.Item name="searchTpCode" label="TP Code">
                  <Input />
                </Form.Item>
                <Form.Item name="dateFrom" label="Updated From">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="dateTo" label="Updated To">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="sortField" label="Sort By">
                  <Select options={sortFieldOptions} style={{ width: 150 }} allowClear />
                </Form.Item>
                <Form.Item name="sortOrder" label="Order">
                  <Select options={sortOrderOptions} style={{ width: 100 }} allowClear />
                </Form.Item>
                <Form.Item name="page" label="Page" initialValue={0}>
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item name="pageSize" label="Page Size" initialValue={20}>
                  <InputNumber min={1} max={100} />
                </Form.Item>
              </Space>
            </Card>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={searchApi.loading}>
                Search Assessments
              </Button>
            </Form.Item>
          </Form>
          <Table
            dataSource={searchResults.map((r, i) => ({ ...r, key: i }))}
            columns={searchColumns}
            loading={searchApi.loading}
            pagination={{ pageSize: 20 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      ),
    },
    {
      key: "view",
      label: "View",
      children: (
        <div>
          <Form form={viewForm} layout="inline" onFinish={handleView}>
            <Form.Item name="viewRefNum" label="Reference Number" rules={[{ required: true }]}>
              <Input placeholder="Assessment Reference Number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<EyeOutlined />} loading={viewApi.loading}>
                View Details
              </Button>
            </Form.Item>
          </Form>
          {viewResult && (
            <Card style={{ marginTop: 16 }}>
              <pre style={{ maxHeight: 500, overflow: "auto" }}>
                {JSON.stringify(viewResult, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assessments"
        subtitle="Create, update, void, search, and view assessment records"
        breadcrumb={[
          { label: "Dashboard", path: "/" },
          { label: "Assessments" },
        ]}
      />
      <Tabs items={tabItems} />
    </div>
  );
};

export default Assessments;
