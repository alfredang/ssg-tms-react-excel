import React from "react";
import { Table, Tag } from "antd";
import type { ValidationError } from "../types";

interface DataPreviewProps {
  data: Record<string, unknown>[];
  validationErrors?: ValidationError[];
  title?: string;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  validationErrors = [],
  title,
}) => {
  if (data.length === 0) return null;

  const errorRowSet = new Set(validationErrors.map((e) => e.row));
  const errorFieldMap = new Map<string, string[]>();
  for (const err of validationErrors) {
    const key = `${err.row}-${err.field}`;
    if (!errorFieldMap.has(key)) {
      errorFieldMap.set(key, []);
    }
    errorFieldMap.get(key)!.push(err.message);
  }

  const columns = Object.keys(data[0]).map((key) => ({
    title: key,
    dataIndex: key,
    key,
    ellipsis: true,
    width: 150,
    render: (value: unknown, _: unknown, index: number) => {
      const rowNum = index + 2;
      const cellKey = `${rowNum}-${key}`;
      const hasError = errorFieldMap.has(cellKey);

      return (
        <span style={{ color: hasError ? "#ff4d4f" : undefined }}>
          {String(value ?? "")}
          {hasError && (
            <Tag color="error" style={{ marginLeft: 4, fontSize: 10 }}>
              !
            </Tag>
          )}
        </span>
      );
    },
  }));

  return (
    <div>
      {title && <h4>{title}</h4>}
      <Table
        dataSource={data.map((row, i) => ({ ...row, key: i }))}
        columns={columns}
        scroll={{ x: "max-content", y: 400 }}
        size="small"
        pagination={{ pageSize: 20 }}
        rowClassName={(_, index) =>
          errorRowSet.has(index + 2) ? "row-error" : ""
        }
      />
      <style>{`
        .row-error { background-color: #fff2f0 !important; }
        .row-error:hover td { background-color: #fff1f0 !important; }
      `}</style>
    </div>
  );
};

export default DataPreview;
