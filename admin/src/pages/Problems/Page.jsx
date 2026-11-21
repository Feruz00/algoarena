import React, { useEffect, useMemo, useState } from "react";
import { Button, Pagination, Table, Tooltip } from "antd";
import { EyeOutlined, ExperimentOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router";

import {
  useDeleteProblem,
  useDeleteProblems,
  useGetProblems,
} from "./hooks/useProblems";
import { viewItem } from "../../utils/user";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";
import { getProblemColumns } from "./components/columns";
import ProblemDetailsDrawer from "./ProblemDetailsDrawer";
import { useGetTags } from "../Tags/useTags";

const Page = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;

  const [sortField, setSortField] = useState(searchParams.get("sort") || null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || null);
  const [title, setTitle] = useState(searchParams.get("title") || null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tagIds, setTagIds] = useState(
    searchParams.get("title")?.split(",").map(Number) || [],
  );
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") ? searchParams.get("difficulty") : null,
  );

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField || undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      title: title || undefined,
      tagIds: tagIds.length ? tagIds.join(",") : undefined,
      difficulty: difficulty ? difficulty : undefined,
    }),
    [currentPage, pageSize, sortField, sortOrder, title, tagIds, difficulty],
  );

  const { data, error, isError, isLoading, isFetching, isSuccess } =
    useGetProblems(queryKey);

  const {
    data: tags,
    isSuccess: isSuccessTags,
    isError: isErrorTags,
    error: errorTags,
  } = useGetTags({
    limit: 200,
  });

  const { mutate: deleteProblem } = useDeleteProblem();
  const { mutate: deleteProblems, isPending: isDeleteProblems } =
    useDeleteProblems();

  const canCreate = viewItem("create:problem");
  const canDelete = viewItem("delete:problem");
  const canEdit = viewItem("update:problem");
  const canView = viewItem("get:problem");

  const addQuery = (query) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const handleChange = (_, filters, sorter) => {
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

    if (filters.tags?.length) {
      query.tags = filters.tags.join(",");
      setTagIds(filters.tags);
      hasChanges = true;
    } else if (tagIds.length !== 0) {
      query.tags = undefined;
      hasChanges = true;
      setTagIds([]);
    }
    if (filters.difficulty?.length) {
      query.difficulty = filters.difficulty[0];
      setDifficulty(filters.difficulty[0]);
      hasChanges = true;
    } else if (difficulty) {
      setDifficulty(null);
      query.difficulty = undefined;
      hasChanges = true;
    }
    if (hasChanges) {
      query.page = 1;
      addQuery(query);
    }
  };

  const handlePaginationChange = (page, limit) => {
    addQuery({
      page: limit !== pageSize ? 1 : page,
      limit,
    });
  };

  const handleTitleSearch = (value) => {
    const nextTitle = value || null;
    setTitle(nextTitle);
    addQuery({ title: nextTitle || undefined, page: 1 });
  };

  const handleTitleReset = () => {
    setTitle(null);
    addQuery({ title: undefined, page: 1 });
  };

  const handleDelete = (id) => {
    deleteProblem(id, {
      onSuccess: () => {
        setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
      },
    });
  };

  const handleBulkDelete = () => {
    deleteProblems(selectedRows, {
      onSuccess: () => setSelectedRows([]),
    });
  };

  const openDetails = (id) => {
    setSelectedProblemId(id);
    setDrawerOpen(true);
  };

  const closeDetails = () => {
    setDrawerOpen(false);
  };

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys) => setSelectedRows(selectedRowKeys),
  };

  const columns = useMemo(
    () =>
      getProblemColumns({
        currentPage,
        pageSize,
        sortField,
        sortOrder,
        title,
        tagIds,
        tags,
        difficulty,
        handleDelete,
        handleSearch: handleTitleSearch,
        handleReset: handleTitleReset,
        onView: openDetails,
        canView,
        canEdit,
        canDelete,
      }),
    [
      currentPage,
      pageSize,
      sortField,
      sortOrder,
      title,
      tags,
      difficulty,
      tagIds,
      canView,
      canEdit,
      canDelete,
    ],
  );

  useEffect(() => {
    document.title = "Meseleler | Judge";
  }, []);

  if (isError || isErrorTags) {
    return <ErrorPage error={error || errorTags} />;
  }

  return (
    <>
      <PageHeader
        pageName="Meseleler"
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        btn={canCreate}
        btnName="Täze mesele goş"
        btnHref="/problems/new"
        selectedRows={selectedRows}
        isDelete={isDeleteProblems}
        deleteFn={handleBulkDelete}
      />

      <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table
          loading={isFetching || isLoading}
          pagination={false}
          bordered={false}
          dataSource={data?.data || []}
          rowKey="id"
          columns={columns}
          onChange={handleChange}
          scroll={{ x: "max-content", y: "450px" }}
          rowSelection={canDelete ? rowSelection : null}
          size="middle"
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <div className="mb-2 text-slate-400">
                  <ExperimentOutlined style={{ fontSize: 28 }} />
                </div>
                <div className="font-medium text-slate-600">
                  Mesele tapylmady
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Gözleg şertlerini üýtgedip görüň.
                </div>
              </div>
            ),
          }}
        />
      </section>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
        <div className="flex justify-end">
          <Pagination
            total={isSuccess ? data?.count || 0 : 0}
            showSizeChanger
            responsive
            pageSizeOptions={[20, 50, 75, 100, 200]}
            onChange={handlePaginationChange}
            pageSize={pageSize}
            current={currentPage}
            showTotal={(total) => `${total} mesele`}
          />
        </div>
      </div>

      <ProblemDetailsDrawer
        open={drawerOpen}
        problemId={selectedProblemId}
        onClose={closeDetails}
      />
    </>
  );
};

export default Page;
