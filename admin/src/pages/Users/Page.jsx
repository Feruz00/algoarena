import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  useDeleteUser,
  useDeleteUsers,
  useGetUsers,
  useUpdatePasswordsByExcel,
} from "./useUsers";
import { viewItem } from "../../utils/user";
import useAuthStore from "../../store/authStore";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";
import { useSocket } from "../../context/SocketContext";
import { getUserColumns } from "./columns";
import { useGetRoles } from "../Roles/useRoles";
import { Pagination, Table, Button, Upload, Space, Dropdown } from "antd";
import {
  FileExcelOutlined,
  DownloadOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useExportUsers, useImportUsers } from "./useUsers";
import excelIcon from "../../assets/excel.svg";

const { Column } = Table;

const UsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((store) => store.user);
  const { onlineUsers } = useSocket();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;
  const [sortField, setSortField] = useState(searchParams.get("sort") ?? null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") ?? null);
  const [roleId, setRoleId] = useState(
    searchParams.get("roleId")
      ? searchParams
          .get("roleId")
          .split(",")
          .map((row) => Number(row))
      : [],
  );
  const [status, setStatus] = useState(
    searchParams.get("status") ? searchParams.get("status") : null,
  );
  const [username, setUsername] = useState(
    searchParams.get("username") ? searchParams.get("username") : null,
  );
  const [fullName, setFullName] = useState(
    searchParams.get("fullname") ? searchParams.get("fullname") : null,
  );

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField ? sortField : undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      roleId: roleId ? roleId.join(",") : undefined,
      status: status ? status : undefined,
      username: username ? username : undefined,
      fullName: fullName ? fullName : undefined,
    }),
    [
      pageSize,
      currentPage,
      sortOrder,
      sortField,
      roleId,
      status,
      fullName,
      username,
    ],
  );
  const { mutate: exportUsers, isPending: isExporting } = useExportUsers();
  const { mutate: importUsers, isPending: isImporting } = useImportUsers();
  const { mutate: updatePasswords, isPending: isUpdatingPasswords } =
    useUpdatePasswordsByExcel();
  const { isLoading, isFetching, data, error, isError, isSuccess } =
    useGetUsers(queryKey);
  const {
    data: roles,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    error: errorRoles,
  } = useGetRoles();
  const { mutate: deleteUser, isPending: isDeleteUser } = useDeleteUser();
  const { mutate: deleteUsers, isPending: isDeleteUsers } = useDeleteUsers();

  const [selectedRows, setSelectedRows] = useState([]);

  const canCreate = viewItem("create:user");
  const canDelete = viewItem("delete:user");
  const handleExport = () => {
    exportUsers();
  };

  const uploadProps = {
    accept: ".xlsx,.xls",
    showUploadList: false,
    beforeUpload: (file) => {
      importUsers(file);
      return false; // prevent auto upload by antd
    },
  };
  const passwordUploadProps = {
    accept: ".xlsx,.xls",
    showUploadList: false,
    beforeUpload: (file) => {
      updatePasswords(file);
      return false;
    },
  };

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,

    onChange: (selectedRowKeys, rows) => {
      setSelectedRows(rows.map((row) => row.id));
    },
    getCheckboxProps: (record) => ({
      disabled: user?.data?.id === record.id,
    }),
  };
  const handleChange = (pagination, filters, sorter, extra) => {
    let query = {};
    let hasChanges = false;
    if (sorter?.field && sorter?.order) {
      if (sortField !== sorter.field || sortOrder !== sorter.order) {
        setSortField(sorter.field);
        setSortOrder(sorter.order);
        query.sort = sorter.field;
        query.order = sorter.order === "ascend" ? "asc" : "desc";
        hasChanges = true;
      }
    } else {
      if (sortField || sortOrder) {
        setSortField("");
        setSortOrder("");
        query.sort = undefined;
        query.order = undefined;
        hasChanges = true;
      }
    }

    if (filters.role) {
      query.roleId = filters.role.join(",");
      setRoleId(filters.role);
      hasChanges = true;
    } else if (roleId.length !== 0) {
      query.roleId = undefined;
      hasChanges = true;
      setRoleId([]);
    }
    if (filters.status?.length) {
      query.status = filters.status[0];
      setStatus(filters.status[0]);
      hasChanges = true;
    } else if (status) {
      setStatus(null);
      query.status = undefined;
      hasChanges = true;
    }
    if (hasChanges) {
      query.page = 1;
      addQuery(query);
    }
  };

  const addQuery = (query) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(query).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };
  const onChange = (page, limit) => {
    const newPage = limit !== pageSize ? 1 : page;

    addQuery({
      page: newPage,
      limit,
    });
  };

  const handleDelete = (id) => {
    deleteUser(id);
  };
  const deleteRowSelection = () => {
    deleteUsers(selectedRows, {
      onSuccess: () => {
        setSelectedRows([]);
      },
    });
  };

  const handleUsernameSearch = (value) => {
    setUsername(value || null);

    addQuery({
      username: value || undefined,
      page: 1,
    });
  };

  const handleUsernameReset = () => {
    setUsername(null);

    addQuery({
      username: undefined,
      page: 1,
    });
  };

  const handleFullNameSearch = (value) => {
    setFullName(value || null);

    addQuery({
      fullName: value || undefined,
      page: 1,
    });
  };

  const handleFullNameReset = () => {
    setFullName(null);

    addQuery({
      fullName: undefined,
      page: 1,
    });
  };
  const columns = useMemo(
    () =>
      getUserColumns({
        currentPage,
        pageSize,
        onlineUsers,
        sortField,
        sortOrder,
        user,
        roleId,
        roles,
        status,
        username,
        fullName,
        handleDelete,
        handleFullNameSearch,
        handleFullNameReset,
        handleUsernameReset,
        handleUsernameSearch,
      }),
    [
      currentPage,
      pageSize,
      onlineUsers,
      sortField,
      sortOrder,
      user,
      roleId,
      roles,
      status,
      username,
      fullName,
    ],
  );
  useEffect(() => {
    document.title = "Ulanyjylar | Judge";
  }, []);

  if (isError || isErrorRoles) {
    return <ErrorPage error={error || errorRoles} />;
  }

  return (
    <>
      <PageHeader
        pageName="Ulanyjylar"
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        btn={canCreate}
        btnName="Täze ulanyjynyň maglumatyny goş"
        btnHref="/users/new"
        selectedRows={selectedRows}
        isDelete={isDeleteUsers}
        deleteFn={deleteRowSelection}
        extra={
          <Dropdown
            menu={{
              items: [
                {
                  key: "export",
                  label: "Excel export",
                  icon: <DownloadOutlined />,
                  onClick: handleExport,
                  disabled: isExporting,
                },
                canCreate && {
                  key: "import",
                  label: (
                    <Upload {...uploadProps}>
                      <span>Excel import</span>
                    </Upload>
                  ),
                  icon: <FileExcelOutlined />,
                  disabled: isImporting,
                },
                canCreate && {
                  key: "update-passwords",
                  label: (
                    <Upload {...passwordUploadProps}>
                      <span>Update passwords (Excel)</span>
                    </Upload>
                  ),
                  icon: <KeyOutlined />,
                  disabled: isUpdatingPasswords,
                },
              ].filter(Boolean),
            }}
            trigger={["click"]}
          >
            <Button
              icon={
                <img
                  src={excelIcon}
                  alt="Excel"
                  style={{ width: 16, height: 16 }}
                />
              }
              loading={isExporting || isImporting || isUpdatingPasswords}
            >
              Excel
            </Button>
          </Dropdown>
        }
      />

      <section className="bg-white rounded shadow mt-3">
        <Table
          loading={isFetching || isLoading}
          pagination={false}
          bordered={true}
          dataSource={data?.data || []}
          rowKey="id"
          columns={columns}
          onChange={handleChange}
          scroll={{
            x: "max-content",
            y: "450px",
          }}
          rowSelection={canDelete ? rowSelection : null}
        >
          {/* <Column
            title="T/b"
            key="index"
            fixed="left"
            width={50}
            render={(text, record, index) => (
              <span>{(currentPage - 1) * pageSize + index + 1}</span>
            )}
          />
          <Column
            title="Ady"
            dataIndex="fullName"
            key="fullName"
            fixed="left"
          />
          <Column title="Logini" dataIndex="username" key="username" />
          <Column
            title="Soňky giren wagty"
            dataIndex="lastLogin"
            key="lastLogin"
            sorter
            sortOrder={sortField === "lastLogin" ? sortOrder : null}
            render={(text, record) =>
              onlineUsers.includes(String(record.id)) ? (
                <span className="font-semibold text-green-600">Online</span>
              ) : text ? (
                dayjs(text).format("DD/MM/YYYY HH:mm")
              ) : (
                "----"
              )
            }
          />
          
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            render={(text) => (
              <Tag
                variant="solid"
                color={
                  text === "active"
                    ? "success"
                    : text === "inactive"
                      ? "default"
                      : "error"
                }
              >
                {text}
              </Tag>
            )}
          />
          <Column
            title="Sazlamalar"
            key="id"
            dataIndex="id"
            fixed="right"
            width={100}
            render={(text) =>
              user?.data?.id !== text && (
                <div className="flex flex-row items-center gap-2">
                  <Link to={`/users/${text}/`}>
                    {" "}
                    <EditOutlined />{" "}
                  </Link>

                  <Popconfirm
                    title="Siz hakykatdanam bu ygtyýarlygy pozmak isleýärsiňizmi?"
                    okText="Hawa"
                    cancelText="Ýok"
                    onConfirm={() => handleDelete(text)}
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                </div>
              )
            }
          /> */}
        </Table>
      </section>
      <div className="bg-white mt-3 py-2 px-3 rounded shadow ">
        <div className="flex flex-row items-center justify-end gap-2">
          <Pagination
            total={isSuccess ? data.count : 0}
            showSizeChanger
            pageSizeOptions={[20, 50, 75, 100, 200]}
            onChange={onChange}
            pageSize={pageSize}
            current={currentPage}
          />
        </div>
      </div>
    </>
  );
};

export default UsersPage;
