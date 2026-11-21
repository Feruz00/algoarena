import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  useGetDeletedItems,
  useRestoreItem,
  useDeleteItem,
  useDeleteItems,
} from "./useRestore";
import { viewItem } from "../../utils/user";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";
import { getRestoreColumns } from "./columns";
import { Pagination, Table, Select, Space } from "antd";

const entityOptions = [
  { value: "users", label: "Ulanyjylar" },
  { value: "contests", label: "Bäsleşikler" },
  { value: "sources", label: "Çeşmeler" },

  { value: "groups", label: "Toparlar" },
  { value: "problems", label: "Meseleler" },
  { value: "roles", label: "Ygtyýarlyklar" },
];

const RestorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;
  const [sortField, setSortField] = useState(searchParams.get("sort") ?? null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") ?? null);

  const entity = searchParams.get("key") || "users";

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      key: entity,
      sort: sortField ? sortField : undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
    }),
    [pageSize, currentPage, sortOrder, sortField, entity],
  );

  const { isLoading, isFetching, data, error, isError, isSuccess } =
    useGetDeletedItems(queryKey);

  const { mutate: restoreItemMutate, isPending: isRestoring } =
    useRestoreItem();
  const { mutate: deleteItemMutate, isPending: isDeleting } = useDeleteItem();
  const { mutate: deleteItemsMutate, isPending: isDeletingMany } =
    useDeleteItems();

  const [selectedRows, setSelectedRows] = useState([]);

  const canRestore = viewItem("restore:access") || viewItem("admin:access");
  const canForceDelete = viewItem("restore:access") || viewItem("admin:access");

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys) => {
      setSelectedRows(selectedRowKeys);
    },
  };

  const handleChange = (pagination, filters, sorter) => {
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

  const handleEntityChange = (value) => {
    setSelectedRows([]);

    addQuery({
      key: value,
      page: 1,
    });
  };
  const handleRestore = useCallback(
    (id) => {
      restoreItemMutate(
        { id, key: entity },
        {
          onSuccess: () => {
            setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
          },
        },
      );
    },
    [entity, restoreItemMutate],
  );

  const handleForceDelete = useCallback(
    (id) => {
      deleteItemMutate(
        { id, key: entity },
        {
          onSuccess: () => {
            setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
          },
        },
      );
    },
    [entity, deleteItemMutate],
  );

  const handleForceDeleteMany = () => {
    if (selectedRows.length === 0) return;

    deleteItemsMutate(selectedRows, {
      onSuccess: () => {
        setSelectedRows([]);
      },
    });
  };
  const columns = useMemo(
    () =>
      getRestoreColumns({
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
      }),
    [
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
    ],
  );

  useEffect(() => {
    document.title = "Pozulanlary dikeltmek | Judge";
  }, []);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader
        pageName="Pozulan elementleri dikeltmek"
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        selectedRows={selectedRows}
        isDelete={isDeletingMany}
        deleteFn={handleForceDeleteMany}
        deleteBtnName="Saýlananlary poz"
        extra={
          <Space>
            <Select
              value={entity}
              onChange={handleEntityChange}
              style={{ width: 180 }}
              options={entityOptions}
              placeholder="Görnüşi saýlaň"
            />
          </Space>
        }
      />

      <section className="bg-white rounded shadow mt-3">
        <Table
          loading={
            isFetching ||
            isLoading ||
            isRestoring ||
            isDeleting ||
            isDeletingMany
          }
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
          rowSelection={canForceDelete ? rowSelection : null}
        />
      </section>

      <div className="bg-white mt-3 py-2 px-3 rounded shadow">
        <div className="flex flex-row items-center justify-end gap-2">
          <Pagination
            total={isSuccess ? data?.count || 0 : 0}
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

export default RestorePage;
