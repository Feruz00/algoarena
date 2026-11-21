import {
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Tag,
  Typography,
  Progress,
  Tooltip,
} from "antd";

import {
  EnvironmentOutlined,
  GithubOutlined,
  GlobalOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  FireOutlined,
  CalendarOutlined,
  CodeOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";

import PageTitle from "../../components/ui/PageTitle";
import { useGetProfile } from "./useUsers";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";

const { Text, Paragraph } = Typography;

const activityColors = [
  "bg-slate-100",
  "bg-green-200",
  "bg-green-300",
  "bg-green-500",
  "bg-green-700",
];

export const formatDate = (value, language = "en") => {
  if (!value) return "-";

  // console.log(language);

  const locales = {
    en: "en-US",
    ru: "ru-RU",
    tm: "tk-TM",
  };

  return new Date(value).toLocaleDateString(locales[language] || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getWebsiteUrl = (website) => {
  if (!website) return "";

  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

const getVerdictColor = (verdict, status) => {
  if (status !== "finished") {
    return "processing";
  }

  const colors = {
    AC: "success",
    WA: "error",
    PE: "warning",
    CE: "warning",
    RE: "error",
    TLE: "error",
    MLE: "error",
  };

  return colors[verdict] || "default";
};

const getVerdictTranslation = (verdict, status, t) => {
  if (status !== "finished") {
    return t(`problem.${status}`, {
      defaultValue: status || "Unknown",
    });
  }

  const verdictKeys = {
    AC: "accepted",
    WA: "wrong",
    PE: "presentationError",
    CE: "compilationError",
    RE: "runtimeError",
    TLE: "timeLimitExceeded",
    MLE: "memoryLimitExceeded",
  };

  const key = verdictKeys[verdict];

  return key ? t(`verdict.${key}`, { defaultValue: verdict }) : verdict || "-";
};

function ActivityCalendar({ activity = [], t, i18n }) {
  const activityMap = new Map(
    activity.map((item) => [
      String(item.date).slice(0, 10),
      Number(item.count || 0),
    ]),
  );

  const getIntensity = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const total = activity.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0,
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-800">
            {total.toLocaleString()}
          </div>
          <Text type="secondary" className="text-xs">
            {t("profile.activityCount", {
              defaultValue: "Submissions in the last 84 days",
            })}
          </Text>
        </div>

        <Tag color="green">
          {t("profile.lastSixMonths", {
            defaultValue: "Last 84 days",
          })}
        </Tag>
      </div>

      {activity.length > 0 ? (
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
          {activity.map((item) => {
            const count = Number(item.count || 0);
            const intensity = getIntensity(count);

            return (
              <Tooltip
                key={item.date}
                title={`${formatDate(item.date, i18n.language)}: ${count} submissions`}
              >
                <div
                  className={`aspect-square w-full rounded-[3px] transition-opacity hover:opacity-70 ${activityColors[intensity]}`}
                />
              </Tooltip>
            );
          })}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("common.noData", {
            defaultValue: "No activity yet",
          })}
        />
      )}

      <div className="mt-5 flex items-center justify-end gap-2">
        <Text type="secondary" className="text-xs">
          {t("profile.less", { defaultValue: "Less" })}
        </Text>

        {activityColors.map((color, index) => (
          <div key={index} className={`h-3 w-3 rounded-[3px] ${color}`} />
        ))}

        <Text type="secondary" className="text-xs">
          {t("profile.more", { defaultValue: "More" })}
        </Text>
      </div>
    </div>
  );
}

function ProfileStat({ title, value, description, icon, color, suffix }) {
  return (
    <Card
      className="h-full !rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      styles={{ body: { padding: 20 } }}
    >
      <div className="mb-3 flex items-center justify-between">
        <Text type="secondary" className="text-sm">
          {title}
        </Text>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
        >
          {icon}
        </div>
      </div>

      <Statistic
        value={value || 0}
        suffix={suffix}
        valueStyle={{
          fontSize: 28,
          fontWeight: 700,
          color: "#1e293b",
        }}
      />

      {description && (
        <Text type="secondary" className="mt-2 block text-xs">
          {description}
        </Text>
      )}
    </Card>
  );
}

function RecentSubmission({ item, t, i18n }) {
  const verdict = getVerdictTranslation(item.verdict, item.status, t);

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CodeOutlined />
          </div>

          <div className="min-w-0">
            <Link
              to={`/problems/${item.problemId}`}
              className="block truncate font-semibold text-slate-800 transition-colors hover:text-blue-600"
            >
              {item.problem?.title || `Problem #${item.problemId}`}
            </Link>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CodeOutlined />
                {item.lang?.toUpperCase() || "Unknown"}
              </span>

              <span className="flex items-center gap-1">
                <CalendarOutlined />
                {formatDate(item.createdAt, i18n.language)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {typeof item.score === "number" && (
          <Tag>
            {t("profile.score", {
              defaultValue: "Score",
            })}
            : {item.score}
          </Tag>
        )}

        {item.timeMs != null && <Tag>{item.timeMs} ms</Tag>}

        <Tag color={getVerdictColor(item.verdict, item.status)}>{verdict}</Tag>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { handle } = useParams();

  const { data, isLoading, isError, error } = useGetProfile(handle);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (!data?.data?.user) {
    return <ErrorPage error={new Error("User not found")} />;
  }

  // console.log(data);
  const {
    user,
    stats = {},
    activity = [],
    recentSubmissions = [],
  } = data?.data;

  const fullName = user.fullName || user.username;

  const acceptanceRate =
    stats.totalSubmissions > 0
      ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
      : 0;

  return (
    <div className="space-y-5 pb-8">
      <PageTitle title={t("profile.title")} subtitle={t("profile.subtitle")} />

      {/* Profile header */}
      <Card
        className="!overflow-hidden !rounded-2xl"
        styles={{ body: { padding: 0 } }}
      >
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 sm:h-36">
          <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[30px] border-white/10" />
          <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full border-[35px] border-white/10" />
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <Typography.Title
                level={2}
                className="!mb-1 !break-words !text-xl sm:!text-2xl"
              >
                {fullName}
              </Typography.Title>

              <div className="flex flex-wrap items-center gap-2">
                <Text type="secondary">@{user.username}</Text>

                {/* <Tag color="blue">
                  {t("profile.member", {
                    defaultValue: "Member",
                  })}
                </Tag> */}
              </div>
            </div>

            {/* <div className="flex flex-wrap gap-2">
              <Link to="/rankings">
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600"
                >
                  <TrophyOutlined />
                  {t("profile.viewRankings", {
                    defaultValue: "View rankings",
                  })}
                </button>
              </Link>
            </div> */}
          </div>

          {user.bio && (
            <Paragraph className="!mb-5 !mt-5 !max-w-3xl !text-slate-600">
              {user.bio}
            </Paragraph>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-500">
            {user.organization && (
              <span className="flex items-center gap-2">
                <TrophyOutlined className="text-blue-500" />
                {user.organization}
              </span>
            )}

            {user.createdAt && (
              <span className="flex items-center gap-2">
                <CalendarOutlined className="text-blue-500" />
                {t("profile.joined", {
                  defaultValue: "Joined",
                })}{" "}
                {formatDate(user.createdAt, i18n.language)}
              </span>
            )}

            {user.website && (
              <a
                href={getWebsiteUrl(user.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <GlobalOutlined />
                {user.website}
              </a>
            )}

            {user.github && (
              <a
                href={`https://github.com/${user.github.replace(/^@/, "").replace(/^https?:\/\/github\.com\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
              >
                <GithubOutlined />
                {user.github}
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={12} lg={6}>
          <ProfileStat
            title={t("profile.solved", {
              defaultValue: "Solved problems",
            })}
            value={stats.solvedProblems}
            description={t("profile.solvedHint", {
              defaultValue: "Unique accepted problems",
            })}
            icon={<CheckCircleOutlined className="text-xl text-green-600" />}
            color="bg-green-50"
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <ProfileStat
            title={t("profile.submissions", {
              defaultValue: "Submissions",
            })}
            value={stats.totalSubmissions}
            description={t("profile.submissionsHint", {
              defaultValue: "Total submitted solutions",
            })}
            icon={<FileTextOutlined className="text-xl text-blue-600" />}
            color="bg-blue-50"
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <ProfileStat
            title={t("profile.contests", {
              defaultValue: "Contests",
            })}
            value={stats.contestsParticipated}
            description={t("profile.contestsHint", {
              defaultValue: "Contests participated in",
            })}
            icon={<TrophyOutlined className="text-xl text-violet-600" />}
            color="bg-violet-50"
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <ProfileStat
            title={t("profile.streak", {
              defaultValue: "Current streak",
            })}
            value={stats.streak}
            suffix={t("profile.days", {
              defaultValue: "days",
            })}
            description={t("profile.streakHint", {
              defaultValue: "Consecutive active days",
            })}
            icon={<FireOutlined className="text-xl text-orange-500" />}
            color="bg-orange-50"
          />
        </Col>
      </Row>

      {/* Submission performance */}
      <Card
        className="!rounded-2xl"
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>
              {t("profile.performance", {
                defaultValue: "Submission performance",
              })}
            </span>
          </div>
        }
      >
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={12}>
            <div className="mb-2 flex items-center justify-between">
              <Text type="secondary">
                {t("profile.acceptanceRate", {
                  defaultValue: "Acceptance rate",
                })}
              </Text>

              <span className="text-xl font-bold text-green-600">
                {acceptanceRate}%
              </span>
            </div>

            <Progress
              percent={acceptanceRate}
              showInfo={false}
              strokeColor="#16a34a"
              trailColor="#e2e8f0"
              strokeWidth={10}
            />

            <Text type="secondary" className="mt-2 block text-xs">
              {stats.acceptedSubmissions || 0}{" "}
              {t("profile.acceptedSubmissions", {
                defaultValue: "accepted submissions",
              })}
            </Text>
          </Col>

          <Col xs={24} md={12}>
            <Row gutter={12}>
              <Col span={12}>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 text-slate-400">
                    <CheckCircleOutlined />
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {stats.acceptedSubmissions || 0}
                  </div>
                  <Text type="secondary" className="text-xs">
                    {t("profile.accepted", {
                      defaultValue: "Accepted",
                    })}
                  </Text>
                </div>
              </Col>

              <Col span={12}>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 text-slate-400">
                    <CodeOutlined />
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {Math.max(
                      (stats.totalSubmissions || 0) -
                        (stats.acceptedSubmissions || 0),
                      0,
                    )}
                  </div>
                  <Text type="secondary" className="text-xs">
                    {t("profile.otherSubmissions", {
                      defaultValue: "Other submissions",
                    })}
                  </Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Activity calendar */}
      <Card
        className="!rounded-2xl"
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-600" />
            <span>
              {t("profile.activityTitle", {
                defaultValue: "Activity",
              })}
            </span>
          </div>
        }
      >
        <ActivityCalendar activity={activity} t={t} i18n={i18n} />
      </Card>

      {/* Recent submissions */}
      <Card
        className="!rounded-2xl"
        title={
          <div className="flex items-center gap-2">
            <CodeOutlined className="text-blue-600" />
            <span>
              {t("profile.recentSubmissions", {
                defaultValue: "Recent submissions",
              })}
            </span>
          </div>
        }
        extra={
          <Link
            to="/submissions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {t("common.viewAll", {
              defaultValue: "View all",
            })}
          </Link>
        }
      >
        {recentSubmissions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentSubmissions.map((item) => (
              <RecentSubmission key={item.id} item={item} t={t} i18n={i18n} />
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("profile.noSubmissions", {
              defaultValue: "No submissions yet",
            })}
          />
        )}
      </Card>
    </div>
  );
}
