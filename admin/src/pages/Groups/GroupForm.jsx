import { Button, Form, Input } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import Topbar from "../../components/TopBar";
const { Item } = Form;
const GroupForm = ({
  routes,
  name,
  type,
  isPending,
  handleSubmit,
  defaultValues = {},
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  useEffect(() => {
    if (type === "create") {
      form.setFieldsValue({ title: "", description: "" });
    } else {
      form.setFieldsValue({
        title: defaultValues?.title || "",
        description: defaultValues?.description || "",
      });
    }
  }, [type, defaultValues, form]);
  const onSubmit = (values) => {
    handleSubmit(values);
  };
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      {" "}
      <Topbar name={name} routes={routes} />{" "}
      <div className="mt-3 min-h-0 w-full flex-1 overflow-y-auto rounded-lg bg-white px-4 py-4 shadow-md sm:px-6">
        {" "}
        <Form
          form={form}
          autoComplete="off"
          layout="vertical"
          onFinish={onSubmit}
          className="[&_.ant-form-item-label>label]:font-semibold"
        >
          {" "}
          {/* Title */}{" "}
          <Item
            label="Atlandyryşy"
            name="title"
            rules={[
              { required: true, message: "Atlandyryşy giriziň!" },
              { min: 3, message: "Atlandyryş 3 harpdan az bolmaly däl!" },
            ]}
          >
            {" "}
            <Input tabIndex={0} className="w-full" />{" "}
          </Item>{" "}
          {/* Description */}{" "}
          <Item
            label="Mazmuny"
            name="description"
            rules={[{ required: true, message: "Mazmuny giriziň!" }]}
          >
            {" "}
            <Input.TextArea
              tabIndex={0}
              className="w-full"
              autoSize={{ minRows: 5, maxRows: 12 }}
            />{" "}
          </Item>{" "}
          {/* Actions */}{" "}
          <Item>
            {" "}
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              {" "}
              <Button
                tabIndex={0}
                type="primary"
                htmlType="submit"
                className="w-full sm:w-auto"
                loading={isPending}
                disabled={isPending}
              >
                {" "}
                Submit{" "}
              </Button>{" "}
              <Button
                tabIndex={0}
                type="default"
                htmlType="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
                loading={isPending}
                disabled={isPending}
              >
                {" "}
                Cancel{" "}
              </Button>{" "}
            </div>{" "}
          </Item>{" "}
        </Form>{" "}
      </div>{" "}
    </div>
  );
};
export default GroupForm;
