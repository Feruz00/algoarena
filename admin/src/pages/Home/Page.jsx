// src/pages/Dashboard.jsx  (or admin/Dashboard.jsx)

import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  Button,
  Progress,
  Empty,
  Spin,
} from "antd";
import {
  UserOutlined,
  CodeOutlined,
  TrophyOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Column, Pie } from "@ant-design/charts";
import dayjs from "dayjs";

import {
  useDashboardStats,
  useRecentContests,
  useRecentSubmissions,
} from "./useDashboard"; // adjust path

const { Title, Text } = Typography;

const statusColor = {
  scheduled: "blue",
  running: "green",
  finished: "red",
  deactive: "default",
};

const verdictColor = {
  AC: "success",
  WA: "error",
  TLE: "warning",
  MLE: "warning",
  RE: "error",
  CE: "default",
  PE: "default",
};

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentContests, isLoading: contestsLoading } =
    useRecentContests();
  const { data: recentSubmissions, isLoading: subsLoading } =
    useRecentSubmissions();

  useEffect(() => {
    document.title = "Baş sahypa | Admin Judge";
  }, []);

  const acRate = stats?.submissions?.acceptanceRate ?? 0;

  // ===== Charts config =====
  const submissionsChartConfig = useMemo(() => {
    const rawData = stats?.charts?.submissionsLast7Days || [];

    // Make sure date is always a string
    const data = rawData.map((item) => ({
      date: dayjs(item.date).format("YYYY-MM-DD"),
      count: Number(item.count) || 0,
      accepted: Number(item.accepted) || 0,
    }));

    return {
      data,
      xField: "date",
      yField: "count",
      height: 280,
      autoFit: true,
      columnStyle: {
        radius: [6, 6, 0, 0],
      },
      label: {
        position: "top",
        style: {
          fill: "#555",
          fontSize: 11,
        },
      },
      xAxis: {
        label: {
          formatter: (v) => dayjs(v).format("DD.MM"),
        },
      },
      yAxis: {
        nice: true,
      },
      meta: {
        count: { alias: "Tabşyryk" },
        date: { alias: "Sene" },
      },
      tooltip: {
        title: (title) => dayjs(title).format("DD MMMM YYYY"),
        formatter: (datum) => {
          return {
            name: "Tabşyryk sany",
            value: datum.count,
          };
        },
      },
      color: "#1677ff",
      // Important: do NOT put seriesField here
    };
  }, [stats]);

  const verdictChartConfig = useMemo(() => {
    const data = (stats?.charts?.verdictDistribution || []).map((item) => ({
      type: item.type || "Unknown",
      value: Number(item.value) || 0,
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return {
      data,
      angleField: "value",
      colorField: "type",
      radius: 0.85,
      innerRadius: 0.55, // makes it a donut
      height: 340,
      autoFit: true,
      padding: [10, 10, 40, 10],

      label: {
        type: "outer",
        content: "{name}\n{percentage}",
        style: {
          fontSize: 12,
        },
      },

      legend: {
        position: "bottom",
      },

      // ===== Center text (this is what you want) =====
      statistic: {
        title: {
          style: {
            fontSize: "13px",
            color: "#666",
            lineHeight: "18px",
          },
          content: "Jemi",
        },
        content: {
          style: {
            fontSize: "20px", // ← smaller number
            fontWeight: 600,
            color: "#111",
            lineHeight: "24px",
          },
          content: total.toLocaleString(), // 1,234 format
        },
      },

      interactions: [{ type: "element-active" }],
      color: [
        "#52c41a",
        "#ff4d4f",
        "#faad14",
        "#722ed1",
        "#13c2c2",
        "#eb2f96",
        "#fa8c16",
      ],
    };
  }, [stats]);

  // ===== Table columns =====
  const contestColumns = [
    {
      title: "Bäsleşik",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <button
          onClick={() => navigate(`/contests/${record.id}`)}
          className="text-left font-medium text-blue-600 hover:underline"
        >
          {text}
        </button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={statusColor[status] || "default"}>
          {status === "scheduled"
            ? "Başlamady"
            : status === "running"
              ? "Dowam edýär"
              : status === "finished"
                ? "Tamamlandy"
                : status}
        </Tag>
      ),
    },
    {
      title: "Başlanýan",
      dataIndex: "startTime",
      key: "startTime",
      width: 150,
      render: (val) => (val ? dayjs(val).format("DD.MM.YYYY HH:mm") : "—"),
    },
  ];

  const submissionColumns = [
    {
      title: "Ulanyjy",
      dataIndex: ["user", "username"],
      key: "user",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Mesele",
      dataIndex: ["problem", "titleTm"],
      key: "problem",
      ellipsis: true,
    },
    {
      title: "Netije",
      dataIndex: "verdict",
      key: "verdict",
      width: 90,
      render: (v) => <Tag color={verdictColor[v] || "default"}>{v || "—"}</Tag>,
    },
    {
      title: "Wagt",
      dataIndex: "createdAt",
      key: "time",
      width: 130,
      render: (val) => dayjs(val).format("DD.MM HH:mm"),
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spin size="large" tip="Ýüklenýär..." />
      </div>
    );
  }

  return (
    <div className="h-full p-1 overflow-y-auto flex flex-col gap-2  overflow-hidden  pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ">
        <div>
          <Title level={3} className="mb-1!">
            Baş sahypa
          </Title>
        </div>
      </div>

      {/* ===== Top Stats ===== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500">Jemi ulanyjylar</span>}
              value={stats?.users?.total ?? 0}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1677ff", fontWeight: 600 }}
            />
            <div className="mt-2 text-xs text-gray-400">
              +{stats?.users?.today ?? 0} şu gün
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500">Meseleler</span>}
              value={stats?.problems?.total ?? 0}
              prefix={<CodeOutlined className="text-purple-500" />}
              valueStyle={{ color: "#722ed1", fontWeight: 600 }}
            />
            <div className="mt-2 text-xs text-gray-400">
              {stats?.problems?.active ?? 0} active
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500">Bäsleşikler</span>}
              value={stats?.contests?.total ?? 0}
              prefix={<TrophyOutlined className="text-amber-500" />}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
            <div className="mt-2">
              <Tag color="green" className="m-0">
                {stats?.contestsByStatus?.running ?? 0} dowam edýär
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500">Tabşyryklar</span>}
              value={stats?.submissions?.total ?? 0}
              prefix={<FileTextOutlined className="text-emerald-500" />}
              valueStyle={{ color: "#10b981", fontWeight: 600 }}
            />
            <div className="mt-2 text-xs text-gray-400">
              {stats?.submissions?.today ?? 0} şu gün
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== Contest Status + Acceptance Rate ===== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-amber-500" />
                <span>Bäsleşikleriň statusy</span>
              </div>
            }
            className="rounded-2xl border-0 shadow-sm"
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/contests")}
              >
                Ählisini gör <ArrowRightOutlined />
              </Button>
            }
          >
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.contestsByStatus?.scheduled ?? 0}
                  </div>
                  <div className="mt-1 text-sm text-blue-500">Başlamady</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.contestsByStatus?.running ?? 0}
                  </div>
                  <div className="mt-1 text-sm text-green-500">Dowam edýär</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.contestsByStatus?.finished ?? 0}
                  </div>
                  <div className="mt-1 text-sm text-red-500">Tamamlandy</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-500" />
                <span>Ugratmalaryň seljermesi</span>
              </div>
            }
            className="h-full rounded-2xl border-0 shadow-sm"
          >
            <div className="flex flex-col items-center justify-center py-1">
              <Progress
                type="dashboard"
                percent={acRate}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                size={130}
              />
              <div className="mt-2 text-center">
                <div className="text-lg font-semibold">{acRate}%</div>
                <Text type="secondary" className="text-sm">
                  {stats?.submissions?.accepted ?? 0} /{" "}
                  {stats?.submissions?.total ?? 0} tabşyryk
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== Charts ===== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <RiseOutlined className="text-blue-500" />
                <span>Soňky 7 günüň tabşyryklary</span>
              </div>
            }
            className="rounded-2xl border-0 shadow-sm"
          >
            {stats?.charts?.submissionsLast7Days?.length ? (
              <Column {...submissionsChartConfig} />
            ) : (
              <Empty description="Maglumat ýok" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-500" />
                <span>Netijeleriň paýlanyşy</span>
              </div>
            }
            className="rounded-2xl border-0 shadow-sm"
          >
            {stats?.charts?.verdictDistribution?.length ? (
              <Pie {...verdictChartConfig} />
            ) : (
              <Empty description="Maglumat ýok" />
            )}
          </Card>
        </Col>
      </Row>

      {/* ===== Tables ===== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <PlayCircleOutlined className="text-blue-500" />
                <span>Soňky bäsleşikler</span>
              </div>
            }
            className="rounded-2xl border-0 shadow-sm"
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/contests")}
              >
                Ählisini gör
              </Button>
            }
          >
            <Table
              dataSource={recentContests?.data || []}
              columns={contestColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={contestsLoading}
              locale={{ emptyText: <Empty description="Bäsleşik ýok" /> }}
              scroll={{ x: true }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-emerald-500" />
                <span>Soňky tabşyryklar</span>
              </div>
            }
            className="rounded-2xl border-0 shadow-sm"
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/submissions")}
              >
                Ählisini gör
              </Button>
            }
          >
            <Table
              dataSource={recentSubmissions?.data || []}
              columns={submissionColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={subsLoading}
              locale={{ emptyText: <Empty description="Tabşyryk ýok" /> }}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
