import { useState } from "react";
import { Button, Form, Input, Result, message } from "antd";
import { Link, useSearchParams } from "react-router";
import { LockOutlined } from "@ant-design/icons";
export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const token = params.get("token");
  const submit = () => {
    setLoading(true);
    try {
      setDone(true);
      message.success("Demo password reset complete");
    } finally {
      setLoading(false);
    }
  };
  return done ? (
    <Result
      status="success"
      title="Password updated"
      subTitle="Your demo password reset flow is complete. Connect your API to persist the new password."
      extra={
        <Button type="primary" href="/login">
          Return to sign in
        </Button>
      }
    />
  ) : (
    <>
      <div className="mb-8">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
          <LockOutlined />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Täze açar sözi
        </h1>
        <p className="mt-3 leading-6 text-slate-500">
          Kynrak açar sözüni dörediň.
        </p>
      </div>
      {!token && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          No reset token was provided. This is a UI demo; open with{" "}
          <code>?token=your-token</code> when integrating your backend.
        </div>
      )}
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        onFinish={submit}
      >
        <Form.Item
          label="New password"
          name="password"
          rules={[
            { required: true, message: "Enter a new password" },
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
          label="Confirm new password"
          name="confirm"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                return !value || getFieldValue("password") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="h-12 font-semibold"
        >
          Reset password
        </Button>
      </Form>
      <p className="mt-7 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-blue-600">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
