import { useState } from "react";
import { Card, Input, Select, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import StatusTag from "../../components/ui/StatusTag";
import { submissions } from "../../data/mockData";
export default function SubmissionsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [verdict, setVerdict] = useState("all");
  const filtered = submissions.filter(
    (s) =>
      `${s.id} ${s.problem} ${s.language}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (verdict === "all" || s.verdict === verdict),
  );
  const columns = [
    { title: "#", dataIndex: "id" },
    {
      title: t("common.problem"),
      dataIndex: "problem",
      render: (v, row) => (
        <Link to={`/problems/${row.problemId}`} className="text-blue-600">
          {row.problemId}. {v}
        </Link>
      ),
    },
    { title: t("common.language"), dataIndex: "language" },
    {
      title: t("common.verdict"),
      dataIndex: "verdict",
      render: (v) => <StatusTag status={v} />,
    },
    { title: "Time", dataIndex: "time" },
    { title: "Memory", dataIndex: "memory" },
    { title: t("common.date"), dataIndex: "date" },
  ];
  return (
    <div>
      <PageTitle
        title={t("submissions.title")}
        subtitle={t("submissions.subtitle")}
      />
      <Card className="!rounded-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            prefix={<SearchOutlined />}
            allowClear
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:!max-w-xs"
          />
          <Select
            value={verdict}
            onChange={setVerdict}
            className="sm:!w-48"
            options={[
              { value: "all", label: t("common.all") },
              { value: "accepted", label: t("verdict.accepted") },
              { value: "wrong", label: t("verdict.wrong") },
              { value: "pending", label: t("verdict.pending") },
            ]}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
