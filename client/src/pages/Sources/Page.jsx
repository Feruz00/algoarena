import { useMemo, useState } from "react";
import {
  Card,
  Empty,
  Input,
  Tag,
  Typography,
  Collapse,
  Space,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import { sources, problems } from "../../data/mockData";
import { useGetSources } from "./useSources";
import { getDataByLanguage } from "../../utils/functions";

const { Text, Paragraph } = Typography;

function buildTree(items, parentId = null) {
  return items
    .filter((item) => (item.parentId ?? null) === parentId)
    .map((item) => ({
      ...item,

      children: buildTree(items, item.id),
    }));
}

function SourceNode({ source, depth = 0, query, t }) {
  const { i18n } = useTranslation();
  const children = source.children || [];
  const linkedProblems = source.problems?.map((row) => ({
    ...row,
    id: row.id,
    title: getDataByLanguage(row, "title", i18n.language),
  }));
  const matchingChildren = children.filter(
    (child) =>
      child.title.toLowerCase().includes(query) ||
      child.description.toLowerCase().includes(query) ||
      (child.children || []).length,
  );
  const ownMatches =
    !query ||
    source.title.toLowerCase().includes(query) ||
    source.description.toLowerCase().includes(query) ||
    linkedProblems.some((problem) =>
      problem.title.toLowerCase().includes(query),
    );
  if (query && !ownMatches && !matchingChildren.length) return null;
  return (
    <div
      className={
        depth ? "ml-3 border-l border-slate-200 pl-3 sm:ml-5 sm:pl-5" : ""
      }
    >
      <Card
        size="small"
        className="mb-3 !rounded-xl !border-slate-200"
        styles={{ body: { padding: 16 } }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
            <FolderOpenOutlined />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/sources/${source.id}`}
                className="m-0 text-base font-semibold text-slate-800"
              >
                {source.title}
              </Link>
              {/* <Tag>{t("source.level", { level: depth + 1 })}</Tag> */}
              {/* <Tag color="blue">
                {linkedProblems.length} {t("source.problemsCount")}
              </Tag> */}
            </div>
            <Paragraph className="!mb-3 !mt-1 !text-sm !text-slate-500">
              {source.description}
            </Paragraph>
            {linkedProblems?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedProblems.map((problem) => (
                  <Link
                    key={problem.id}
                    to={`${source.id}/problems/${problem.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm hover:border-blue-300 hover:bg-blue-50"
                  >
                    <FileTextOutlined />{" "}
                    <span className="font-medium">{problem.title}</span>
                    <Tag color={problem.difficulty}>
                      {t(`problem.${problem.difficulty}`)}
                    </Tag>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
      {children.length > 0 && (
        <div>
          {children.map((child) => (
            <SourceNode
              key={child.id}
              source={child}
              depth={depth + 1}
              query={query}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SourcesPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = useState(searchParams.get("title") || "");

  const [search, setSearch] = useState(title);

  const { isFetching, isError, error, data, isSuccess } = useGetSources();
  const changed = useMemo(() => {
    if (isSuccess) {
      const ans = data.data.map((row) => ({
        ...row,
        title: getDataByLanguage(row, "title", i18n.language),
        description: getDataByLanguage(row, "subTitle", i18n.language),
      }));
      return ans;
    }
    return [];
  }, [i18n, data]);
  const tree = useMemo(() => {
    return buildTree(changed);
  }, [changed]);

  const query = search.trim().toLowerCase();

  const totalLinks = useMemo(() => {
    if (isSuccess) {
      return data.data.reduce(
        (sum, source) => sum + (source.problems || []).length,
        0,
      );
    }
    return 0;
  }, [data]);
  const roots = tree.filter(
    (source) =>
      !query ||
      source.title.toLowerCase().includes(query) ||
      source.description.toLowerCase().includes(query) ||
      source.children.length,
  );
  return (
    <div className="mx-auto w-full max-w-[1400px] pb-8">
      {/* <PageTitle title={t("source.title")} subtitle={t("source.subtitle")} /> */}
      <Row gutter={[12, 12]} className="mb-5">
        <Col xs={24} sm={8}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("source.totalSources")}
              value={sources.length}
              prefix={<BookOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("source.rootTopics")}
              value={tree.length}
              prefix={<FolderOpenOutlined className="text-violet-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="!rounded-xl">
            <Statistic
              title={t("source.problemLinks")}
              value={totalLinks}
              prefix={<FileTextOutlined className="text-emerald-500" />}
            />
          </Card>
        </Col>
      </Row>
      <Card className="!rounded-2xl" styles={{ body: { padding: 16 } }}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="m-0 text-lg font-semibold">
              {t("source.learningTree")}
            </h2>
            <Text type="secondary" className="text-sm">
              {t("source.treeHint")}
            </Text>
          </div>
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder={t("source.searchPlaceholder")}
            className="!w-full sm:!w-80"
          />
        </div>
        {roots.length ? (
          roots.map((source) => (
            <SourceNode
              key={source.id}
              source={source}
              query={query}
              t={t}
              lang={i18n.language}
            />
          ))
        ) : (
          <Empty description={t("common.noData")} />
        )}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          {t("source.recursiveNote")}
        </div>
      </Card>
    </div>
  );
}
