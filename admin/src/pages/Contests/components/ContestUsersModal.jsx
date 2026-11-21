import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  useCancelUserToContestManualy,
  useGetUsersByContest,
  useRegisterUserToContestManualy,
} from "../useContests";
import { Modal, Pagination, Segmented, Select, Table } from "antd";
import { getContestUsersColumns } from "./columns";
import { useGetGroups } from "../../Groups/useGroups";

const ContestUsers = ({ id, handleClose }) => {
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [username, setUsername] = useState(null);
  const [fullName, setFullName] = useState(null);

  const [groupId, setGroupId] = useState(null);

  const [type, setType] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setVisible(true);
    } else {
      queryClient.removeQueries({
        queryKey: ["contest-users"],
      });
    }
    return () => {
      setVisible(false);
      setCurrentPage(1);
      setPageSize(20);
      setUsername(null);
      setFullName(null);
      setType("all");
    };
  }, [id, queryClient]);

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField ? sortField : undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      username: username ? username : undefined,
      fullName: fullName ? fullName : undefined,
      status: type !== "all" ? type : undefined,
      groupId: groupId ? groupId : undefined,
    }),
    [
      pageSize,
      currentPage,
      sortOrder,
      sortField,
      fullName,
      username,
      type,
      groupId,
    ],
  );

  const labelOptions = useMemo(() => {
    if (!id) return [];
    const labels = [{ label: "Ählisi", value: "all" }];
    if (["finished", "running"].includes(id.status)) {
      labels.push({ label: "Bloga salynanlar", value: "blocked" });
    } else {
      labels.push({ label: "Hasaba alynmadyklar", value: "not-registered" });
      labels.push({ label: "Hasaba alynanlar", value: "registered" });
    }
    return labels;
  }, [id]);

  const { isLoading, isFetching, isError, data, error, isSuccess } =
    useGetUsersByContest(id ? id.id : null, queryKey);

  const {
    isLoading: isLoadingGroups,
    data: groups,
    isError: isErrorGroups,
    error: errorGroups,
  } = useGetGroups({ sort: "title", order: "asc" });
  const { mutate: registerUser, isPending: isRegisterUser } =
    useRegisterUserToContestManualy();

  const { mutate: cancelUser, isPending: isCancelUser } =
    useCancelUserToContestManualy();

  const handleChange = (pagination, filters, sorter, extra) => {
    if (sorter?.field && sorter?.order) {
      if (sortField !== sorter.field || sortOrder !== sorter.order) {
        setSortField(sorter.field);
        setSortOrder(sorter.order);
      }
    } else {
      if (sortField || sortOrder) {
        setSortField("");
        setSortOrder("");
      }
    }
  };

  const handleUsernameSearch = (value) => {
    setUsername(value || null);
  };

  const handleUsernameReset = () => {
    setUsername(null);
  };

  const handleFullNameSearch = (value) => {
    setFullName(value || null);
  };

  const handleFullNameReset = () => {
    setFullName(null);
  };

  const onChange = (page, limit) => {
    const newPage = limit !== pageSize ? 1 : page;

    setCurrentPage(newPage);
    setPageSize(limit);
  };

  const handleCloseModal = () => {
    setVisible(false);
    handleClose?.();
  };

  const handleRegister = (userId) => {
    registerUser({ id: id.id, data: { userId } });
  };

  const handleCancelRegister = (userId) => {
    cancelUser({ id: id.id, data: { userId } });
  };
  // const handleStart
  const columns = useMemo(
    () =>
      getContestUsersColumns({
        currentPage,
        pageSize,
        sortField,
        sortOrder,
        username,
        fullName,
        isCancelUser,
        isRegisterUser,
        handleCancelRegister,
        handleRegister,
        handleFullNameSearch,
        handleFullNameReset,
        handleUsernameReset,
        handleUsernameSearch,
      }),
    [currentPage, pageSize, sortField, sortOrder, username, fullName, type],
  );

  return (
    <Modal
      title={`${id?.title} - bäsleşige gatnaşyjylar`}
      open={visible}
      loading={isLoading || isLoadingGroups}
      footer={null}
      onCancel={handleCloseModal}
      width={1200}
      className="select-none"
    >
      {(isError || isErrorGroups) && <ErrorPage error={error || errorGroups} />}
      {!(isError && isErrorGroups) && (
        <>
          <div className="flex flex-row gap-4 items-center">
            <Segmented
              options={labelOptions}
              value={type}
              onChange={(val) => setType(val)}
            />
            <Select
              style={{ width: 250 }}
              allowClear
              options={
                groups?.data?.map((row) => ({
                  label: row.title,
                  value: row.id,
                })) || []
              }
              value={groupId}
              onChange={(e) => setGroupId(e)}
            />
          </div>

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
                y: "350px",
              }}
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
                showTotal={(total) => `Jemi ${total} sany`}
              />
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ContestUsers;
