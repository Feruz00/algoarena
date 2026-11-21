import { Card, Segmented, Tag, Button } from "antd";
import { useTranslation } from "react-i18next";
import {
  useParams,
  useLocation,
  useNavigate,
  Outlet,
  Link,
} from "react-router";
import StatusTag from "../../components/ui/StatusTag";
import { useGetProblem } from "./useProblems";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import { getDataByLanguage } from "../../utils/functions";
import { viewItem } from "../../utils/user";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function ProblemDetailPage() {
  const { problemId, id } = useParams();

  const { isLoading, data, error, isError, isSuccess } =
    useGetProblem(problemId);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isContestRoute = location.pathname.startsWith("/contests/");
  const isSourceRoute = location.pathname.startsWith("/sources/");

  const activeTab = location.pathname.endsWith("/submissions")
    ? "submissions"
    : location.pathname.endsWith("/statistics")
      ? "statistics"
      : "statement";

  const canShowTag = viewItem("use:tags");

  const tabOptions = [
    {
      label: t("problem.statement"),
      value: "statement",
    },
    ...(isContestRoute
      ? [
          {
            label: t("problem.submissionsTab"),
            value: "submissions",
          },
          {
            label: t("problem.statistics"),
            value: "statistics",
          },
        ]
      : []),
  ];

  const handleTabChange = (key) => {
    const paths = {
      statement: "",
      submissions: "submissions",
      statistics: "statistics",
    };

    const basePath = location.pathname.replace(
      /\/(submissions|statistics)\/?$/,
      "",
    );

    const normalizedBase = basePath.replace(/\/$/, "");
    const targetPath = paths[key]
      ? `${normalizedBase}/${paths[key]}`
      : normalizedBase;

    navigate(targetPath);
  };

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;

  if (!isSuccess) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      {isContestRoute && (
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/contests/${id}`)}
          className="mb-3!"
        >
          {t("contest.backToContests")}
        </Button>
      )}

      {isSourceRoute && (
        <Link className="source-detail-back" to={`/sources/${id}`}>
          <ArrowLeftOutlined />
          <span>{t("common.back")}</span>
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {activeTab !== "statistics" && (
          <div className="flex flex-wrap items-center  gap-3">
            <h1 className="m-0 text-2xl font-bold sm:text-3xl">
              {getDataByLanguage(data.data, "title", i18n.language)}
            </h1>

            <StatusTag status={data.data.difficulty} />
          </div>
        )}

        {isContestRoute && (
          <Segmented
            options={tabOptions}
            value={activeTab}
            onChange={handleTabChange}
          />
        )}
      </div>

      {/* Problem tags: hidden on statistics */}
      {activeTab !== "statistics" &&
        canShowTag &&
        data.data.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.data.tags.map((tag) => (
              <Tag key={tag.id} color="blue">
                {getDataByLanguage(tag, "title", i18n.language)}
              </Tag>
            ))}
          </div>
        )}

      {/* Nested route content */}
      <Card className="rounded-xl!">
        <Outlet context={{ data }} />
      </Card>
    </div>
  );
}
