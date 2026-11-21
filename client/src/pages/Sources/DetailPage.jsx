import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Alert,
  Breadcrumb,
  Card,
  Empty,
  List,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  FileTextOutlined,
  RightOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useGetSource } from "./useSources";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import { getDataByLanguage } from "../../utils/functions";
import { HtmlParser } from "../../ui/HtmlParser";
// import "./SourceDetailPage.css";

const { Title, Paragraph, Text } = Typography;

export default function SourceDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { isLoading, data, error, isError, isSuccess } = useGetSource(id);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <main className="source-detail-page">
      <div className="source-detail-container">
        <Breadcrumb
          className="source-detail-breadcrumb"
          items={[
            { title: <Link to="/sources">{t("nav.sources")}</Link> },
            { title: getDataByLanguage(data.data, "title", i18n.language) },
          ]}
        />

        <Link className="source-detail-back" to="/sources">
          <ArrowLeftOutlined />
          <span>{t("common.back")}</span>
        </Link>

        <Card className="source-detail-hero" bordered={false}>
          <div className="source-detail-hero-icon">
            <BookOutlined />
          </div>
          <div className="source-detail-hero-content">
            <Text className="source-detail-eyebrow">{t("source.sources")}</Text>
            <Title level={1} className="source-detail-title">
              {getDataByLanguage(data.data, "title", i18n.language)}
            </Title>
            <div className="source-detail-meta">
              <Tag icon={<FileTextOutlined />}>
                {data?.data?.problems.length}
              </Tag>
            </div>
          </div>
        </Card>

        <div className="source-detail-grid">
          <section className="source-detail-main">
            <Card
              className="source-detail-card"
              title={
                <span className="source-detail-card-heading">
                  <FileTextOutlined />
                  {t("source.description")}
                </span>
              }
            >
              {getDataByLanguage(data.data, "theory", i18n.language).length ? (
                <HtmlParser
                  htmlString={getDataByLanguage(
                    data.data,
                    "theory",
                    i18n.language,
                  )}
                />
              ) : (
                <Paragraph
                  type="secondary"
                  className="source-empty-description"
                >
                  {t("source.noDescription")}
                </Paragraph>
              )}
            </Card>
          </section>

          <aside className="source-detail-sidebar">
            <Card
              className="source-detail-card source-problems-card"
              title={
                <span className="source-detail-card-heading">
                  <BookOutlined />
                  {t("source.problems")}
                </span>
              }
            >
              {data.data.problems.length ? (
                <List
                  className="source-problem-list"
                  dataSource={data.data.problems}
                  renderItem={(problem, index) => {
                    const problemTitle = getDataByLanguage(
                      problem,
                      "title",
                      i18n.language,
                    );
                    return (
                      <List.Item>
                        <Link
                          className="source-problem-link"
                          to={`/problems/${problem.id}`}
                        >
                          <span className="source-problem-number">
                            {index + 1}
                          </span>
                          <span className="source-problem-title">
                            {problemTitle}
                          </span>
                          <RightOutlined className="source-problem-arrow" />
                        </Link>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("source.noProblems")}
                />
              )}
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
