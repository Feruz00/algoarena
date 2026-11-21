import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, Input, Select, Button, Tag, Radio, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  GithubOutlined,
  LockOutlined,
  GlobalOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import Topbar from "../../components/TopBar";
import { handleFormTab } from "../../utils/functions";

const { Item } = Form;
const { TextArea } = Input;

const UserForm = ({
  routes,
  name,
  type,
  handleSubmit,
  isPending,
  roles,
  groups,
  defaultValues = {},
}) => {
  const [form] = Form.useForm();
  const initializedRef = useRef(false);

  const navigate = useNavigate();

  const selectedGroups = Form.useWatch("groups", form) || [];

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1150 : false,
  );

  const [groupId, setGroupId] = useState(null);

  const formLayout = useMemo(
    () => ({
      labelCol: {
        span: isMobile ? 24 : 4,
      },
      wrapperCol: {
        span: isMobile ? 24 : 16,
      },
    }),
    [isMobile],
  );

  // Responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Form keyboard navigation
  useEffect(() => {
    const formDOM = document.querySelector("form");

    if (!formDOM) return;

    formDOM.addEventListener("keydown", handleFormTab);

    return () => {
      formDOM.removeEventListener("keydown", handleFormTab);
    };
  }, []);

  // Normalize groups from API into IDs.
  const normalizeGroups = (userGroups = []) => {
    if (!Array.isArray(userGroups)) return [];

    return userGroups.map((group) =>
      typeof group === "object" ? group.id : group,
    );
  };

  // Initialize form.
  useEffect(() => {
    if (type === "create") {
      form.resetFields();

      form.setFieldsValue({
        username: "",
        email: "",
        github: "",
        fullName: "",
        password: "",
        organization: "",
        website: "",
        bio: "",
        status: "active",
        roleId: undefined,
        groups: [],
      });

      initializedRef.current = true;
      return;
    }

    if (
      type === "update" &&
      defaultValues &&
      Object.keys(defaultValues).length > 0
    ) {
      const user = defaultValues.data || defaultValues;

      form.resetFields();

      form.setFieldsValue({
        ...user,
        password: "",
        groups: normalizeGroups(user.groups),
      });

      initializedRef.current = true;
    }
  }, [type, defaultValues, form]);

  const handleAddGroup = () => {
    if (!groupId) return;

    if (!selectedGroups.includes(groupId)) {
      form.setFieldValue("groups", [...selectedGroups, groupId]);
    }

    setGroupId(null);
  };

  const handleRemoveGroup = (id) => {
    form.setFieldValue(
      "groups",
      selectedGroups.filter((item) => item !== id),
    );
  };

  const handleFinish = (values) => {
    const payload = {
      ...values,
      groups: values.groups || [],
    };

    // Never send an empty password when updating.
    if (type === "update" && !payload.password) {
      delete payload.password;
    }

    handleSubmit(payload);
  };

  const selectedGroupDetails = useMemo(() => {
    const groupMap = new Map(
      (groups?.data || []).map((item) => [item.id, item]),
    );

    return selectedGroups.map((id) => groupMap.get(id)).filter(Boolean);
  }, [selectedGroups, groups]);

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col gap-4">
      <Topbar name={name} routes={routes} />

      <div className="mt-3 min-h-0 w-full flex-1 overflow-y-auto rounded-lg bg-white px-4 py-4 shadow-md sm:px-6">
        <Form
          form={form}
          labelCol={formLayout.labelCol}
          wrapperCol={formLayout.wrapperCol}
          autoComplete="off"
          onFinish={handleFinish}
          className="[&_.ant-form-item-label>label]:font-semibold"
        >
          <Divider orientation="left" plain>
            Ulanyjy maglumatlary
          </Divider>

          {/* Full name */}
          <Item
            label="Doly ady"
            name="fullName"
            rules={[
              {
                required: true,
                message: "Adyny giriziň!",
              },
              {
                min: 2,
                max: 100,
                message: "Ady 2-100 harp aralygynda bolmaly!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              prefix={<UserOutlined />}
              placeholder="Doly adyny giriziň"
              className="w-full"
              maxLength={100}
            />
          </Item>

          {/* Username */}
          <Item
            label="Logini"
            name="username"
            rules={[
              {
                required: true,
                message: "Logini giriziň!",
              },
              {
                min: 3,
                max: 50,
                message: "Login 3-50 harp aralygynda bolmaly!",
              },
              {
                pattern: /^[a-zA-Z0-9_.-]+$/,
                message: "Diňe harp, san, _, - we . ulanyp bilersiňiz!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              prefix={<UserOutlined />}
              placeholder="Username"
              className="w-full"
              maxLength={50}
            />
          </Item>

          {/* Email */}
          <Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Email giriziň!",
              },
              {
                type: "email",
                message: "Dogry email giriziň!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              prefix={<MailOutlined />}
              placeholder="example@gmail.com"
              className="w-full"
            />
          </Item>

          {/* GitHub */}
          <Item
            label="GitHub"
            name="github"
            rules={[
              {
                required: true,
                message: "GitHub ulanyjy adyny giriziň!",
              },
              {
                max: 255,
                message: "GitHub username gaty uzyn!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              prefix={<GithubOutlined />}
              placeholder="github-username"
              className="w-full"
            />
          </Item>

          {/* Password */}
          <Item
            label="Açar sözi"
            name="password"
            rules={[
              ...(type === "create"
                ? [
                    {
                      required: true,
                      message: "Açar sözüni giriziň!",
                    },
                  ]
                : []),
              {
                min: 8,
                message: "Açar sözi azyndan 8 harp bolmaly!",
              },
            ]}
          >
            <Input.Password
              tabIndex={0}
              prefix={<LockOutlined />}
              placeholder={
                type === "update"
                  ? "Üýtgetmek isleseňiz giriziň"
                  : "Açar sözüni giriziň"
              }
              className="w-full"
              autoComplete="new-password"
            />
          </Item>

          <Divider orientation="left" plain>
            Goşmaça maglumatlar
          </Divider>

          {/* Organization */}
          <Item label="Gurama" name="organization">
            <Input
              tabIndex={0}
              prefix={<ApartmentOutlined />}
              placeholder="Gurama"
              className="w-full"
            />
          </Item>

          {/* Website */}
          <Item
            label="Websaýt"
            name="website"
            rules={[
              {
                type: "url",
                warningOnly: true,
                message: "Websaýtyň salgysy dogry däl!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              prefix={<GlobalOutlined />}
              placeholder="https://example.com"
              className="w-full"
            />
          </Item>

          {/* Bio */}
          <Item label="Bio" name="bio">
            <TextArea
              tabIndex={0}
              placeholder="Özüňiz barada..."
              rows={3}
              maxLength={2000}
              showCount
            />
          </Item>

          <Divider orientation="left" plain>
            Hasap sazlamalary
          </Divider>

          {/* Role */}
          <Item
            label="Ygtyýarlyk"
            name="roleId"
            rules={[
              {
                required: true,
                message: "Ygtyýarlyk saýlaň!",
              },
            ]}
          >
            <Select
              tabIndex={0}
              placeholder="Ygtyýarlyk saýlaň"
              className="w-full"
              options={
                roles?.data?.map((row) => ({
                  label: row.label,
                  value: row.id,
                })) || []
              }
              showSearch
              optionFilterProp="label"
            />
          </Item>

          {/* Status */}
          <Item
            label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: "Status saýlaň",
              },
            ]}
          >
            <Radio.Group
              block
              tabIndex={0}
              options={[
                {
                  label: "Aktiw",
                  value: "active",
                },
                {
                  label: "Deaktiw",
                  value: "deactive",
                },
                {
                  label: "Bloklanan",
                  value: "blocked",
                },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Item>

          {/* Groups */}
          <Item label="Toparlar" name="groups">
            <div className="flex w-full flex-col gap-3">
              {selectedGroupDetails.length > 0 && (
                <div className="flex w-full flex-wrap gap-2">
                  {selectedGroupDetails.map((row) => (
                    <Tag
                      key={row.id}
                      closable
                      onClose={() => handleRemoveGroup(row.id)}
                    >
                      {row.title}
                    </Tag>
                  ))}
                </div>
              )}

              <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Select
                  tabIndex={0}
                  value={groupId}
                  placeholder="Topar saýlaň"
                  className="w-full sm:flex-1"
                  options={
                    groups?.data
                      ?.filter((row) => !selectedGroups.includes(row.id))
                      .map((row) => ({
                        label: row.title,
                        value: row.id,
                      })) || []
                  }
                  onChange={setGroupId}
                  showSearch
                  optionFilterProp="label"
                />

                <Button
                  tabIndex={0}
                  type="primary"
                  onClick={handleAddGroup}
                  className="w-full sm:w-auto sm:min-w-24"
                  disabled={!groupId}
                >
                  Saýla
                </Button>
              </div>
            </div>
          </Item>

          {/* Actions */}
          <Item
            wrapperCol={{
              xs: {
                span: 24,
              },
              lg: {
                span: 16,
                offset: 4,
              },
            }}
          >
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                tabIndex={0}
                type="primary"
                htmlType="submit"
                className="w-full sm:w-auto"
                loading={isPending}
                disabled={isPending}
              >
                Submit
              </Button>

              <Button
                tabIndex={0}
                type="default"
                htmlType="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </Item>
        </Form>
      </div>
    </div>
  );
};

export default UserForm;
