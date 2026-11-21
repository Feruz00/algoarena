import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Empty, Modal, Spin, Table, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import toast from "react-hot-toast";
import Confetti from "react-confetti";

import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import { useSocket } from "../../context/SocketContext";

// Replace these import paths with your existing file paths.
import { useContestResults } from "./useContestResults";
// import { stopContest } from "../api/contests";

dayjs.extend(duration);

const { Title, Text } = Typography;

const formatDuration = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatElapsed = (milliseconds) => {
  if (milliseconds == null || !Number.isFinite(Number(milliseconds))) {
    return "—";
  }

  const totalSeconds = Math.max(0, Math.floor(Number(milliseconds) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
};

const getRankStyle = (rank) => {
  if (rank === 1) {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  }

  if (rank === 2) {
    return "border-gray-400/40 bg-gray-400/10 text-gray-300";
  }

  if (rank === 3) {
    return "border-orange-500/40 bg-orange-500/10 text-orange-400";
  }

  return "border-gray-700 bg-gray-800/70 text-gray-400";
};

const getStatusInfo = (status) => {
  switch (status) {
    case "running":
    case "started":
    case "active":
      return {
        label: "Dowam edýär",
        color: "green",
      };

    case "finished":
    case "completed":
      return {
        label: "Tamamlandy",
        color: "red",
      };

    case "upcoming":
    case "scheduled":
    case "pending":
      return {
        label: "Başlamady",
        color: "blue",
      };

    default:
      return {
        label: status || "Näbelli",
        color: "default",
      };
  }
};

const ContestResultsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { socket } = useSocket();
  // const [liveResults, setLiveResults] = useState(null);

  const {
    isLoading,
    data: queryData,
    isError,
    error,
    refetch,
    isSuccess,
  } = useContestResults(id);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [now, setNow] = useState(() => Date.now());
  const [showWinner, setShowWinner] = useState(false);

  // Supports either an Axios response or an already-unwrapped response.
  const payload = useMemo(() => {
    if (queryData?.data?.data?.users) return queryData.data.data;
    if (queryData?.data?.users) return queryData.data;
    return queryData;
  }, [queryData]);

  const contest = payload?.contest;
  const [users, setUsers] = useState([]);
  const problems = payload?.problems ?? users[0]?.problems ?? [];

  const [updatedIds, setUpdatedIds] = useState(new Set());

  useEffect(() => {
    if (!queryData?.data?.users) return;

    const st = [...queryData.data.users];

    st.sort(
      (a, b) =>
        (Number(b.score) || 0) - (Number(a.score) || 0) ||
        (Number(a.time) || 0) - (Number(b.time) || 0),
    );

    setUsers(st);
  }, [queryData]);

  const winner = users[0] ?? null;
  const statusInfo = getStatusInfo(contest?.status);

  const startsAt = useMemo(
    () =>
      contest?.startTime && dayjs(contest.startTime).isValid()
        ? dayjs(contest.startTime)
        : null,
    [contest?.startTime],
  );

  // Assumes contest.duration is stored in minutes.
  const endsAt = useMemo(
    () =>
      startsAt && Number(contest?.duration) > 0
        ? startsAt.add(Number(contest.duration), "minute")
        : null,
    [startsAt, contest?.duration],
  );

  const isRunning =
    contest?.status === "running" ||
    contest?.status === "started" ||
    contest?.status === "active";

  const isFinished =
    contest?.status === "finished" || contest?.status === "completed";

  useEffect(() => {
    if (!endsAt || isFinished) {
      setTimeLeft("00:00:00");
      return undefined;
    }

    const updateTimer = () => {
      const remaining = endsAt.diff(dayjs());

      setTimeLeft(formatDuration(Math.max(0, remaining)));
      setNow(Date.now());
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endsAt, isFinished]);

  // Socket room subscription and live results updates.
  useEffect(() => {
    if (!socket || !id) return undefined;

    const contestId = Number(id);

    const handleResultsUpdate = (e) => {
      // console.log("Received contest results update:", e);
      // console.log(users);
      setUsers((prev) => {
        setUpdatedIds((prevIds) => new Set(prevIds).add(e.userId));
        // console.log(prev);
        let newUsers = prev;
        const user = prev.find((row) => row.id === e.userId);
        if (!user) {
          const newUser = {
            id: e.userId,
            score: e.score,
            time: e.time,
            problems: problems.map((pr) => ({
              problemId: pr.id,
              title: pr.title,
              score: e.problemId === pr.id ? pr.score : 0,
              time: e.problemId === pr.id ? pr.time : null,
              username: e.username ? e.username : "User unknown",
              total: 1,
            })),
          };
          newUsers.push(newUser);
        } else {
          let totalScore = user.score;
          let totalTime = user.time;

          let index = user.problems.findIndex(
            (row) => row.problemId === e.problemId,
          );
          if (index !== -1) {
            if (user.problems[index].score < e.score) {
              totalScore = totalScore - user.problems[index].score + e.score;
              totalTime = totalTime - user.problems[index].time + e.time;
              user.problems[index].score = e.score;
              user.problems[index].time = e.time;
              user.problems[index].total += 1;

              user.time = totalTime;
              user.score = totalScore;
            }
          }
          newUsers = newUsers.filter((row) =>
            row.id === e.userId ? user : row,
          );
        }
        newUsers.sort(
          (a, b) =>
            (Number(b.score) || 0) - (Number(a.score) || 0) ||
            (Number(a.time) || 0) - (Number(b.time) || 0),
        );
        setTimeout(() => {
          setUpdatedIds((prevIds) => {
            const next = new Set(prevIds);
            next.delete(e.userId);
            return next;
          });
        }, 1300);

        return newUsers;
      });
    };

    const handleContestFinished = (eventData) => {
      if (
        eventData?.contestId != null &&
        Number(eventData.contestId) !== contestId
      ) {
        return;
      }

      setTimeLeft("00:00:00");
      toast.success("Bäsleşik tamamlandy");
      refetch();
    };

    // socket.emit("contest:join", { contestId });
    socket.on("contest:results:update", handleResultsUpdate);
    socket.on("contest:finished", handleContestFinished);

    return () => {
      socket.off("contest:results:update", handleResultsUpdate);
      socket.off("contest:finished", handleContestFinished);
      socket.emit("contest:leave", { contestId });
    };
  }, [socket, id, refetch]);

  const handleStopContest = useCallback(async () => {
    try {
      setStopping(true);

      // await stopContest(id);

      toast.success("Bäsleşik üstünlikli tamamlandy");
      setConfirmVisible(false);
      await refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Bäsleşigi tamamlamak başartmady",
      );
    } finally {
      setStopping(false);
    }
  }, [id, refetch]);

  const columns = useMemo(
    () => [
      {
        title: "T/b",
        key: "index",
        fixed: "left",
        width: 50,
        render: (_, record, index) => index + 1,
      },
      {
        title: "Gatnaşyjy",
        key: "username",
        dataIndex: "username",
        fixed: "left",
        width: 210,
        render: (text) => <p>{text}</p>,
      },
      ...(queryData?.data?.problems || []).map((problem, index) => ({
        title: (
          <div className="font-semibold ">
            <div className="text-center">
              {problem.title || `Mesele ${index + 1}`} (
              {problem.order != null ? `#${problem.order}` : `#${index + 1}`})
            </div>
          </div>
        ),
        key: `problem-${problem.problemId ?? problem.id ?? index}`,
        align: "center",
        width: 110,
        render: (_, record) => {
          const result = (record.problems ?? []).find(
            (item) =>
              Number(item.problemId ?? item.id) ===
              Number(problem.problemId ?? problem.id),
          );

          const score = Number(result?.score) || 0;

          return (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`font-bold ${
                  score > 0 ? "text-green-400" : "text-gray-600"
                }`}
              >
                {score}
              </span>

              {result?.total > 0 && (
                <span className="text-xs text-gray-500">
                  {result.total} tabşyryk
                </span>
              )}
            </div>
          );
        },
      })),
      {
        title: "Umumy bal",
        dataIndex: "score",
        key: "score",
        align: "center",
        width: 125,
        fixed: "right",
        sorter: (a, b) => (Number(a.score) || 0) - (Number(b.score) || 0),
        render: (score, record) => (
          <span
            className={`font-semibold transition-all duration-300 ${
              updatedIds.has(record.id) ? "text-green-400 scale-105" : ""
            }`}
          >
            {Number(score) || 0}
          </span>
        ),
      },
      {
        title: "Jemi wagt",
        dataIndex: "time",
        key: "time",
        align: "center",
        width: 125,
        fixed: "right",
        render: (time) => (
          <span className="font-mono text-purple-300">
            {formatElapsed(time)}
          </span>
        ),
      },
    ],
    [queryData],
  );
  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full">
        <Card>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(-1)}
                >
                  Yza dolan
                </Button>
                <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
              </div>

              <Title level={4}>{contest?.title || "Bäsleşik"}</Title>

              <Text className="">Gatnaşyjylaryň netijeleri</Text>
            </div>

            {isRunning && (
              <Button
                danger
                type="primary"
                icon={<StopOutlined />}
                loading={stopping}
                onClick={() => setConfirmVisible(true)}
                className="shrink-0"
              >
                Bäsleşigi tamamla
              </Button>
            )}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border  p-4">
              <div className="mb-3 flex items-center gap-2 text-sm ">
                <ClockCircleOutlined className="text-green-400" />
                Başlanýan wagty
              </div>
              <div className="text-lg font-semibold text-green-400">
                {startsAt ? startsAt.format("DD.MM.YYYY HH:mm") : "Bellenmedi"}
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="mb-3 flex items-center gap-2 text-sm ">
                <ClockCircleOutlined className="text-red-400" />
                Tamamlanýan wagty
              </div>
              <div className="text-lg font-semibold text-red-400">
                {endsAt ? endsAt.format("DD.MM.YYYY HH:mm") : "Bellenmedi"}
              </div>
            </div>

            <div className="rounded-2xl border  p-4">
              <div className="mb-3 flex items-center gap-2 text-sm ">
                <ClockCircleOutlined className="text-yellow-400" />
                {isFinished ? "Galan wagt" : "Galan wagt"}
              </div>
              <div className="font-mono text-2xl font-bold tracking-wider text-yellow-400">
                {isFinished ? "00:00:00" : timeLeft}
              </div>
              {isRunning && (
                <div className="mt-2 text-xs ">
                  Wagt hakyky wagtda täzelenýär
                </div>
              )}
            </div>

            <div className="rounded-2xl border  p-4">
              <div className="mb-3 flex items-center gap-2 text-sm ">
                <UserOutlined className="text-blue-400" />
                Gatnaşyjylar
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {users.length}
              </div>
              <div className="mt-2 text-xs ">{problems.length} mesele</div>
            </div>
          </div>
        </Card>

        <Table
          rowKey="id"
          bordered
          columns={columns}
          dataSource={users}
          pagination={false}
          scroll={{ x: "max-content" }}
          size="middle"
          className="mt-1"
          rowClassName={(record) =>
            updatedIds.has(record.id) ? "animate-row-update" : ""
          }
        />
      </div>

      {/* Stop contest confirmation */}
      <Modal
        title={<span className="text-white">Bäsleşigi tamamlamak</span>}
        open={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onOk={handleStopContest}
        okText="Hawa, tamamla"
        cancelText="Goýbolsun"
        confirmLoading={stopping}
        okButtonProps={{ danger: true }}
        centered
      >
        <p>
          Bäsleşigi wagtyndan öň tamamlamak isleýärsiňizmi? Bu hereketden soň
          gatnaşyjylar üçin bäsleşik tamamlanan bolar.
        </p>
      </Modal>

      {/* Winner announcement */}
      <Modal
        open={showWinner}
        footer={null}
        closable
        onCancel={() => setShowWinner(false)}
        centered
        width={600}
      >
        <div className="relative flex flex-col items-center py-10 text-center">
          <Confetti
            width={typeof window !== "undefined" ? window.innerWidth : 600}
            height={typeof window !== "undefined" ? window.innerHeight : 800}
            numberOfPieces={250}
            recycle={false}
          />

          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-4xl text-yellow-400">
            <TrophyOutlined />
          </div>

          <h2 className="mb-2 text-3xl font-bold text-yellow-400">Ýeňiji!</h2>

          <p className="mb-6 text-gray-400">Bäsleşigiň iň gowy netijesi</p>

          <div className="w-full rounded-2xl border border-yellow-500/30 bg-gray-900 px-6 py-8">
            <h3 className="text-2xl font-bold text-white">
              {winner?.username || winner?.name || `Ulanyjy ${winner?.id}`}
            </h3>

            <div className="mt-6 flex justify-center gap-12">
              <div>
                <div className="text-sm text-gray-400">Umumy bal</div>
                <div className="mt-1 text-2xl font-bold text-green-400">
                  {winner?.score ?? 0}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Wagt</div>
                <div className="mt-1 font-mono text-2xl font-bold text-purple-300">
                  {formatElapsed(winner?.time)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-green-400">
            <CheckCircleOutlined />
            Bäsleşik üstünlikli tamamlandy
          </div>

          <Button
            type="primary"
            className="mt-6"
            onClick={() => setShowWinner(false)}
          >
            Netijelere geç
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ContestResultsPage;
