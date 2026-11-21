import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useDeleteGroup, useDeleteGroups, useGetGroups } from "./useGroups";
import { viewItem } from "../../utils/user";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";
import { getGroupColumns } from "./columns";
import { Pagination, Table, Button, Upload, Space, Dropdown } from "antd";
import {
  FileExcelOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useExportGroups, useImportGroups } from "./useGroups";
import excelIcon from "../../assets/excel.svg";
const Page = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;
  const [sortField, setSortField] = useState(searchParams.get("sort") ?? null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") ?? null);

  const [title, setTitle] = useState(
    searchParams.get("title") ? searchParams.get("title") : null,
  );

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField ? sortField : undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      title: title ? title : undefined,
    }),
    [pageSize, currentPage, sortOrder, sortField, title],
  );

  const { isLoading, isFetching, data, error, isError, isSuccess } =
    useGetGroups(queryKey);

  const { mutate: exportGroups, isPending: isExporting } = useExportGroups();
  const { mutate: importGroups, isPending: isImporting } = useImportGroups();
  const { mutate: deleteGroup, isPending: isDeleteGroup } = useDeleteGroup();
  const { mutate: deleteGroups, isPending: isDeleteGroups } = useDeleteGroups();

  const [selectedRows, setSelectedRows] = useState([]);

  const canCreate = viewItem("create:group");
  const canDelete = viewItem("delete:group");
  const canEdit = viewItem("update:group");

  const handleExport = () => {
    exportGroups();
  };

  const uploadProps = {
    accept: ".xlsx,.xls",
    showUploadList: false,
    beforeUpload: (file) => {
      importGroups(file);
      return false; // prevent auto upload
    },
  };

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,

    onChange: (selectedRowKeys, rows) => {
      setSelectedRows(rows.map((row) => row.id));
    },
    // getCheckboxProps: (record) => ({
    //   disabled: user?.data?.id === record.id,
    // }),
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
    deleteGroup(id);
  };
  const deleteRowSelection = () => {
    deleteGroups(selectedRows, {
      onSuccess: () => {
        setSelectedRows([]);
      },
    });
  };

  const handleTitleSearch = (value) => {
    setTitle(value || null);

    addQuery({
      title: value || undefined,
      page: 1,
    });
  };

  const handleTitleReset = () => {
    setTitle(null);

    addQuery({
      title: undefined,
      page: 1,
    });
  };
  const columns = useMemo(
    () =>
      getGroupColumns({
        currentPage,
        pageSize,
        sortField,
        sortOrder,
        handleDelete,
        title,
        handleSearch: handleTitleSearch,
        handleReset: handleTitleReset,
        canEdit,
        canDelete,
      }),
    [currentPage, pageSize, sortField, sortOrder, title, canEdit, canDelete],
  );

  useEffect(() => {
    document.title = "Toparlar | Judge";
  }, []);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader
        pageName="Toparlar"
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        btn={canCreate}
        btnName="Täze toparyň maglumatyny goş"
        btnHref="/groups/new"
        selectedRows={selectedRows}
        isDelete={isDeleteGroups}
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
              ].filter(Boolean),
            }}
            trigger={["click"]}
          >
            <Button
              // icon={<FileExcelOutlined style={{ color: "#217346" }} />}
              icon={
                <img
                  src={excelIcon}
                  alt="Excel"
                  style={{ width: 16, height: 16 }}
                />
              }
              loading={isExporting || isImporting}
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
        ></Table>
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

export default Page;
