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
  Divider,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import ExcelUpload from "../components/ExcelUpload";
import { useApi } from "../hooks/useApi";
import {
  createEnrolment,
  updateEnrolment,
  cancelEnrolment,
  searchEnrolment,
  viewEnrolment,
  updateFeeCollection,
} from "../api/enrolmentService";
import { parseEnrolmentsSheet } from "../utils/excelParser";
import { validateEnrolment } from "../utils/validators";
import {
  IdType,
  IdTypeLabels,
  SponsorshipType,
  CollectionStatus,
  SortField,
  SortOrder,
} from "../types";
import type {
  CreateEnrolmentPayload,
  UpdateEnrolmentPayload,
  CancelEnrolmentPayload,
  SearchEnrolmentPayload,
  UpdateFeeCollectionPayload,
  EnrolmentRecord,
  ValidationError,
} from "../types";
import dayjs from "dayjs";

const Enrolments: React.FC = () => {
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [feeForm] = Form.useForm();

  const createApi = useApi();
  const updateApi = useApi();
  const cancelApi = useApi();
  const searchApi = useApi();
  const viewApi = useApi();
  const feeApi = useApi();

  const [searchResults, setSearchResults] = useState<EnrolmentRecord[]>([]);
  const [viewResult, setViewResult] = useState<Record<string, unknown> | null>(null);

  const idTypeOptions = Object.entries(IdTypeLabels).map(([v, l]) => ({ value: v, label: l }));
  const sponsorshipOptions = Object.values(SponsorshipType).map((v) => ({ value: v, label: v }));
  const collectionStatusOptions = Object.values(CollectionStatus).map((v) => ({ value: v, label: v }));
  const sortFieldOptions = Object.entries(SortField).map(([k, v]) => ({ value: v, label: k }));
  const sortOrderOptions = Object.entries(SortOrder).map(([k, v]) => ({ value: v, label: k }));

  // ---- Create ----
  const handleCreate = async (values: Record<string, unknown>) => {
    const payload: CreateEnrolmentPayload = {
      enrolment: {
        course: {
          run: { id: values.courseRunId as string },
          referenceNumber: values.courseRefNumber as string,
        },
        trainee: {
          id: values.traineeId as string,
          idType: {
            code: values.traineeIdType as string,
            description: IdTypeLabels[values.traineeIdType as IdType] || "",
          },
          fullName: values.traineeFullName as string,
          dateOfBirth: (values.traineeDob as dayjs.Dayjs)?.format("YYYY-MM-DD") || "",
          emailAddress: values.traineeEmail as string,
          enrolmentDate: (values.enrolmentDate as dayjs.Dayjs)?.format("YYYY-MM-DD") || "",
          sponsorshipType: values.sponsorshipType as string,
          contactNumber: {
            areaCode: values.areaCode as number,
            countryCode: values.countryCode as number,
            phoneNumber: values.phoneNumber as string,
          },
          fees: {
            discountAmount: values.discountAmount as number,
            collectionStatus: values.collectionStatus as string,
          },
        },
        employer: values.employerUen
          ? {
              uen: values.employerUen as string,
              fullName: values.employerName as string,
              emailAddress: values.employerEmail as string,
            }
          : undefined,
        trainingPartner: {
          code: values.tpCode as string,
          uen: values.tpUen as string,
        },
      },
    };

    const validation = validateEnrolment(payload.enrolment);
    if (!validation.valid) {
      validation.errors.forEach((e) => message.error(`${e.field}: ${e.message}`));
      return;
    }

    try {
      await createApi.execute(() => createEnrolment(payload));
      message.success("Enrolment created successfully");
      createForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Update ----
  const handleUpdate = async (values: Record<string, unknown>) => {
    const refNum = values.updateRefNum as string;
    const payload: UpdateEnrolmentPayload = {
      enrolment: {
        action: "Update",
        trainee: {
          emailAddress: values.updateEmail as string,
          contactNumber: values.updatePhone
            ? { phoneNumber: values.updatePhone as string }
            : undefined,
          fees: values.updateCollectionStatus
            ? { collectionStatus: values.updateCollectionStatus as string }
            : undefined,
        },
      },
    };

    try {
      await updateApi.execute(() => updateEnrolment(refNum, payload));
      message.success("Enrolment updated successfully");
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Cancel ----
  const handleCancel = async (values: { cancelRefNum: string }) => {
    const payload: CancelEnrolmentPayload = {
      enrolment: { action: "Cancel" },
    };

    try {
      await cancelApi.execute(() => cancelEnrolment(values.cancelRefNum, payload));
      message.success("Enrolment cancelled successfully");
      cancelForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Search ----
  const handleSearch = async (values: Record<string, unknown>) => {
    const payload: SearchEnrolmentPayload = {
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
      enrolment: {
        course: values.searchCourseRunId
          ? { run: { id: values.searchCourseRunId as string } }
          : undefined,
        trainee: values.searchTraineeId
          ? { id: values.searchTraineeId as string }
          : undefined,
        trainingPartner: values.searchTpUen
          ? { uen: values.searchTpUen as string, code: values.searchTpCode as string }
          : undefined,
      },
    };

    try {
      const result = await searchApi.execute(() => searchEnrolment(payload));
      const data = result as { data?: EnrolmentRecord[] };
      setSearchResults(Array.isArray(data?.data) ? data.data : Array.isArray(result) ? result as EnrolmentRecord[] : []);
      message.success("Search completed");
    } catch {
      setSearchResults([]);
    }
  };

  // ---- View ----
  const handleView = async (values: { viewRefNum: string }) => {
    try {
      const result = await viewApi.execute(() => viewEnrolment(values.viewRefNum));
      setViewResult(result as Record<string, unknown>);
      message.success("Enrolment details retrieved");
    } catch {
      setViewResult(null);
    }
  };

  // ---- Fee Collection ----
  const handleFeeCollection = async (values: { feeRefNum: string; feeStatus: string }) => {
    const payload: UpdateFeeCollectionPayload = {
      enrolment: {
        fees: { collectionStatus: values.feeStatus },
      },
    };

    try {
      await feeApi.execute(() => updateFeeCollection(values.feeRefNum, payload));
      message.success("Fee collection updated");
      feeForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Excel Upload ----
  const handleExcelData = (_sheetName: string, excelData: unknown[]) => {
    const parsed = parseEnrolmentsSheet(excelData as Record<string, unknown>[]);

    if (parsed.errors.length > 0) {
      message.warning(`${parsed.errors.length} validation error(s) found`);
      return;
    }

    parsed.data.forEach(async (enrolmentData, i) => {
      const payload: CreateEnrolmentPayload = { enrolment: enrolmentData };
      try {
        await createEnrolment(payload);
        message.success(`Enrolment ${i + 1} created`);
      } catch {
        message.error(`Failed to create enrolment ${i + 1}`);
      }
    });
  };

  const handleValidate = (_sheetName: string, excelData: unknown[]): ValidationError[] => {
    const parsed = parseEnrolmentsSheet(excelData as Record<string, unknown>[]);
    return parsed.errors;
  };

  const searchColumns = [
    { title: "Reference Number", dataIndex: "referenceNumber", key: "referenceNumber" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Course Run ID",
      key: "courseRunId",
      render: (_: unknown, r: EnrolmentRecord) => r.course?.run?.id,
    },
    {
      title: "Trainee",
      key: "trainee",
      render: (_: unknown, r: EnrolmentRecord) => r.trainee?.fullName,
    },
    {
      title: "Training Partner",
      key: "tp",
      render: (_: unknown, r: EnrolmentRecord) => r.trainingPartner?.code,
    },
    {
      title: "Fee Status",
      key: "feeStatus",
      render: (_: unknown, r: EnrolmentRecord) => r.trainee?.fees?.collectionStatus,
    },
  ];

  const tabItems = [
    {
      key: "create",
      label: "Create",
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <ExcelUpload
              onDataReady={handleExcelData}
              onValidate={handleValidate}
              acceptedSheets={["enrolment", "enrolments"]}
              title="Bulk Upload from Excel"
            />
          </Space>
          <Divider>Or Create Manually</Divider>
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
            <Card title="Trainee Information" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="traineeId" label="Trainee ID" rules={[{ required: true }]}>
                  <Input placeholder="NRIC/FIN" />
                </Form.Item>
                <Form.Item name="traineeIdType" label="ID Type" rules={[{ required: true }]}>
                  <Select options={idTypeOptions} style={{ width: 180 }} />
                </Form.Item>
                <Form.Item name="traineeFullName" label="Full Name" rules={[{ required: true }]}>
                  <Input placeholder="Full name" />
                </Form.Item>
                <Form.Item name="traineeDob" label="Date of Birth" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
              </Space>
              <Space wrap>
                <Form.Item name="traineeEmail" label="Email">
                  <Input placeholder="trainee@example.com" />
                </Form.Item>
                <Form.Item name="enrolmentDate" label="Enrolment Date" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
                <Form.Item name="sponsorshipType" label="Sponsorship Type" rules={[{ required: true }]}>
                  <Select options={sponsorshipOptions} style={{ width: 160 }} />
                </Form.Item>
              </Space>
              <Space wrap>
                <Form.Item name="countryCode" label="Country Code">
                  <InputNumber placeholder="65" />
                </Form.Item>
                <Form.Item name="areaCode" label="Area Code">
                  <InputNumber />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Phone Number">
                  <Input placeholder="91234567" />
                </Form.Item>
              </Space>
            </Card>
            <Card title="Fees" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="discountAmount" label="Discount Amount">
                  <InputNumber min={0} step={0.01} />
                </Form.Item>
                <Form.Item name="collectionStatus" label="Collection Status">
                  <Select options={collectionStatusOptions} style={{ width: 200 }} placeholder="Select" />
                </Form.Item>
              </Space>
            </Card>
            <Card title="Employer (Optional)" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="employerUen" label="Employer UEN">
                  <Input placeholder="Employer UEN" />
                </Form.Item>
                <Form.Item name="employerName" label="Employer Name">
                  <Input placeholder="Company name" />
                </Form.Item>
                <Form.Item name="employerEmail" label="Employer Email">
                  <Input placeholder="employer@example.com" />
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
              </Space>
            </Card>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createApi.loading}>
                Create Enrolment
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: "update",
      label: "Update",
      children: (
        <Form form={updateForm} layout="vertical" onFinish={handleUpdate}>
          <Card style={{ marginBottom: 16 }}>
            <Form.Item name="updateRefNum" label="Enrolment Reference Number" rules={[{ required: true }]}>
              <Input placeholder="Reference number to update" />
            </Form.Item>
            <Space wrap>
              <Form.Item name="updateEmail" label="New Email">
                <Input placeholder="Updated email" />
              </Form.Item>
              <Form.Item name="updatePhone" label="New Phone">
                <Input placeholder="Updated phone" />
              </Form.Item>
              <Form.Item name="updateCollectionStatus" label="Fee Collection Status">
                <Select options={collectionStatusOptions} style={{ width: 200 }} allowClear />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<EditOutlined />} loading={updateApi.loading}>
              Update Enrolment
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "cancel",
      label: "Cancel",
      children: (
        <Form form={cancelForm} layout="inline" onFinish={handleCancel}>
          <Form.Item name="cancelRefNum" label="Reference Number" rules={[{ required: true }]}>
            <Input placeholder="Enrolment reference to cancel" />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="Are you sure you want to cancel this enrolment?"
              onConfirm={() => cancelForm.submit()}
              okText="Yes, Cancel It"
              cancelText="No"
              okType="danger"
            >
              <Button danger icon={<CloseCircleOutlined />} loading={cancelApi.loading}>
                Cancel Enrolment
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
                <Form.Item name="searchTraineeId" label="Trainee ID">
                  <Input placeholder="Filter by Trainee ID" />
                </Form.Item>
                <Form.Item name="searchTpUen" label="TP UEN">
                  <Input placeholder="Training Partner UEN" />
                </Form.Item>
                <Form.Item name="searchTpCode" label="TP Code">
                  <Input placeholder="Training Partner Code" />
                </Form.Item>
              </Space>
              <Space wrap>
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
                Search Enrolments
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
              <Input placeholder="Enrolment Reference Number" />
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
    {
      key: "feeCollection",
      label: "Fee Collection",
      children: (
        <Form form={feeForm} layout="inline" onFinish={handleFeeCollection}>
          <Form.Item name="feeRefNum" label="Reference Number" rules={[{ required: true }]}>
            <Input placeholder="Enrolment Reference Number" />
          </Form.Item>
          <Form.Item name="feeStatus" label="Collection Status" rules={[{ required: true }]}>
            <Select options={collectionStatusOptions} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<DollarOutlined />} loading={feeApi.loading}>
              Update Fee Collection
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Enrolments"
        subtitle="Create, update, cancel, search, and manage enrolment fee collections"
        breadcrumb={[
          { label: "Dashboard", path: "/" },
          { label: "Enrolments" },
        ]}
      />
      <Tabs items={tabItems} />
    </div>
  );
};

export default Enrolments;
