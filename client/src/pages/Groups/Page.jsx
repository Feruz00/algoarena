import { Button, Card, Col, Row, Typography, message } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import { groups } from "../../data/mockData";
const { Text } = Typography;
export default function GroupsPage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageTitle title={t("groups.title")} subtitle={t("groups.subtitle")} />
      <Row gutter={[16, 16]}>
        {groups.map((g) => (
          <Col xs={24} md={12} xl={8} key={g.id}>
            <Card className="h-full !rounded-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                {g.icon}
              </div>
              <h2 className="mb-2 text-lg font-semibold">{g.name}</h2>
              <Text type="secondary">{g.description}</Text>
              <div className="mt-5 flex items-center justify-between">
                <Text>
                  <TeamOutlined /> {g.members}{" "}
                  {t("groups.members").toLowerCase()}
                </Text>
                <Button onClick={() => message.success("Demo: group joined")}>
                  {t("groups.join")}
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
