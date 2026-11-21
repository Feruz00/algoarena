import { Card, Col, Row, Table, Button, Typography } from "antd";
import {
  CodeOutlined,
  TrophyOutlined,
  SendOutlined,
  RiseOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import StatusTag from "../../components/ui/StatusTag";
import { contests, submissions } from "../../data/mockData";
import { useGetHome } from "../My/useMy";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import { useMemo } from "react";
import useAuthStore from "../../store/authStore";
import { getDataByLanguage } from "../../utils/functions";
import dayjs from "dayjs";

const { Text } = Typography;
export default function HomePage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((st) => st.user);
  const { isLoading, error, data, isError } = useGetHome();
  const stats = useMemo(
    () => [
      {
        label: t("home.totalSolved"),
        value: data?.data?.solved,
        icon: <CodeOutlined />,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: t("home.contests"),
        value: data?.data?.contests,
        icon: <TrophyOutlined />,
        color: "bg-violet-50 text-violet-600",
      },
      {
        label: t("home.submissions"),
        value: data?.data?.submissions,
        icon: <SendOutlined />,
        color: "bg-emerald-50 text-emerald-600",
      },
      // {
      //   label: t("home.rating"),
      //   value: "1,842",
      //   icon: <RiseOutlined />,
      //   color: "bg-amber-50 text-amber-600",
      // },
    ],
    [data],
  );
  const columns = [
    { title: "#", dataIndex: "id", width: 90 },
    {
      title: t("common.problem"),
      dataIndex: "problem",
      render: (v, row) => (
        <Link
          className="font-medium text-blue-600"
          to={`/problems/${row.problemId}`}
        >
          {getDataByLanguage(v, "title", i18n.language)}
        </Link>
      ),
    },
    { title: t("common.language"), dataIndex: "language" },
    {
      title: t("common.verdict"),
      dataIndex: "verdict",
      render: (v) => <StatusTag status={v} />,
    },
    {
      title: t("common.date"),
      dataIndex: "createdAt",
      render: (p) => dayjs(p).format("DD/MM/YYYY HH:mm"),
    },
  ];
  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;
  return (
    <div>
      <PageTitle
        title={`${t("common.welcome")}, ${user.data.fullName}`}
        subtitle={t("common.overview")}
      />
      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((s) => (
          <Col xs={12} xl={6} key={s.label}>
            <Card className="h-full !rounded-xl">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Text type="secondary">{s.label}</Text>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {s.value}
                  </div>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${s.color}`}
                >
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title={t("home.recent")}
            extra={<Link to="/submissions">{t("common.viewAll")}</Link>}
            className="!rounded-xl"
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={data.data.data}
              pagination={false}
              scroll={{ x: 650 }}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title={t("home.upcoming")} className="!mt-4 !rounded-xl">
            {data.data.upcoming.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="border-b border-slate-100 py-3 last:border-0"
              >
                <div className="font-medium">{c.title}</div>
                <Text type="secondary" className="!text-xs">
                  {c.status === "running"
                    ? t("contest.liveNow")
                    : dayjs(c.startTime).format("DD/MM/YYYY HH:mm")}{" "}
                  · {c.duration}
                </Text>
              </div>
            ))}
            <Link to="/contests" className="mt-3 block text-sm text-blue-600">
              {t("common.viewAll")} <ArrowRightOutlined />
            </Link>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
