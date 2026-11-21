import { useState } from "react";
import { Button, Form, Input, Result, message } from "antd";
import { Link } from "react-router";
import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = ({ email }) => {
    setLoading(true);
    try {
      setSent(true);
      message.success("Demo request prepared");
    } finally {
      setLoading(false);
    }
  };
  return sent ? (
    <Result
      status="success"
      title="Check your inbox"
      subTitle="If an account exists for that email, password reset instructions will be sent. This demo does not send real email."
      extra={
        <Button type="primary" onClick={() => setSent(false)}>
          Try another email
        </Button>
      }
    />
  ) : (
    <>
      <div className="mb-8">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
          <MailOutlined />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Açar sözüňi unutdynmy?
        </h1>
        <p className="mt-3 leading-6 text-slate-500">
          Alada etme. Biz size açar sözüňizi täzeläp ulgama girmekde kömek
          ederis!
        </p>
      </div>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        onFinish={submit}
      >
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
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="h-12 font-semibold"
        >
          Dikeldiji adresi almak
        </Button>
      </Form>
      <Link
        to="/login"
        className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeftOutlined /> Ulgama girmek
      </Link>
    </>
  );
}
