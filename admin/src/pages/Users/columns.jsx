// columns.jsx

import { Button, Input, Popconfirm, Tag } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import dayjs from "dayjs";

export const getUserColumns = ({
  currentPage,
  pageSize,
  onlineUsers,
  sortField,
  sortOrder,
  user,
  roleId,
  handleDelete,
  roles,
  status,
  username,
  fullName,
  handleFullNameSearch,
  handleFullNameReset,
  handleUsernameReset,
  handleUsernameSearch,
}) => [
  {
    title: "T/b",
    key: "index",
    fixed: "left",
    width: 50,
    render: (_, record, index) => (currentPage - 1) * pageSize + index + 1,
  },

  {
    title: "Ady",
    dataIndex: "fullName",
    key: "fullName",
    fixed: "left",
    width: "15rem",
    sorter: true,
    sortOrder: sortField === "fullName" ? sortOrder : null,
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder="Gözle..."
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => {
            confirm();
            handleFullNameSearch(selectedKeys[0] || "");
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
              handleFullNameSearch(selectedKeys[0] || "");
            }}
          >
            Gözle
          </Button>

          <Button
            size="small"
            onClick={() => {
              clearFilters();
              confirm();
              handleFullNameReset();
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

    filteredValue: fullName ? [fullName] : null,
  },

  {
    title: "Logini",
    dataIndex: "username",
    key: "username",
    width: "15rem",
    sorter: true,
    sortOrder: sortField === "username" ? sortOrder : null,
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder="Gözle..."
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => {
            confirm();
            handleUsernameSearch(selectedKeys[0] || "");
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
              handleUsernameSearch(selectedKeys[0] || "");
            }}
          >
            Gözle
          </Button>

          <Button
            size="small"
            onClick={() => {
              clearFilters();
              confirm();
              handleUsernameReset();
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

    filteredValue: username ? [username] : null,
  },

  {
    title: "Soňky giren wagty",
    dataIndex: "lastLogin",
    key: "lastLogin",
    sorter: true,
    sortOrder: sortField === "lastLogin" ? sortOrder : null,

    render: (text, record) =>
      onlineUsers.includes(String(record.id)) ? (
        <span className="font-semibold text-green-600">Online</span>
      ) : text ? (
        dayjs(text).format("DD/MM/YYYY HH:mm")
      ) : (
        "----"
      ),
  },

  {
    title: "Ygtyýarlygy",
    dataIndex: "role",
    key: "role",

    filters: roles?.data?.map((row) => ({ text: row.label, value: row.id })),
    filterMultiple: true,
    filteredValue: roleId,

    render: (role) => <Tag variant="outlined">{role?.label || "----"}</Tag>,
  },

  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    filters: [
      {
        text: "Aktiw",
        value: "active",
      },
      { text: "Aktiw däl", value: "inactive" },
      { text: "Blok edilen", value: "blocked" },
    ],
    filterMultiple: false,
    filteredValue: status ? [status] : [],

    render: (status) => (
      <Tag
        variant="solid"
        color={
          status === "active"
            ? "success"
            : status === "inactive"
              ? "default"
              : "error"
        }
      >
        {status}
      </Tag>
    ),
  },

  {
    title: "Sazlamalar",
    key: "id",
    dataIndex: "id",
    fixed: "right",
    width: 100,

    render: (id) =>
      user?.data?.id !== id && (
        <div className="flex flex-row items-center gap-2">
          <Link to={`/users/${id}/`}>
            <EditOutlined />
          </Link>

          <Popconfirm
            title="Siz hakykatdanam bu ulanyjyny pozmak isleýärsiňizmi?"
            okText="Hawa"
            cancelText="Ýok"
            onConfirm={() => handleDelete(id)}
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
  },
];
