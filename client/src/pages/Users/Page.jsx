import { Avatar, Card, Input, Table } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import { Link } from "react-router";
import { users } from "../../data/mockData";
export default function UsersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const columns = [
    {
      title: t("rankings.user"),
      dataIndex: "name",
      render: (v, record) => (
        <Link
          to={`/users/${encodeURIComponent(v)}`}
          className="flex items-center gap-2 font-medium text-slate-800"
        >
          <Avatar
            src={`https://i.pravatar.cc/80?u=${encodeURIComponent(v)}`}
            icon={<UserOutlined />}
          />
          {v}
        </Link>
      ),
    },
    {
      title: t("rankings.rating"),
      dataIndex: "rating",
      render: (v) => (
        <span className="font-semibold text-blue-700">
          <TrophyOutlined className="mr-2" />
          {v}
        </span>
      ),
    },
    { title: t("rankings.solved"), dataIndex: "solved" },
  ];
  return (
    <div>
      <PageTitle title={t("users.title")} subtitle={t("users.subtitle")} />
      <Card className="!rounded-xl">
        <Input
          prefix={<SearchOutlined />}
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!mb-4 sm:!max-w-xs"
        />
        <Table
          rowKey="name"
          columns={columns}
          dataSource={users.filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase()),
          )}
          pagination={false}
        />
      </Card>
    </div>
  );
}
