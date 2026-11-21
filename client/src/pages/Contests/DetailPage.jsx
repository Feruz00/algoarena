import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import StatusTag from "../../components/ui/StatusTag";
import { contests, contestProblems, problems } from "../../data/mockData";
import { useGetContest, useGetContestProblems } from "./useContest";
import ErrorPage from "../../components/ErrorPage";
import Loading from "../../components/Loading";
import { useGetProblems } from "../Problems/useProblems";
import dayjs from "dayjs";
import { viewItem } from "../../utils/user";
import { getDataByLanguage } from "../../utils/functions";

const { Text } = Typography;
const meta = {
  1: { difficulty: "Mixed", prize: "Rating" },
  2: { difficulty: "Beginner", prize: "Practice" },
  3: { difficulty: "Advanced", prize: "Rating" },
  4: { difficulty: "Mixed", prize: "Archived" },
};

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isLoading, data, error, isError } = useGetContest(id);
  const [timer, setTimer] = useState(null);

  const canShowTag = viewItem("use:tags");
  useEffect(() => {
    if (!data?.data) return;
    if (data.data.status !== "scheduled") return;
    if (!data?.data?.startTime) return;

    const interval = setInterval(() => {
      let seconds = dayjs(data.data.startTime).diff(dayjs(), "second");
      if (seconds <= 0) {
        setTimer(null);
        clearInterval(interval);
        return;
      }
      const days = Math.floor(seconds / (60 * 60 * 24));
      seconds = seconds % (60 * 60 * 24);
      const hours = Math.floor(seconds / (60 * 60));
      seconds = seconds % (60 * 60);
      const minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;

      let ans = "";
      if (days) ans += `${days}:`;
      if (hours) ans += `${hours < 10 ? "0" : ""}${hours}:`;
      ans += `${minutes < 10 ? "0" : ""}${minutes}:`;
      ans += `${seconds < 10 ? "0" : ""}${seconds}`;
      setTimer(ans);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const columns = useMemo(
    () => [
      {
        title: "#",
        dataIndex: "id",
        width: 64,
        render: (value) => <Text type="secondary">{value}</Text>,
      },
      {
        title: t("common.problem"),
        dataIndex: "id",
        render: (_, problem) => (
          <div>
            <Link
              to={`problems/${problem.id}`}
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              {getDataByLanguage(problem, "title", i18n.language)}
            </Link>
            {data.data.status === "finished" &&
              canShowTag &&
              problem?.tags?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {problem.tags.map((tag) => (
                    <Tag key={tag.id}>
                      {getDataByLanguage(tag, "title", i18n.language)}
                    </Tag>
                  ))}
                </div>
              )}
          </div>
        ),
      },
      data?.data?.status === "finished"
        ? {
            title: t("problem.difficulty"),
            dataIndex: "difficulty",
            render: (value) => <StatusTag status={value} />,
          }
        : {},
      {
        title: t("problem.accepted"),
        dataIndex: "accepted",
        render: (value) => (
          <div>
            <UserOutlined /> {value}
          </div>
        ),
      },
      {
        title: t("common.actions"),
        width: 120,
        render: (_, problem) => (
          <Button
            type="link"
            onClick={() => navigate(`problems/${problem.id}`)}
          >
            {t("contest.openProblem")}
          </Button>
        ),
      },
    ],
    [data],
  );

  if (isError) return <ErrorPage error={error} />;
  if (isLoading) return <Loading />;

  return (
    <div className="mx-auto w-full max-w-[1400px] pb-8">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/contests")}
        className="mb-3!"
      >
        {t("contest.backToContests")}
      </Button>
      <PageTitle
        title={data.data.title}
        subtitle={t(`contest.descriptions.${data.data.id}`, {
          defaultValue: t("contest.defaultDescription"),
        })}
        extra={<StatusTag status={data.data.status} />}
      />
      <Alert
        className="!mb-5 !rounded-xl"
        showIcon
        type={
          data.data.status === "running"
            ? "success"
            : data.data.status === "upcoming"
              ? "info"
              : "warning"
        }
        message={t(`contest.${data.data.status}`)}
        description={
          data.data.status === "running"
            ? t("contest.runningHint")
            : data.data.status === "finished"
              ? t("contest.resultsHint")
              : t("contest.detailUpcomingHint")
        }
      />
      <Row gutter={[12, 12]} className="mb-5">
        <Col xs={12} lg={6}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("contest.starts")}
              value={dayjs(data.data.startTime).format("DD/MM/YYYY HH:mm")}
              valueStyle={{ fontSize: 16 }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("contest.duration")}
              value={data.data.duration}
              valueStyle={{ fontSize: 16 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("contest.participants")}
              value={data.data.participants}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("contest.problems")}
              value={5}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>
      {["running", "finished"].includes(data.data.status) ? (
        <Card
          className="rounded-2xl! py-2!"
          title={
            <div>
              <div className="text-lg font-semibold">
                {t("contest.problemSet")}
              </div>
              <Text type="secondary" className="text-sm">
                {t("contest.problemSetHint")}
              </Text>
            </div>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data.data.problems}
            pagination={false}
            scroll={{ x: 680 }}
          />

          {/* <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <Button type="primary" onClick={() => navigate("/submissions")}>
              {t("contest.viewSubmissions")}
            </Button>
          </div> */}
        </Card>
      ) : (
        <Card className="rounded-2xl! py-2!">
          {timer ? (
            <p className="flex items-center justify-center font-semibold text-lg">
              {timer}
            </p>
          ) : (
            <div className="h-full flex items-center justify-center">
              ------------
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
