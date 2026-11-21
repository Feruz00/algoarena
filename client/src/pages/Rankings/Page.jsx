import { Card, Table, Tag } from "antd";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import { users } from "../../data/mockData";
export default function RankingsPage() {
  const { t } = useTranslation();
  const columns = [
    { title: t("rankings.rank"), dataIndex: "rank", width: 90, render: v => <span className={`font-bold ${v <= 3 ? "text-amber-500" : "text-slate-500"}`}>#{v}</span> },
    { title: t("rankings.user"), dataIndex: "name", render: (v, row) => <span>{row.country} <span className="ml-2 font-semibold">{v}</span></span> },
    { title: t("rankings.rating"), dataIndex: "rating", render: v => <Tag color="blue">{v}</Tag> },
    { title: t("rankings.solved"), dataIndex: "solved" },
  ];
  return <div><PageTitle title={t("rankings.subtitle")} subtitle={t("rankings.title")} /><Card className="!rounded-xl"><Table rowKey="rank" columns={columns} dataSource={users} pagination={false} /></Card></div>;
}