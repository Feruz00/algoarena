import { Button, Input, Popconfirm } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";

export const getGroupColumns = ({
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  title,
  handleDelete,
  handleSearch,
  handleReset,
  canEdit,
  canDelete,
}) => [
  {
    title: "T/b",
    key: "index",
    fixed: "left",
    width: 50,
    render: (_, record, index) => (currentPage - 1) * pageSize + index + 1,
  },

  {
    title: "Sözbaşy",
    dataIndex: "title",
    key: "title",
    fixed: "left",
    width: "12rem",
    sorter: true,
    sortOrder: sortField === "title" ? sortOrder : null,

    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder="Sözbaşy gözle..."
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => {
            confirm();
            handleSearch(selectedKeys[0] || "");
          }}
          className="mb-2 block"
        />

        <div className="flex gap-2 mt-3 flex-row items-center justify-between">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            onClick={() => {
              confirm();
              handleSearch(selectedKeys[0] || "");
            }}
          >
            Gözle
          </Button>

          <Button
            size="small"
            onClick={() => {
              clearFilters();
              confirm();
              handleReset();
            }}
          >
            Arassala
          </Button>
        </div>
      </div>
    ),

    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),

    filteredValue: title ? [title] : null,
  },

  {
    title: "Beýany",
    dataIndex: "description",
    key: "description",
  },

  canDelete || canEdit
    ? {
        title: "Sazlamalar",
        key: "id",
        dataIndex: "id",
        fixed: "right",
        width: 100,

        render: (id) => (
          <div className="flex flex-row items-center gap-2">
            {canEdit && (
              <Link to={`/groups/${id}/`}>
                <EditOutlined />
              </Link>
            )}

            {canDelete && (
              <Popconfirm
                title="Siz hakykatdanam bu maglumaty pozmak isleýärsiňizmi?"
                okText="Hawa"
                cancelText="Ýok"
                onConfirm={() => handleDelete(id)}
              >
                <DeleteOutlined />
              </Popconfirm>
            )}
          </div>
        ),
      }
    : null,
];
