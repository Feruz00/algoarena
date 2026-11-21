import { use, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "../../components/ui/PageTitle";
import useAuthStore from "../../store/authStore";
import { useWatch } from "antd/es/form/Form";
import { useChangePassword, useUpdateMyData } from "./useUsers";

export default function EditProfilePage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [formPassword] = Form.useForm();
  const setUser = useAuthStore((st) => st.setUser);

  const { mutate: updateMyData, isPending: isPendingMyData } =
    useUpdateMyData();
  const { mutate: changePassword, isPending: isPendingPassword } =
    useChangePassword();

  const navigate = useNavigate();
  const user = useAuthStore((st) => st.user);

  useEffect(() => {
    if (!user) return;
    const data = user.data;
    form.setFieldsValue({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      organization: data.organization,
      website: data.website,
      github: data.github,
      bio: data.bio,
    });
  }, [form, user]);
  useEffect(() => {
    formPassword.setFieldsValue({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [formPassword]);
  const handleUpdate = (values) => {
    updateMyData(values, {
      onSuccess: (data) => {
        setUser(data);
      },
    });
  };
  const handleChange = (values) => {
    // console.log(values);
    changePassword(values);
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title={t("profile.editTitle")}
        // subtitle={t("profile.editHint")}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            {t("common.back")}
          </Button>
        }
      />
      <div className="w-full flex flex-col gap-3">
        <Card className="!rounded-2xl">
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label={t("profile.fullName")}
                  rules={[{ required: true, message: t("profile.required") }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="username"
                  label={t("profile.username")}
                  rules={[{ required: true, message: t("profile.required") }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label={t("profile.email")}
                  rules={[
                    { type: "email", message: t("profile.emailInvalid") },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="organization"
                  label={t("profile.organization")}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="website" label={t("profile.website")}>
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="github" label="GitHub">
                  <Input placeholder="username" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="bio" label={t("profile.about")}>
                  <Input.TextArea rows={4} maxLength={300} showCount />
                </Form.Item>
              </Col>
            </Row>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button onClick={() => navigate("/users/feruz_dev")}>
                {t("common.close")}
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {t("profile.saveChanges")}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
      <div className="w-full flex flex-col gap-3">
        <Card className="!rounded-2xl">
          <Form form={formPassword} layout="vertical" onFinish={handleChange}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="oldPassword"
                  label={t("profile.oldPassword")}
                  rules={[
                    {
                      required: true,
                      message: t("profile.required"),
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="newPassword"
                  label={t("profile.newPassword")}
                  rules={[
                    {
                      required: true,
                      message: t("profile.required"),
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="confirmPassword"
                  label={t("profile.confirmPassword")}
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: t("profile.required"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error("Iki açar söz gabat gelmeli."),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button onClick={() => navigate("/users/feruz_dev")}>
                {t("common.close")}
              </Button>

              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {t("profile.saveChanges")}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
