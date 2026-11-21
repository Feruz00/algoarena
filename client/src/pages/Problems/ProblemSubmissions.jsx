import { useEffect, useMemo, useState } from "react";
import { Button, Table, Tag, Space, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import StatusTag from "../../components/ui/StatusTag";
import { useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import { useGetSubmissions } from "../Submissions/useSubmissions";
import dayjs from "dayjs";
import SubmissionDetailModal from "./SubmissionDetailModal";
import { getDataByLanguage } from "../../utils/functions";

const LANGUAGE_NAMES = {
  cpp: "C++",
  cpp14: "C++14",
  cpp17: "C++17",
  cpp20: "C++20",
  cpp23: "C++23",
  python3: "Python 3",
  pascal: "Free Pascal",
  go: "Go",
  java11: "Java 11",
  java17: "Java 17",
  java21: "Java 21",
};
const ProblemSubmissions = () => {
  const { t, i18n } = useTranslation();
  const { problemId, id } = useParams();
  const { socket } = useContext(SocketContext);
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [liveSubmissions, setLiveSubmissions] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const location = useLocation();

  const isContestRoute = location.pathname.startsWith("/contests/");
  const isSourceRoute = location.pathname.startsWith("/sources/");

  const queryKey = useMemo(
    () => ({
      problemId,
      page: currentPage,
      limit: pageSize,
      sourceId: isSourceRoute ? id : undefined,
      contestId: isContestRoute ? id : undefined,
    }),
    [problemId, currentPage, pageSize, isSourceRoute, isContestRoute],
  );

  const { isFetching, isLoading, isError, data, error } =
    useGetSubmissions(queryKey);

  useEffect(() => {
    if (!socket) return;

    const handleJudgeUpdate = (event) => {
      if (!event?.submissionId) return;

      // Only update submissions for this problem.
      if (
        event.problemId != null &&
        String(event.problemId) !== String(problemId)
      ) {
        return;
      }

      const id = String(event.submissionId);

      setLiveSubmissions((previous) => ({
        ...previous,
        [id]: {
          ...previous[id],
          ...event,
        },
      }));

      // Refresh persisted results after judging finishes.
      if (event.status === "FINISHED") {
        queryClient.invalidateQueries({
          queryKey: ["submissions"],
        });
      }
    };

    socket.on("judge:update", handleJudgeUpdate);

    return () => {
      socket.off("judge:update", handleJudgeUpdate);
    };
  }, [socket, problemId, queryClient]);

  const getProgress = (submission) => {
    const live = liveSubmissions[String(submission.id)];

    const rawStatus = live?.status ?? submission.status;
    const status = String(rawStatus ?? "queue").toLowerCase();
    const verdict = live?.verdict ?? submission.verdict;

    if (status === "compiling") {
      return (
        <Space size={6}>
          <Spin size="small" />
          <StatusTag status="compiling" />
        </Space>
      );
    }

    if (status === "running") {
      const test = live?.testcase;
      const group = live?.testgroup;

      return (
        <Space size={4} wrap>
          <Spin size="small" />
          <StatusTag status="running" />
          {test != null && <Tag color="blue">Test {test}</Tag>}
          {group != null && <Tag color="purple">Group {group}</Tag>}
        </Space>
      );
    }

    if (status === "queue" || status === "queued") {
      return <StatusTag status="queue" />;
    }

    if (status === "finished") {
      return verdict ? (
        <StatusTag status={verdict} />
      ) : (
        <StatusTag status="finished" />
      );
    }

    return <StatusTag status={status} />;
  };

  const subColumns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (_, submission) => (
        <Button
          type="link"
          className="px-0!"
          onClick={() => {
            const live = liveSubmissions[String(submission.id)];

            setSelectedSubmission({
              ...submission,
              ...(live ?? {}),
            });
          }}
        >
          {submission.id}
        </Button>
      ),
    },
    {
      title: t("common.user"),
      key: "user",
      dataIndex: "user",
      render: (user) => <span>{user?.username}</span>,
    },
    {
      title: t("common.problem"),
      key: "problem",
      dataIndex: "problem",
      render: (problem) => (
        <span>{getDataByLanguage(problem, "title", i18n.language)}</span>
      ),
    },
    {
      title: t("common.verdict"),
      key: "verdict",
      render: (_, submission) => getProgress(submission),
    },
    {
      title: t("common.score"),
      key: "score",
      dataIndex: "score",
      // render: (_, submission) => getProgress(submission),
    },
    {
      title: t("common.language"),
      dataIndex: "lang",
      key: "lang",
      render: (lang) => LANGUAGE_NAMES[lang] ?? lang ?? "-",
    },
    {
      title: t("common.date"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (p) => dayjs(p).format("DD/MM/YYYY HH:mm"),
    },
  ];

  if (isError) return <ErrorPage error={error} />;

  const rows = (data?.data ?? []).map((submission) => {
    const live = liveSubmissions[String(submission.id)];

    return live ? { ...submission, ...live } : submission;
  });

  return (
    <>
      <Table
        rowKey="id"
        loading={isFetching || isLoading}
        columns={subColumns}
        dataSource={rows}
        pagination={{
          current: currentPage,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 500 }}
      />

      <SubmissionDetailModal
        open={Boolean(selectedSubmission)}
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </>
  );
};

export default ProblemSubmissions;
