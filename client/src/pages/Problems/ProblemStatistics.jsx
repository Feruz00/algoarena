import { Card, Pagination, Table, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useContestStatistics } from "./useProblems";
import { useParams, useSearchParams } from "react-router";
import ErrorPage from "../../components/ErrorPage";
import { useEffect, useMemo, useState } from "react";
import { getDataByLanguage } from "../../utils/functions";
import classNames from "classnames";
import useAuthStore from "../../store/authStore";

const { Text } = Typography;

const ProblemStatistics = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const user = useAuthStore((st) => st.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const pageSize = Number(searchParams.get("limit")) || 10;
  const [page, setPage] = useState(searchParams.get("page") ?? null);

  const queryKey = useMemo(
    () => ({
      page: currentPage || undefined,
      limit: pageSize,
    }),
    [currentPage, pageSize],
  );

  const { isLoading, isFetching, isSuccess, data, error, isError } =
    useContestStatistics(id, queryKey);

  useEffect(() => {
    if (data?.page) setPage(data.page);
  }, [data]);

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

  const handlePaginationChange = (page, limit) => {
    addQuery({
      page: limit !== pageSize ? 1 : page,
      limit,
    });
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_, record, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: t("profile.username"),
      key: "username",
      dataIndex: "username",
      align: "",
    },
    ...(data?.problems ?? []).map((row, index) => ({
      title: getDataByLanguage(row, "title", i18n.language),
      key: `problem-${row.id ?? index}`,
      dataIndex: "problems",
      align: "center",
      render: (problems = []) => {
        const problem = problems[index];
        // console.log(problem);
        const score = problem?.score ?? 0;
        const count = problem?.count ?? 0;

        return (
          <div className="flex flex-col items-center gap-1">
            {score > 0 ? (
              <>
                <span
                  className={score > 0 ? "font-semibold text-green-600" : ""}
                >
                  {score}
                </span>

                <span className="text-xs text-gray-500">
                  +{count} {t("submissions.attempts")}
                </span>
              </>
            ) : (
              <span>--</span>
            )}
          </div>
        );
      },
    })),
    {
      title: t("common.total"),
      key: "username",
      // fixed: "left",
      dataIndex: "score",
      align: "center",
      render: (score) => (
        <span className={score > 0 ? "font-semibold text-green-600" : ""}>
          {score}
        </span>
      ),
    },
  ];

  if (isError) return <ErrorPage error={error} />;

  return (
    <div>
      <Table
        className=" rounded-none!"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={data?.data || []}
        pagination={false}
        scroll={{ x: 650 }}
        // rowKet="id"
        rowClassName={(record) =>
          record.id === user.data.id ? "bg-blue-100" : ""
        }
      />
      <div className="flex justify-end mt-2">
        <Pagination
          total={isSuccess ? data?.count || 0 : 0}
          showSizeChanger
          responsive
          pageSizeOptions={[10, 20, 50, 75]}
          onChange={handlePaginationChange}
          pageSize={pageSize}
          current={page}
          showTotal={(total) =>
            `${t("common.total")} ${total} ${t("common.count")}  `
          }
        />
      </div>
    </div>
  );
};

export default ProblemStatistics;
