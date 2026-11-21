import { Button, Popconfirm, Space, Tag, Tooltip } from "antd";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";

export const getRestoreColumns = ({
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  handleRestore,
  handleForceDelete,
  canRestore,
  canForceDelete,
  isRestoring,
  isDeleting,
}) => {
  return [
    {
      title: "#",
      dataIndex: "index",
      width: 60,
      fixed: "left",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: true,
      sortOrder: sortField === "id" ? sortOrder : null,
    },
    {
      title: "Ady / Maglumat",
      dataIndex: "name",
      sorter: true,
      sortOrder: sortField === "name" ? sortOrder : null,
      render: (text, record) => {
        const display =
          text ||
          record.title ||
          record.fullName ||
          record.email ||
          record.username ||
          "-";
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{display}</div>
            {record.email && record.email !== display && (
              <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Pozulan wagty",
      dataIndex: "deletedAt",
      width: 180,
      sorter: true,
      sortOrder: sortField === "deletedAt" ? sortOrder : null,
      render: (date) =>
        date
          ? new Date(date).toLocaleString("tk-TM", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
    },
    {
      title: "Ýagdaýy",
      width: 110,
      render: () => <Tag color="red">Pozulan</Tag>,
    },
    {
      title: "Sazlamalar",
      key: "actions",
      width: 210,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {canRestore && (
            <Popconfirm
              title="Bu elementi dikeltmek isleýärsiňizmi?"
              description="Element yzyna dikeldiler."
              onConfirm={() => handleRestore(record.id)}
              okText="Hawa"
              cancelText="Ýok"
              disabled={isRestoring}
            >
              <Tooltip title="Dikeltmek">
                <Button
                  type="primary"
                  size="small"
                  icon={<UndoOutlined />}
                  loading={isRestoring}
                >
                  Dikelt
                </Button>
              </Tooltip>
            </Popconfirm>
          )}

          {canForceDelete && (
            <Popconfirm
              title="Bu elementi dolulygyna pozmak isleýärsiňizmi?"
              description="Bu hereket yzyna alynmaýar!"
              onConfirm={() => handleForceDelete(record.id)}
              okText="Hawa, poz"
              cancelText="Ýok"
              okButtonProps={{ danger: true }}
              disabled={isDeleting}
            >
              <Tooltip title="Dolulygyna pozmak">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                >
                  Poz
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
};
