import React, { useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Table,
  Card,
  Select,
  Space,
  message,
  Popconfirm,
} from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { useApi } from "../hooks/useApi";
import {
  getTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer,
} from "../api/trainerService";
import {
  TrainerType,
  TrainerTypeLabels,
  Role,
  RoleLabels,
  IdType,
  IdTypeLabels,
  Salutation,
  SalutationLabels,
} from "../types";
import type { TrainerInfo } from "../types";

const Trainers: React.FC = () => {
  const [retrieveForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const retrieveApi = useApi();
  const addApi = useApi();
  const updateApi = useApi();
  const deleteApi = useApi();
  const [trainers, setTrainers] = useState<TrainerInfo[]>([]);

  const uen = import.meta.env.VITE_SSG_UEN || "";

  const handleRetrieve = async () => {
    try {
      const result = await retrieveApi.execute(() => getTrainers(uen));
      const data = Array.isArray(result) ? result : [];
      setTrainers(data as TrainerInfo[]);
      message.success(`Retrieved ${data.length} trainer(s)`);
    } catch {
      setTrainers([]);
    }
  };

  const handleAdd = async (values: Record<string, unknown>) => {
    const trainer: TrainerInfo = {
      trainerType: {
        code: values.trainerTypeCode as string,
        description: TrainerTypeLabels[values.trainerTypeCode as TrainerType] || "",
      },
      name: values.name as string,
      email: values.email as string,
      idNumber: values.idNumber as string,
      idType: {
        code: values.idTypeCode as string,
        description: IdTypeLabels[values.idTypeCode as IdType] || "",
      },
      roles: [
        {
          role: {
            code: values.roleCode as string,
            description: RoleLabels[values.roleCode as Role] || "",
          },
        },
      ],
      domainAreaOfPractice: values.domainAreaOfPractice as string,
      experience: values.experience as string,
      linkedInURL: values.linkedInURL as string,
      salutationId: values.salutationId as string,
    };

    try {
      await addApi.execute(() => addTrainer({ trainer, uen }));
      message.success("Trainer added successfully");
      addForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    const trainerId = values.updateTrainerId as string;
    const trainer: TrainerInfo = {
      trainerType: {
        code: values.updateTrainerTypeCode as string,
        description: TrainerTypeLabels[values.updateTrainerTypeCode as TrainerType] || "",
      },
      name: values.updateName as string,
      email: values.updateEmail as string,
      idNumber: values.updateIdNumber as string,
      idType: {
        code: values.updateIdTypeCode as string,
        description: IdTypeLabels[values.updateIdTypeCode as IdType] || "",
      },
      roles: [
        {
          role: {
            code: values.updateRoleCode as string,
            description: RoleLabels[values.updateRoleCode as Role] || "",
          },
        },
      ],
      domainAreaOfPractice: values.updateDomain as string,
      experience: values.updateExperience as string,
    };

    try {
      await updateApi.execute(() => updateTrainer(trainerId, { trainer, uen }));
      message.success("Trainer updated successfully");
    } catch {
      // Error handled by interceptor
    }
  };

  const handleDelete = async (values: { deleteTrainerId: string }) => {
    try {
      await deleteApi.execute(() =>
        deleteTrainer(values.deleteTrainerId, { action: "delete", uen })
      );
      message.success("Trainer deleted successfully");
      deleteForm.resetFields();
    } catch {
      // Error handled by interceptor
    }
  };

  const trainerTypeOptions = Object.entries(TrainerTypeLabels).map(([v, l]) => ({ value: v, label: l }));
  const roleOptions = Object.entries(RoleLabels).map(([v, l]) => ({ value: v, label: l }));
  const idTypeOptions = Object.entries(IdTypeLabels).map(([v, l]) => ({ value: v, label: l }));
  const salutationOptions = Object.entries(SalutationLabels).map(([v, l]) => ({ value: v, label: l }));

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "ID Number", dataIndex: "idNumber", key: "idNumber" },
    {
      title: "Trainer Type",
      key: "trainerType",
      render: (_: unknown, record: TrainerInfo) => record.trainerType?.description || record.trainerType?.code,
    },
    {
      title: "Roles",
      key: "roles",
      render: (_: unknown, record: TrainerInfo) =>
        record.roles?.map((r) => r.role?.description || r.role?.code).join(", "),
    },
    { title: "Domain", dataIndex: "domainAreaOfPractice", key: "domain" },
  ];

  const tabItems = [
    {
      key: "retrieve",
      label: "Retrieve",
      children: (
        <div>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleRetrieve} loading={retrieveApi.loading}>
            Retrieve All Trainers
          </Button>
          <Table
            dataSource={trainers.map((t, i) => ({ ...t, key: i }))}
            columns={columns}
            loading={retrieveApi.loading}
            style={{ marginTop: 16 }}
            pagination={{ pageSize: 20 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      ),
    },
    {
      key: "add",
      label: "Add Trainer",
      children: (
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Card title="Trainer Details" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Form.Item name="salutationId" label="Salutation">
                <Select options={salutationOptions} style={{ width: 120 }} placeholder="Select" />
              </Form.Item>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Trainer full name" />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
                <Input placeholder="trainer@example.com" />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="idNumber" label="ID Number" rules={[{ required: true }]}>
                <Input placeholder="NRIC/FIN" />
              </Form.Item>
              <Form.Item name="idTypeCode" label="ID Type" rules={[{ required: true }]}>
                <Select options={idTypeOptions} style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="trainerTypeCode" label="Trainer Type" rules={[{ required: true }]}>
                <Select options={trainerTypeOptions} style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="roleCode" label="Role" rules={[{ required: true }]}>
                <Select options={roleOptions} style={{ width: 180 }} />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="domainAreaOfPractice" label="Domain Area">
                <Input placeholder="e.g., Information Technology" />
              </Form.Item>
              <Form.Item name="experience" label="Experience">
                <Input placeholder="e.g., 10 years" />
              </Form.Item>
              <Form.Item name="linkedInURL" label="LinkedIn URL">
                <Input placeholder="https://linkedin.com/in/..." />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={addApi.loading}>
              Add Trainer
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "update",
      label: "Update Trainer",
      children: (
        <Form form={updateForm} layout="vertical" onFinish={handleUpdate}>
          <Card title="Update Trainer" style={{ marginBottom: 16 }}>
            <Form.Item name="updateTrainerId" label="Trainer ID" rules={[{ required: true }]}>
              <Input placeholder="Trainer ID to update" />
            </Form.Item>
            <Space wrap>
              <Form.Item name="updateName" label="Full Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="updateEmail" label="Email">
                <Input />
              </Form.Item>
              <Form.Item name="updateIdNumber" label="ID Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="updateIdTypeCode" label="ID Type" rules={[{ required: true }]}>
                <Select options={idTypeOptions} style={{ width: 180 }} />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="updateTrainerTypeCode" label="Trainer Type" rules={[{ required: true }]}>
                <Select options={trainerTypeOptions} style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="updateRoleCode" label="Role" rules={[{ required: true }]}>
                <Select options={roleOptions} style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="updateDomain" label="Domain Area">
                <Input />
              </Form.Item>
              <Form.Item name="updateExperience" label="Experience">
                <Input />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<EditOutlined />} loading={updateApi.loading}>
              Update Trainer
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "delete",
      label: "Delete Trainer",
      children: (
        <Form form={deleteForm} layout="inline" onFinish={handleDelete}>
          <Form.Item name="deleteTrainerId" label="Trainer ID" rules={[{ required: true }]}>
            <Input placeholder="Trainer ID to delete" />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="Are you sure you want to delete this trainer?"
              onConfirm={() => deleteForm.submit()}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button danger icon={<DeleteOutlined />} loading={deleteApi.loading}>
                Delete Trainer
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
        title="Trainer Management"
        subtitle="Retrieve, add, update, or delete training provider trainers"
        breadcrumb={[
          { label: "Dashboard", path: "/" },
          { label: "Trainers" },
        ]}
      />
      <Tabs items={tabItems} />
    </div>
  );
};

export default Trainers;
