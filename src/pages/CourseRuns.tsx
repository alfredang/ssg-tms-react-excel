import React, { useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Card,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Space,
  message,
  Popconfirm,
  Divider,
} from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import ExcelUpload from "../components/ExcelUpload";
import { useApi } from "../hooks/useApi";
import {
  getCourseRunById,
  publishCourseRun,
  editCourseRun,
  deleteCourseRun,
} from "../api/courseService";
import { parseCourseRunsSheet } from "../utils/excelParser";
import { validateCourseRun } from "../utils/validators";
import {
  ModeOfTrainingLabels,
  Vacancy,
  VacancyLabels,
} from "../types";
import type {
  AddCourseRunPayload,
  EditCourseRunPayload,
  DeleteCourseRunPayload,
  CourseRunInfo,
  ValidationError,
} from "../types";
import dayjs from "dayjs";

const CourseRuns: React.FC = () => {
  const [viewForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const viewApi = useApi();
  const addApi = useApi();
  const editApi = useApi();
  const deleteApi = useApi();
  const [viewResult, setViewResult] = useState<Record<string, unknown> | null>(null);

  const uen = import.meta.env.VITE_SSG_UEN || "";

  // ---- View Tab ----
  const handleView = async (values: { runId: string; includeExpired?: boolean }) => {
    try {
      const result = await viewApi.execute(() =>
        getCourseRunById(values.runId, values.includeExpired)
      );
      setViewResult(result as Record<string, unknown>);
      message.success("Course run retrieved");
    } catch {
      setViewResult(null);
    }
  };

  // ---- Add Tab ----
  const handleAdd = async (values: Record<string, unknown>) => {
    const courseReferenceNumber = values.courseReferenceNumber as string;
    const run: CourseRunInfo = {
      registrationDates: {
        opening: (values.regOpening as dayjs.Dayjs).format("YYYYMMDD"),
        closing: (values.regClosing as dayjs.Dayjs).format("YYYYMMDD"),
      },
      courseDates: {
        start: (values.courseStart as dayjs.Dayjs).format("YYYYMMDD"),
        end: (values.courseEnd as dayjs.Dayjs).format("YYYYMMDD"),
      },
      scheduleInfoType: {
        code: values.scheduleInfoTypeCode as string,
        description: values.scheduleInfoTypeDesc as string,
      },
      scheduleInfo: values.scheduleInfo as string,
      venue: {
        block: values.venueBlock as string,
        street: values.venueStreet as string,
        floor: values.venueFloor as string,
        unit: values.venueUnit as string,
        building: values.venueBuilding as string,
        postalCode: values.venuePostalCode as string,
        room: values.venueRoom as string,
        wheelChairAccess: values.wheelChairAccess as boolean,
      },
      intakeSize: values.intakeSize as number,
      threshold: values.threshold as number,
      modeOfTraining: values.modeOfTraining as string,
      courseAdminEmail: values.courseAdminEmail as string,
      courseVacancy: {
        code: values.vacancyCode as string,
        description: VacancyLabels[values.vacancyCode as Vacancy] || "",
      },
    };

    const validation = validateCourseRun({ ...run, courseReferenceNumber });
    if (!validation.valid) {
      validation.errors.forEach((e) => message.error(`${e.field}: ${e.message}`));
      return;
    }

    const payload: AddCourseRunPayload = {
      course: {
        courseReferenceNumber,
        trainingProvider: { uen },
        runs: [run],
      },
    };

    try {
      await addApi.execute(() => publishCourseRun(payload));
      message.success("Course run published successfully");
      addForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Edit Tab ----
  const handleEdit = async (values: Record<string, unknown>) => {
    const runId = values.editRunId as string;
    const payload: EditCourseRunPayload = {
      course: {
        courseReferenceNumber: values.editCRN as string,
        trainingProvider: { uen },
        run: {
          action: "update",
          sequenceNumber: values.sequenceNumber as number,
          registrationDates: {
            opening: (values.editRegOpening as dayjs.Dayjs).format("YYYYMMDD"),
            closing: (values.editRegClosing as dayjs.Dayjs).format("YYYYMMDD"),
          },
          courseDates: {
            start: (values.editCourseStart as dayjs.Dayjs).format("YYYYMMDD"),
            end: (values.editCourseEnd as dayjs.Dayjs).format("YYYYMMDD"),
          },
          scheduleInfoType: {
            code: values.editScheduleInfoTypeCode as string,
            description: values.editScheduleInfoTypeDesc as string,
          },
          venue: {},
          modeOfTraining: values.editModeOfTraining as string,
          courseAdminEmail: values.editCourseAdminEmail as string,
          courseVacancy: {
            code: values.editVacancyCode as string,
            description: VacancyLabels[values.editVacancyCode as Vacancy] || "",
          },
        },
      },
    };

    try {
      await editApi.execute(() => editCourseRun(runId, payload));
      message.success("Course run updated successfully");
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Delete Tab ----
  const handleDelete = async (values: { deleteRunId: string; deleteCRN: string }) => {
    const payload: DeleteCourseRunPayload = {
      course: {
        courseReferenceNumber: values.deleteCRN,
        trainingProvider: { uen },
        run: { action: "delete" },
      },
    };

    try {
      await deleteApi.execute(() => deleteCourseRun(values.deleteRunId, payload));
      message.success("Course run deleted successfully");
      deleteForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  // ---- Excel Upload ----
  const handleExcelData = (_sheetName: string, excelData: unknown[]) => {
    const parsed = parseCourseRunsSheet(excelData as Record<string, unknown>[]);
    if (parsed.errors.length > 0) {
      message.warning(`${parsed.errors.length} validation error(s) found in Excel data`);
      return;
    }

    // Build payload from parsed data
    const grouped = new Map<string, CourseRunInfo[]>();
    for (const run of parsed.data) {
      const crn = run.courseReferenceNumber;
      if (!grouped.has(crn)) grouped.set(crn, []);
      grouped.get(crn)!.push(run);
    }

    grouped.forEach(async (runs, crn) => {
      const payload: AddCourseRunPayload = {
        course: {
          courseReferenceNumber: crn,
          trainingProvider: { uen },
          runs,
        },
      };

      try {
        await publishCourseRun(payload);
        message.success(`Course run(s) for ${crn} published`);
      } catch {
        message.error(`Failed to publish course run(s) for ${crn}`);
      }
    });
  };

  const handleValidate = (_sheetName: string, excelData: unknown[]): ValidationError[] => {
    const parsed = parseCourseRunsSheet(excelData as Record<string, unknown>[]);
    return parsed.errors;
  };

  const modeOptions = Object.entries(ModeOfTrainingLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const vacancyOptions = Object.entries(VacancyLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const tabItems = [
    {
      key: "view",
      label: "View",
      children: (
        <div>
          <Form form={viewForm} layout="inline" onFinish={handleView}>
            <Form.Item name="runId" label="Run ID" rules={[{ required: true }]}>
              <Input placeholder="Course Run ID" />
            </Form.Item>
            <Form.Item name="includeExpired" label="Include Expired" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={viewApi.loading}>
                Search
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
      key: "add",
      label: "Add Course Run",
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <ExcelUpload
              onDataReady={handleExcelData}
              onValidate={handleValidate}
              acceptedSheets={["course run", "runs"]}
              title="Bulk Upload from Excel"
            />
          </Space>
          <Divider>Or Add Manually</Divider>
          <Form form={addForm} layout="vertical" onFinish={handleAdd}>
            <Card title="Course Information" style={{ marginBottom: 16 }}>
              <Form.Item name="courseReferenceNumber" label="Course Reference Number" rules={[{ required: true }]}>
                <Input placeholder="e.g., TGS-2020123456" />
              </Form.Item>
            </Card>
            <Card title="Schedule" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="regOpening" label="Registration Opening" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
                <Form.Item name="regClosing" label="Registration Closing" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
                <Form.Item name="courseStart" label="Course Start" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
                <Form.Item name="courseEnd" label="Course End" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
              </Space>
              <Space wrap>
                <Form.Item name="scheduleInfoTypeCode" label="Schedule Type Code" rules={[{ required: true }]}>
                  <Input placeholder="e.g., 01" />
                </Form.Item>
                <Form.Item name="scheduleInfoTypeDesc" label="Schedule Type Description" rules={[{ required: true }]}>
                  <Input placeholder="e.g., Weekday" />
                </Form.Item>
                <Form.Item name="scheduleInfo" label="Schedule Info">
                  <Input placeholder="Additional schedule details" />
                </Form.Item>
              </Space>
            </Card>
            <Card title="Course Details" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="modeOfTraining" label="Mode of Training" rules={[{ required: true }]}>
                  <Select options={modeOptions} style={{ width: 200 }} placeholder="Select mode" />
                </Form.Item>
                <Form.Item name="courseAdminEmail" label="Admin Email" rules={[{ required: true, type: "email" }]}>
                  <Input placeholder="admin@example.com" />
                </Form.Item>
                <Form.Item name="intakeSize" label="Intake Size">
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item name="threshold" label="Threshold">
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item name="vacancyCode" label="Vacancy" rules={[{ required: true }]}>
                  <Select options={vacancyOptions} style={{ width: 160 }} placeholder="Select" />
                </Form.Item>
              </Space>
            </Card>
            <Card title="Venue" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Form.Item name="venueBlock" label="Block"><Input /></Form.Item>
                <Form.Item name="venueStreet" label="Street"><Input /></Form.Item>
                <Form.Item name="venueFloor" label="Floor"><Input /></Form.Item>
                <Form.Item name="venueUnit" label="Unit"><Input /></Form.Item>
                <Form.Item name="venueBuilding" label="Building"><Input /></Form.Item>
                <Form.Item name="venuePostalCode" label="Postal Code"><Input /></Form.Item>
                <Form.Item name="venueRoom" label="Room"><Input /></Form.Item>
                <Form.Item name="wheelChairAccess" label="Wheelchair Access" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Space>
            </Card>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={addApi.loading}>
                Publish Course Run
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: "edit",
      label: "Edit Course Run",
      children: (
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Card title="Identify Course Run" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="editRunId" label="Run ID" rules={[{ required: true }]}>
                <Input placeholder="Course Run ID to edit" />
              </Form.Item>
              <Form.Item name="editCRN" label="Course Ref Number" rules={[{ required: true }]}>
                <Input placeholder="Course Reference Number" />
              </Form.Item>
              <Form.Item name="sequenceNumber" label="Sequence Number">
                <InputNumber min={1} />
              </Form.Item>
            </Space>
          </Card>
          <Card title="Updated Schedule" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="editRegOpening" label="Registration Opening" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item name="editRegClosing" label="Registration Closing" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item name="editCourseStart" label="Course Start" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item name="editCourseEnd" label="Course End" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="editScheduleInfoTypeCode" label="Schedule Type Code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="editScheduleInfoTypeDesc" label="Schedule Type Description" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Space>
          </Card>
          <Card title="Updated Details" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="editModeOfTraining" label="Mode of Training" rules={[{ required: true }]}>
                <Select options={modeOptions} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="editCourseAdminEmail" label="Admin Email" rules={[{ required: true, type: "email" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="editVacancyCode" label="Vacancy" rules={[{ required: true }]}>
                <Select options={vacancyOptions} style={{ width: 160 }} />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editApi.loading}>
              Update Course Run
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "delete",
      label: "Delete Course Run",
      children: (
        <Form form={deleteForm} layout="inline" onFinish={handleDelete}>
          <Form.Item name="deleteRunId" label="Run ID" rules={[{ required: true }]}>
            <Input placeholder="Course Run ID to delete" />
          </Form.Item>
          <Form.Item name="deleteCRN" label="Course Ref Number" rules={[{ required: true }]}>
            <Input placeholder="Course Reference Number" />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="Are you sure you want to delete this course run?"
              onConfirm={() => deleteForm.submit()}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button danger icon={<DeleteOutlined />} loading={deleteApi.loading}>
                Delete Course Run
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Course Runs"
        subtitle="Manage course runs — view, publish, edit, or delete"
        breadcrumb={[
          { label: "Dashboard", path: "/" },
          { label: "Course Runs" },
        ]}
      />
      <Tabs items={tabItems} />
    </div>
  );
};

export default CourseRuns;
