import { useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useLogin } from "./useLogin";
import { navigationItems } from "../../components/layout/layoutConfig";

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: handleLogin, isPending } = useLogin();

  const submit = async (values) => {
    handleLogin(values, {
      onSuccess: (user) => {
        const permissions =
          user?.data?.role?.permissions?.map((row) => row.name) || [];

        const items = navigationItems.filter((row) =>
          permissions.includes(row.permission),
        );

        if (permissions.includes("admin:access") && !import.meta.env.DEV) {
          window.location.href = "/admin";
        }
        if (items.length === 0) navigate("404", { replace: false });
        navigate(items[0].key, { replace: false });
      },
    });
  };
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Hoş geldiňiz
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Ulgama gir
          {/* Sign in to your account */}
        </h1>
        <p className="mt-2 text-slate-500">
          Mesele çözmek üçin online kömekçi.
        </p>
      </div>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        onFinish={submit}
      >
        <Form.Item
          label="Login"
          name="username"
          rules={[{ required: true, message: "Enter your username" }]}
        >
          <Input
            prefix={<MailOutlined className="text-slate-400" />}
            placeholder="you@example.com"
            autoComplete="username"
          />
        </Form.Item>
        <div className="flex items-center justify-between">
          <span className="mb-2 text-sm font-medium text-slate-700">
            Açar sözi
          </span>
          <Link
            className="mb-2 text-sm font-medium text-blue-600"
            to="/forgot-password"
          >
            Açar sözüni unutdynmy?
          </Link>
        </div>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Enter your password" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="Enter your password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            autoComplete="current-password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={isPending}
          disabled={isPending}
          className="h-12 font-semibold"
        >
          Ulgama gir
        </Button>
      </Form>
      <p className="mt-7 text-center text-sm text-slate-500">
        Ulgamda täze?{" "}
        <Link to="/register" className="font-semibold text-blue-600">
          Täze profile döret
        </Link>
      </p>
    </>
  );
}
