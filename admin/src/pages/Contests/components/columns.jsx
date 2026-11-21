import { SearchOutlined } from "@ant-design/icons";
import { Input, Button, Tag } from "antd";
import React from "react";

export const getContestUsersColumns = ({
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  fullName,
  username,

  isCancelUser,
  isRegisterUser,
  handleCancelRegister,
  handleRegister,
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
    title: "Ygtyýarlygy",
    dataIndex: "role",
    key: "role",
    width: 80,
    render: (role) => <Tag variant="outlined">{role?.label || "----"}</Tag>,
  },
  {
    title: "Toparlary",
    dataIndex: "groups",
    key: "groups",
    width: 80,
    render: (group) => group.map((row) => row.title).join(", "),
  },
  {
    title: "Sazlamalar",
    key: "id",
    dataIndex: "id",
    fixed: "right",
    width: 100,
    render: (id, record) => (
      <div className="flex flex-row items-center gap-2">
        {record.registrationStatus === "not-registered" && (
          <Button
            variant="solid"
            type="primary"
            loading={isRegisterUser}
            disabled={isRegisterUser}
            onClick={() => handleRegister(id)}
          >
            Hasaba dur
          </Button>
        )}

        {record.registrationStatus === "registered" && (
          <Button
            variant="outlined"
            // type="primary"

            loading={isCancelUser}
            disabled={isCancelUser}
            onClick={() => handleCancelRegister(id)}
          >
            Hasapdan aýyr
          </Button>
        )}
      </div>
    ),
  },
];
