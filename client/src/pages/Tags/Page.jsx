import { Card, Col, Row, Tag as AntTag } from "antd";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import { tags } from "../../data/mockData";
export default function TagsPage() {
  const { t } = useTranslation();
  return <div><PageTitle title={t("tags.title")} subtitle={t("tags.subtitle")} /><Row gutter={[16,16]}>{tags.map(tag => <Col xs={12} sm={8} xl={6} key={tag.name}><Link to={`/problems?tag=${encodeURIComponent(tag.name)}`}><Card hoverable className="!rounded-xl"><AntTag color="blue">{tag.name}</AntTag><div className="mt-3 text-2xl font-bold">{tag.count}</div><div className="text-sm text-slate-500">{t("tags.count")}</div></Card></Link></Col>)}</Row></div>;
}