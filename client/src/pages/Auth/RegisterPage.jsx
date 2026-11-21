import { useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { Link } from "react-router";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    try {
      message.info("Demo mode: connect registration to your backend API.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Topara senem goşul!
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Täze profil döret
        </h1>
        <p className="mt-2 text-slate-500">
          Meseleleri çöz, bäsleşiklere gatnaş we kämilleş.
        </p>
      </div>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        onFinish={submit}
      >
        <Form.Item
          label="Doly ady"
          name="fullName"
          rules={[{ required: true, message: "Enter your name" }]}
        >
          <Input
            prefix={<UserOutlined className="text-slate-400" />}
            placeholder="Your full name"
            autoComplete="name"
          />
        </Form.Item>
        <Form.Item
          label="Login"
          name="username"
          rules={[
            { required: true, message: "Choose a username" },
            { min: 3, message: "At least 3 characters" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-slate-400" />}
            placeholder="e.g. code_wizard"
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item
          label="Email adresi"
          name="email"
          rules={[
            { required: true, message: "Enter your email" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-slate-400" />}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item
          label="Açar sözi"
          name="password"
          rules={[
            { required: true, message: "Create a password" },
            { min: 8, message: "Use at least 8 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, v) =>
                v
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Please accept the terms to continue"),
                    ),
            },
          ]}
        >
          <Checkbox>
            Saýtyň içki{" "}
            <a className="text-blue-600" href="#terms">
              tertip-düzgünleri
            </a>{" "}
            and{" "}
            <a className="text-blue-600" href="#privacy">
              bilen ylalaşýaryn
            </a>
            .
          </Checkbox>
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="h-12 font-semibold"
        >
          Täze profilini döret
        </Button>
      </Form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Sizde profil barmy?{" "}
        <Link to="/login" className="font-semibold text-blue-600">
          Ulgama girmek
        </Link>
      </p>
    </>
  );
}
