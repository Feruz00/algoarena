import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import PageTitle from "../../components/ui/PageTitle";
import StatusTag from "../../components/ui/StatusTag";
import { contests } from "../../data/mockData";
import { useGetContests, useRegisterUser } from "./useContest";
import ErrorPage from "../../components/ErrorPage";
import Loading from "../../components/Loading";
import dayjs from "dayjs";
import { useGetRegistrationCount } from "../My/useMy";
import { viewItem } from "../../utils/user";

const { Text, Paragraph } = Typography;

const contestMeta = {
  scheduled: {
    color: "#2563eb",
    icon: "⚡",
    difficulty: "Mixed",
    problems: 8,
    prize: "Rating",
  },
  deactive: {
    color: "#0d9488",
    icon: "🌱",
    difficulty: "Beginner",
    problems: 6,
    prize: "Practice",
  },
  finished: {
    color: "#7c3aed",
    icon: "🏆",
    difficulty: "Advanced",
    problems: 10,
    prize: "Rating",
  },
  running: {
    color: "#64748b",
    icon: "🎯",
    difficulty: "Mixed",
    problems: 7,
    prize: "Archived",
  },
};

export default function ContestsPage() {
  const { t, i18n } = useTranslation();
  const canShowRegistrationCount = viewItem("use:home");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [registered, setRegistered] = useState([1]);

  const [tab, setTab] = useState(searchParams.get("status") || "all");
  const [title, setTitle] = useState(searchParams.get("title") || null);
  const [search, setSearch] = useState(title);

  const [selected, setSelected] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 10;

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      title: title || undefined,
      status: tab ? (tab !== "all" ? tab : undefined) : undefined,
    }),
    [tab, currentPage, pageSize, title],
  );
  const { isLoading, isFetching, error, isError, data, isSuccess } =
    useGetContests(queryKey);
  const { mutate, isPending } = useRegisterUser();
  const { data: registrationCount } = useGetRegistrationCount(
    canShowRegistrationCount,
  );

  const handleRegister = (contestId) => {
    mutate(contestId);
  };

  const tabItems = [
    {
      key: "all",
      label: <span>{t("common.all")} </span>,
    },
    {
      key: "running",
      label: <span>{t("contest.running")} </span>,
    },
    {
      key: "scheduled",
      label: <span>{t("contest.scheduled")} </span>,
    },
    {
      key: "finished",
      label: <span>{t("contest.finished")} </span>,
    },
  ];

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
  // console.log(registrationCount?.data);
  const isRegister = useCallback(
    (contestId) => {
      if (registrationCount?.data) {
        return registrationCount.data.includes(contestId);
      }
      return false;
    },
    [registrationCount],
  );

  const handlePaginationChange = (page, limit) => {
    addQuery({
      page: limit !== pageSize ? 1 : page,
      limit,
    });
  };

  useEffect(() => {
    document.title = "Bäsleşikler | AlgoArena";
  }, []);

  if (isError) return <ErrorPage error={error} />;

  return (
    <div className="mx-auto w-full max-w-350 pb-8">
      {contextHolder}
      {/* <PageTitle title={t("contest.title")} subtitle={t("contest.subtitle")} /> */}

      {/* <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl!" styles={{ body: { padding: 18 } }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
              <TrophyOutlined />
            </div>
            <Statistic
              title={t("contest.totalContests")}
              value={data?.count}
              valueStyle={{ fontSize: 24, fontWeight: 700 }}
            />
          </div>
        </Card>
        {canShowRegistrationCount && (
          <Card className="rounded-2xl!" styles={{ body: { padding: 18 } }}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600">
                <CheckCircleOutlined />
              </div>
              <Statistic
                title={t("contest.myRegistrations")}
                value={registrationCount?.count}
                valueStyle={{ fontSize: 24, fontWeight: 700 }}
              />
            </div>
          </Card>
        )}
      </div> */}

      <Card className="rounded-2xl!" styles={{ body: { padding: 0 } }}>
        <div
          className="flex flex-col gap-3 border-b border-slate-100
         px-4 pt-2 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <Tabs
            activeKey={tab}
            onChange={(e) => {
              // console.log(e);
              let query = {
                page: 1,
                status: e,
              };
              addQuery(query);

              setTab(e);
            }}
            items={tabItems}
            className="contest-tabs min-w-0 flex-1"
          />
          <Input
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPressEnter={(e) => {
              let query = {
                page: 1,
                title: search ? search : undefined,
              };

              setTitle(search);
              addQuery(query);
            }}
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder={t("contest.searchPlaceholder")}
            className="mb-3! w-full! sm:mb-0! sm:w-64!"
          />
        </div>
        {isFetching && <Loading />}
        {data?.data?.length ? (
          <Row gutter={[16, 16]} className="!m-0 !p-4 sm:!p-6">
            {data.data.map((contest) => {
              const meta = contestMeta[contest.status];

              return (
                <Col xs={24} xl={12} key={contest.id}>
                  <Card
                    hoverable
                    className="h-full overflow-hidden! rounded-2xl! border-slate-200! transition-shadow hover:shadow-md!"
                    styles={{ body: { padding: 0 } }}
                  >
                    <div className="h-1.5" style={{ background: meta.color }} />
                    <div className="p-4 sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                          style={{ background: `${meta.color}14` }}
                        >
                          {meta.icon}
                        </div>

                        <div className="flex min-w-0 items-start gap-3">
                          <div className="min-w-0">
                            <Text
                              strong
                              className="!block !text-base sm:!text-lg"
                            >
                              {contest.title}
                            </Text>
                          </div>
                        </div>
                        <StatusTag status={contest.status} />
                      </div>

                      <Paragraph
                        type="secondary"
                        className="!mb-4 !min-h-10 !text-sm"
                      >
                        {t(`contest.descriptions.${contest.id}`, {
                          defaultValue: t("contest.defaultDescription"),
                        })}
                      </Paragraph>

                      <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-3 sm:grid-cols-4">
                        <div>
                          <Text type="secondary" className="!block text-xs">
                            <CalendarOutlined className="mr-1" />
                            {t("contest.starts")}
                          </Text>
                          <Text strong className="text-sm">
                            {contest.startTime
                              ? dayjs(contest.startTime).format(
                                  "DD/MM/YYYY HH:mm",
                                )
                              : "------"}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" className="!block text-xs">
                            <ClockCircleOutlined className="mr-1" />
                            {t("contest.duration")}
                          </Text>
                          <Text strong className="text-sm">
                            {contest.duration}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" className="!block text-xs">
                            <TeamOutlined className="mr-1" />
                            {t("contest.participants")}
                          </Text>
                          <Text strong className="text-sm">
                            {contest.participants}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" className="!block text-xs">
                            <TrophyOutlined className="mr-1" />
                            {t("contest.problems")}
                          </Text>
                          <Text strong className="text-sm">
                            {contest.problems}
                          </Text>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Space size={6} wrap>
                          {isRegister(contest.id) && (
                            <Tag bordered={false} color="success">
                              <CheckCircleOutlined className="mr-1" />
                              {t("contest.registered")}
                            </Tag>
                          )}
                        </Space>
                        <Space wrap>
                          <Button
                            onClick={() => navigate(`/contests/${contest.id}`)}
                          >
                            {t("contest.details")}
                          </Button>
                          {contest.status === "running" ? (
                            <Button
                              type="primary"
                              icon={<ArrowRightOutlined />}
                              onClick={() => setSelected(contest)}
                            >
                              {t("contest.enter")}
                            </Button>
                          ) : contest.status === "scheduled" ? (
                            <Button
                              type={
                                isRegister(contest.id) ? "default" : "primary"
                              }
                              disabled={isRegister(contest.id)}
                              onClick={() => handleRegister(contest.id)}
                            >
                              {isRegister(contest.id)
                                ? t("contest.registered")
                                : t("contest.register")}
                            </Button>
                          ) : (
                            <Button onClick={() => setSelected(contest)}>
                              {t("contest.viewResults")}
                            </Button>
                          )}
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="px-4 py-16">
            <Empty description={t("common.noData")} />
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected?.title}
        onCancel={() => setSelected(null)}
        footer={[
          <Button key="close" onClick={() => setSelected(null)}>
            {t("common.close")}
          </Button>,
          <Button
            key="view"
            onClick={() => {
              const id = selected?.id;
              setSelected(null);
              if (id) navigate(`/contests/${id}`);
            }}
          >
            {t("contest.viewProblemSet")}
          </Button>,
          selected?.status === "upcoming" &&
          !registered.includes(selected?.id) ? (
            <Button
              key="register"
              type="primary"
              onClick={() => {
                handleRegister(selected);
                setSelected(null);
              }}
            >
              {t("contest.register")}
            </Button>
          ) : null,
        ]}
        width={560}
      >
        {selected && (
          <div className="space-y-4">
            <Alert
              showIcon
              type={
                selected.status === "running"
                  ? "success"
                  : selected.status === "upcoming"
                    ? "info"
                    : "warning"
              }
              message={t(`contest.${selected.status}`)}
              description={t(`contest.descriptions.${selected.id}`, {
                defaultValue: t("contest.defaultDescription"),
              })}
            />
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={t("contest.starts")}
                    value={selected.starts}
                    valueStyle={{ fontSize: 15 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={t("contest.duration")}
                    value={selected.duration}
                    valueStyle={{ fontSize: 15 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={t("contest.participants")}
                    value={selected.participants}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={t("contest.problems")}
                    value={contestMeta[selected.id]?.problems || 6}
                  />
                </Card>
              </Col>
            </Row>
            {selected.status === "finished" && (
              <Text type="secondary">{t("contest.resultsHint")}</Text>
            )}
            {selected.status === "running" && (
              <Text type="secondary">{t("contest.runningHint")}</Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
