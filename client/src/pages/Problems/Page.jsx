import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Input,
  Select,
  Table,
  Space,
  Typography,
  Pagination,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import StatusTag from "../../components/ui/StatusTag";
import { problems } from "../../data/mockData";
import { useGetProblems } from "./useProblems";
import ErrorPage from "../../components/ErrorPage";
import { getDataByLanguage } from "../../utils/functions";
import { viewItem } from "../../utils/user";
const { Text } = Typography;

export default function ProblemsPage() {
  const { t, i18n } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const canShowTag = viewItem("use:tags");
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 10;

  const [sortField, setSortField] = useState(searchParams.get("sort") || null);
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || null);
  const [title, setTitle] = useState(searchParams.get("title") || null);
  const [search, setSearch] = useState(title);
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") ? searchParams.get("difficulty") : "all",
  );

  const queryKey = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      sort: sortField || undefined,
      order: sortOrder ? (sortOrder === "ascend" ? "asc" : "desc") : undefined,
      title: title || undefined,
      difficulty: difficulty
        ? difficulty !== "all"
          ? difficulty
          : undefined
        : undefined,
    }),
    [difficulty, sortField, sortOrder, currentPage, pageSize, title],
  );
  const { isFetching, isLoading, data, error, isError, isSuccess } =
    useGetProblems(queryKey);

  const handleChange = (_, filters, sorter) => {
    let query = {};
    let hasChanges = false;
    if (sorter?.field && sorter?.order) {
      if (sortField !== sorter.field || sortOrder !== sorter.order) {
        setSortField(sorter.field);
        setSortOrder(sorter.order);
        query.sort = sorter.field;
        query.order = sorter.order === "ascend" ? "asc" : "desc";
        hasChanges = true;
      }
    } else {
      if (sortField || sortOrder) {
        setSortField("");
        setSortOrder("");
        query.sort = undefined;
        query.order = undefined;
        hasChanges = true;
      }
    }

    // if (filters.difficulty?.length) {
    //   query.difficulty = filters.difficulty[0];
    //   setDifficulty(filters.difficulty[0]);
    //   hasChanges = true;
    // } else if (difficulty) {
    //   setDifficulty(null);
    //   query.difficulty = undefined;
    //   hasChanges = true;
    // }
    if (hasChanges) {
      query.page = 1;
      addQuery(query);
    }
  };

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
      dataIndex: "id",
      width: 70,
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: t("common.problem"),
      dataIndex: "title",
      render: (_, p) => (
        <div>
          <Link
            to={`/problems/${p.id}`}
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            {getDataByLanguage(p, "title", i18n.language)}
          </Link>
          {canShowTag && (
            <div className="mt-1 flex flex-wrap gap-1">
              {p?.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                >
                  {getDataByLanguage(tag, "title", i18n.language)}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t("problem.difficulty"),
      dataIndex: "difficulty",
      render: (v) => <StatusTag status={v} />,
    },
    {
      title: t("problem.accepted"),
      dataIndex: "accepted",
      render: (v) => (
        <div>
          <UserOutlined /> {v}
        </div>
      ),
      // sorter: true,
      // sortOrder: sortField === "accepted" ? sortOrder : null,
    },
  ];

  useEffect(() => {
    document.title = "Meseleler | AlgoArena";
  }, []);

  if (isError) return <ErrorPage error={error} />;

  return (
    <div>
      <Card className="rounded-xl!">
        <Space wrap className="mb-4 flex!">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={(e) => {
              let query = {
                page: 1,
                title: search ? search : undefined,
              };

              setTitle(search);
              addQuery(query);
            }}
            className="w-full! sm:w-72!"
          />
          <Select
            value={difficulty}
            onChange={(e) => {
              let query = {
                page: 1,
                difficulty: e,
              };

              setDifficulty(e);
              addQuery(query);
            }}
            className="w-full sm:w-44!"
            options={[
              { value: "all", label: t("common.all") },
              { value: "beginner", label: t("problem.beginner") },
              { value: "easy", label: t("problem.easy") },
              { value: "medium", label: t("problem.medium") },
              { value: "hard", label: t("problem.hard") },
              { value: "expert", label: t("problem.expert") },
            ]}
          />
        </Space>
        <Table
          className="rounded-none!"
          rowKey="id"
          loading={isFetching || isLoading}
          columns={columns}
          dataSource={data?.data || []}
          pagination={false}
          scroll={{ x: 650 }}
          onChange={handleChange}
        />
        <div className="flex justify-end mt-2">
          <Pagination
            total={isSuccess ? data?.count || 0 : 0}
            showSizeChanger
            responsive
            pageSizeOptions={[10, 20, 50, 75]}
            onChange={handlePaginationChange}
            pageSize={pageSize}
            current={currentPage}
            showTotal={(total) =>
              `${t("common.total")} ${total} ${t("common.count")}  `
            }
          />
        </div>
      </Card>
    </div>
  );
}
