import React, { useState } from "react";
import { Upload, Button, Modal, Select, Table, Alert, Space, Tag } from "antd";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useExcelUpload } from "../hooks/useExcelUpload";
import type { ValidationError } from "../types";

interface ExcelUploadProps {
  onDataReady: (sheetName: string, data: unknown[]) => void;
  onValidate?: (sheetName: string, data: unknown[]) => ValidationError[];
  acceptedSheets?: string[];
  title?: string;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onDataReady,
  onValidate,
  acceptedSheets,
  title = "Upload Excel File",
}) => {
  const {
    sheetNames,
    sheetsData,
    loading,
    error,
    validationErrors,
    handleFileUpload,
    setValidationErrors,
    reset,
  } = useExcelUpload();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async (file: File) => {
    try {
      const result = await handleFileUpload(file);
      if (result.sheetNames.length > 0) {
        setSelectedSheet(result.sheetNames[0]);
        setModalVisible(true);
      }
    } catch {
      // Error handled in hook
    }
    return false; // Prevent default upload
  };

  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (onValidate && sheetsData[sheetName]) {
      const errors = onValidate(sheetName, sheetsData[sheetName]);
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleConfirm = () => {
    if (selectedSheet && sheetsData[selectedSheet]) {
      onDataReady(selectedSheet, sheetsData[selectedSheet]);
      setModalVisible(false);
      reset();
      setFileList([]);
    }
  };

  const previewData = selectedSheet ? sheetsData[selectedSheet] || [] : [];
  const previewColumns =
    previewData.length > 0
      ? Object.keys(previewData[0] as Record<string, unknown>).map((key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
          width: 150,
        }))
      : [];

  const filteredSheets = acceptedSheets
    ? sheetNames.filter((name) =>
        acceptedSheets.some(
          (accepted) => name.toLowerCase().includes(accepted.toLowerCase())
        )
      )
    : sheetNames;

  return (
    <>
      <Upload
        accept=".xlsx,.xls"
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([file as unknown as UploadFile]);
          handleUpload(file);
          return false;
        }}
        onRemove={() => {
          setFileList([]);
          reset();
        }}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />} loading={loading}>
          {title}
        </Button>
      </Upload>

      <Modal
        title={
          <Space>
            <FileExcelOutlined style={{ color: "#52c41a" }} />
            Excel Data Preview
          </Space>
        }
        open={modalVisible}
        onOk={handleConfirm}
        onCancel={() => {
          setModalVisible(false);
          reset();
          setFileList([]);
        }}
        width={900}
        okText="Confirm & Submit"
        okButtonProps={{
          disabled: validationErrors.length > 0,
        }}
      >
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Select Sheet:</span>
          <Select
            value={selectedSheet}
            onChange={handleSheetSelect}
            style={{ width: 300 }}
            options={filteredSheets.map((name) => ({
              label: name,
              value: name,
            }))}
          />
          <Tag style={{ marginLeft: 8 }}>
            {previewData.length} row(s)
          </Tag>
        </div>

        {validationErrors.length > 0 && (
          <Alert
            message="Validation Errors"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.slice(0, 10).map((err, i) => (
                  <li key={i}>
                    {err.row ? `Row ${err.row}: ` : ""}
                    {err.field} — {err.message}
                  </li>
                ))}
                {validationErrors.length > 10 && (
                  <li>...and {validationErrors.length - 10} more errors</li>
                )}
              </ul>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          dataSource={previewData.map((row, i) => ({
            ...(row as Record<string, unknown>),
            key: i,
          }))}
          columns={previewColumns}
          scroll={{ x: "max-content", y: 400 }}
          size="small"
          pagination={{ pageSize: 50 }}
        />
      </Modal>
    </>
  );
};

export default ExcelUpload;
