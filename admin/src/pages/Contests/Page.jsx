import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  useDeleteContest,
  useDeleteContests,
  useGetContests,
  useStartContest,
  useStopContest,
} from "./useContests";
import { viewItem } from "../../utils/user";
import { getContestColumns } from "./columns";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";
import { Pagination, Segmented, Table } from "antd";
import ContestUsers from "./components/ContestUsersModal";
import { useExportGroups, useGetGroups } from "../Groups/useGroups";
import { useExportContestResults } from "../ContestResults/useContestResults";

const Contests = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;
  const [sortField, setSortField] = useState(searchParams.get("sort") ?? null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") ?? null);

  const [title, setTitle] = useState(
    searchParams.get("title") ? searchParams.get("title") : null,
  );

  const [status, setStatus] = useState(
    searchParams.get("status") ? searchParams.get("status") : "scheduled",
  );

  const { mutate: exportContestResults, isPending: isExporting } =
    useExportContestResults();

  const [viewId, setViewId] = useState(null);
  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField ? sortField : undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      title: title ? title : undefined,
      status: status ? status : undefined,
    }),
    [pageSize, currentPage, sortOrder, sortField, title, status],
  );
  const { isLoading, isFetching, data, error, isError, isSuccess } =
    useGetContests(queryKey);

  const { mutate: deleteContest, isPending: isDeleteContest } =
    useDeleteContest();
  const { mutate: deleteContests, isPending: isDeleteContests } =
    useDeleteContests();

  const { mutate: startContest, isPending: isStartContest } = useStartContest();

  const { mutate: stopContest, isPending: isStopContest } = useStopContest();

  const handleExport = (id) => {
    exportContestResults(id);
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const canCreate = viewItem("create:contest");
  const canDelete = viewItem("delete:contest");
  const canEdit = viewItem("update:contest");

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,

    onChange: (selectedRowKeys, rows) => {
      setSelectedRows(rows.map((row) => row.id));
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === "running",
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
    deleteContest(id);
  };
  const deleteRowSelection = () => {
    deleteContests(selectedRows, {
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

  const handleStartContest = (id) => {
    startContest(id, {
      onSuccess: () => {
        addQuery({
          status: "running",
          page: 1,
        });
        setStatus("running");
      },
    });
  };

  const handleStopContest = (id) => {
    stopContest(id, {
      onSuccess: () => {
        addQuery({
          status: "finished",
          page: 1,
        });
        setStatus("finished");
      },
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
      getContestColumns({
        currentPage,
        pageSize,
        sortField,
        sortOrder,
        title,
        handleTitleSearch,
        handleTitleReset,
        handleDelete,
        handleStartContest,
        handleStopContest,
        isStartContest,
        isStopContest,
        canEdit,
        canDelete,
        navigate,
        handleSetView,
        handleExport,
      }),
    [
      navigate,
      currentPage,
      pageSize,
      sortField,
      sortOrder,
      title,
      handleTitleSearch,
      handleTitleReset,
      handleDelete,
      isStartContest,
      isStopContest,
      canEdit,
      canDelete,
    ],
  );

  useEffect(() => {
    document.title = "Bäsleşikler | Judge";
  }, []);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader
        pageName="Bäsleşikler"
        isSuccess={isSuccess}
        filteredTagsCount={data?.count}
        btn={canCreate}
        btnName="Täze bäsleşigiň maglumatyny goş"
        btnHref="/contests/new"
        selectedRows={selectedRows}
        isDelete={isDeleteContests}
        deleteFn={deleteRowSelection}
      >
        <Segmented
          options={[
            { label: "Başlamadyklar", value: "scheduled" },
            { label: "Tamamlananlar", value: "finished" },
            { label: "Gidip duranlar", value: "running" },
          ]}
          value={status}
          onChange={(value) => {
            setStatus(value);
            addQuery({
              status: value || undefined,
              page: 1,
            });
          }}
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

      <ContestUsers id={viewId} handleClose={handleResetView} />
    </>
  );
};

export default Contests;
