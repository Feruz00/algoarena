import { useEffect, useMemo, useRef, useState } from "react";
import { useDeleteRole, useDeleteRoles, useGetRoles } from "./useRoles";
import PageHeader from "../../components/PageHeader";
import { viewItem } from "../../utils/user";
import ErrorPage from "../../components/ErrorPage";
import { Pagination, Popconfirm, Table } from "antd";
import { Link, useSearchParams } from "react-router";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import useAuthStore from "../../store/authStore";

const { Column } = Table;

const RolesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const pageSize = Number(searchParams.get("limit")) || 20;

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
    }),
    [pageSize, currentPage],
  );

  const { isLoading, isFetching, data, error, isError, isSuccess } =
    useGetRoles(queryKey);
  const user = useAuthStore((store) => store.user);

  const tableContainerRef = useRef(null);
  const [tableHeight, setTableHeight] = useState(0);

  const { mutate: deleteRole, isPending: isDeleteRole } = useDeleteRole();
  const { mutate: deleteRoles, isPending: isDeleteRoles } = useDeleteRoles();

  const [selectedRows, setSelectedRows] = useState([]);

  const canCreateRole = viewItem("create:role");
  const canDeleteRole = viewItem("delete:role");

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,

    onChange: (selectedRowKeys, rows) => {
      setSelectedRows(rows.map((row) => row.id));
    },
    getCheckboxProps: (record) => ({
      disabled: user?.data?.roleId === record.id || record.id === 1,
    }),
  };

  const handleChange = (pagination, filters, sorter) => {};

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
    deleteRole(id);
  };
  const deleteRowSelection = () => {
    deleteRoles(selectedRows, {
      onSuccess: () => {
        setSelectedRows([]);
      },
    });
  };
  useEffect(() => {
    document.title = "Ygtyýarlyklar | Judge";
  }, []);
  useEffect(() => {
    const element = tableContainerRef.current;

    if (!element) return;
    const updateHeight = () => {
      const height = element.clientHeight;

      setTableHeight(Math.max(height - 55, 100));
    };
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);
  if (isError) {
    return <ErrorPage error={error} />;
  }
  return (
    <div className="h-full min-h-0 flex flex-col">
      <PageHeader
        pageName="Ygtyýarlyklar"
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        btn={canCreateRole}
        btnName="Täze ygtyýarlygyň maglumatyny goş"
        btnHref="/roles/new"
        selectedRows={selectedRows}
        isDelete={isDeleteRoles}
        deleteFn={deleteRowSelection}
      />
      <section className="bg-white rounded shadow mt-3 ">
        <Table
          loading={isFetching || isLoading}
          pagination={false}
          bordered={true}
          dataSource={data?.data || []}
          rowKey="id"
          onChange={handleChange}
          scroll={{
            x: "max-content",
            y: "450px",
          }}
          rowSelection={canDeleteRole ? rowSelection : null}
        >
          <Column
            title="T/b"
            key="index"
            fixed="left"
            width={50}
            render={(text, record, index) => (
              <span>{(currentPage - 1) * pageSize + index + 1}</span>
            )}
          />
          <Column title="Ady" dataIndex="label" key="label" />
          <Column title="Synanyşma wagty(minut)" dataIndex="time" key="time" />
          <Column title="Synanyşma sany" dataIndex="maxCount" key="maxCount" />
          <Column
            title="Sazlamalar"
            key="id"
            dataIndex="id"
            fixed="right"
            width={100}
            render={(text) =>
              user?.data?.roleId !== text && (
                <div className="flex flex-row items-center gap-2">
                  <Link to={`/roles/${text}/`}>
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
          />
        </Table>
      </section>
      <div className="bg-white mt-3 py-2 px-3 rounded shadow flex flex-row items-center justify-end gap-4 shrink-0">
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
    </div>
  );
};

export default RolesPage;
