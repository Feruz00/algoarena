import React, { useEffect, useMemo, useState } from "react";
import {
  useDeleteSource,
  useDeleteSources,
  useGetSourceParents,
  useGetSources,
} from "./useSources";
import { Breadcrumb, Button, Pagination, Table } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { viewItem } from "../../utils/user";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";
import { getSourceColumns } from "./columns";
import ViewSource from "./ViewSource";
import classNames from "classnames";

const SourcesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;
  const [sortField, setSortField] = useState(searchParams.get("sort") ?? null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") ?? null);
  const [title, setTitle] = useState(
    searchParams.get("title") ? searchParams.get("title") : null,
  );

  const [viewId, setViewId] = useState(null);

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField ? sortField : undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      title: title ? title : undefined,
      parentId: id ? id : undefined,
    }),
    [pageSize, currentPage, sortOrder, sortField, title, id],
  );
  const {
    isFetching: isFetchingParents,
    data: parents,
    error: errorParents,
    isError: isErrorParents,
    isSuccess: isSuccessParents,
  } = useGetSourceParents(id);
  const { isLoading, isFetching, data, error, isError, isSuccess } =
    useGetSources(queryKey);
  const { mutate: deleteSource, isPending: isDeleteSource } = useDeleteSource();
  const { mutate: deleteSources, isPending: isDeleteSources } =
    useDeleteSources();

  const [selectedRows, setSelectedRows] = useState([]);
  const canCreate = viewItem("create:source");
  const canDelete = viewItem("delete:source");

  const canEdit = viewItem("update:source");

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
    deleteSource(id);
  };
  const deleteRowSelection = () => {
    deleteSources(selectedRows, {
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
  const handleSetView = (id) => {
    setViewId(id);
  };
  const handleResetView = () => {
    setViewId(null);
  };

  const columns = useMemo(
    () =>
      getSourceColumns({
        currentPage,
        pageSize,
        sortField,
        sortOrder,
        handleDelete,
        handleTitleReset,
        handleTitleSearch,
        canDelete,
        canEdit,
        title,
        handleSetView,
      }),
    [currentPage, pageSize, sortField, sortOrder, title, canDelete, canEdit],
  );

  useEffect(() => {
    document.title = "Çeşmeler | Judge";
  }, []);

  if (isError) {
    return <ErrorPage error={error} />;
  }
  return (
    <>
      <PageHeader
        pageName=""
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        btn={canCreate}
        btnName="Täze çeşmäniň maglumatyny goş"
        btnHref={"/sources/new"}
        selectedRows={selectedRows}
        isDelete={isDeleteSources}
        deleteFn={deleteRowSelection}
      >
        <Breadcrumb
          className="mb-3"
          items={[
            {
              title: (
                <span
                  className="cursor-pointer"
                  onClick={() => navigate("/sources")}
                >
                  {" "}
                  Çeşmeler{" "}
                </span>
              ),
            },
            ...(id
              ? isFetchingParents
                ? [{ title: "Ýüklenýär..." }]
                : (parents?.data || parents || []).map((item, index, arr) => ({
                    title:
                      index === arr.length - 1 ? (
                        <span className="font-medium">{item.titleTm}</span>
                      ) : (
                        <span
                          className="cursor-pointer"
                          onClick={() => navigate(`/sources/${item.id}`)}
                        >
                          {item.titleTm}{" "}
                        </span>
                      ),
                  }))
              : []),
          ]}
        />
      </PageHeader>
      <section className="bg-white rounded shadow mt-3">
        <Table
          loading={isFetching || isLoading}
          pagination={false}
          bordered={true}
          dataSource={data?.data || []}
          rowKey="id"
          columns={columns}
          onRow={(record) => ({
            onClick: () => {
              if (record?.childrens?.length) navigate(`/sources/${record.id}`);
            },
            className: classNames(
              record?.childrens?.length ? "cursor-pointer" : "cursor-default",
            ),
          })}
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
      <ViewSource id={viewId} handleClose={handleResetView} />
    </>
  );
};

export default SourcesPage;
