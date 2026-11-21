import { useEffect, useState } from "react";
import { Button, Card, Form, Input } from "antd";
import { useNavigate } from "react-router";
import { useLogin } from "./useLogin";
import useAuthStore from "../../store/authStore";
import { viewItem } from "../../utils/user";

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: signin, isLoading } = useLogin();
  const setUser = useAuthStore((state) => state.setUser);

  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Admin | Login";
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      username: import.meta.env.DEV ? "superadmin" : "",
      password: import.meta.env.DEV ? "test12345" : "",
    });
  }, [form]);
  const menu = [
    {
      key: "/",
    },

    {
      key: "/contests",

      permission: "get:contest",
    },

    {
      key: "/sources",

      permission: "get:source",
    },

    {
      key: "/problems",

      permission: "get:problem",
    },

    {
      key: "/groups",

      permission: "get:group",
    },
    {
      key: "/roles",

      permission: "get:role",
    },
    {
      key: "/users",

      permission: "get:user",
    },

    // {
    //   key: "/incoming-letters",
    //
    //
    // },
    {
      key: "/tags",

      permission: "get:tag",
    },
    // {
    //   key: "/logs",
    //
    //

    //   permission: "log:access",
    // },
  ];

  const handleSubmit = (values) => {
    signin(values, {
      onSuccess: (data) => {
        const user = data.data;
        const permissions = user.role.permissions.map((row) => row.name);
        setUser(data);
        // console.log(data.data);
        const menuFilter = menu.filter(
          (row) => !row.permission || permissions.includes(row.permission),
        )[0];
        // console.log(menuFilter);
        navigate(menuFilter.key);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card
          className="shadow-xl rounded-2xl border border-gray-100"
          styles={{
            body: {
              padding: "32px",
            },
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Ulgama hoş geldiňiz!
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Ulgama girmek üçin degişli meýdançalary dolduryň
            </p>
          </div>

          {/* Form */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Username */}
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Logini girizmeli",
                },
              ]}
            >
              <Input size="large" placeholder="Logini giriziň" />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Açar sözüni girizmeli",
                },
              ]}
            >
              <Input.Password size="large" placeholder="Açar sözüni giriziň" />
            </Form.Item>

            {/* Submit */}
            <Form.Item className="mb-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                className="h-11 rounded-lg"
              >
                Ulgama gir
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="text-center mt-4 text-sm text-gray-500">
            © {new Date().getFullYear()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
