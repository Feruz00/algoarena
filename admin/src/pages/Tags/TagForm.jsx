import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router";
import { GlobalOutlined, SaveOutlined, CheckOutlined } from "@ant-design/icons";

import Topbar from "../../components/Topbar";

const { Item } = Form;

const TagForm = ({
  routes = [],
  name = "Taglar",
  type = "create",
  initialValues = {},
  handleSubmit,
  isPending = false,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1150);

  const isUpdate = type === "update";

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

  // Set form values for create and update
  useEffect(() => {
    form.setFieldsValue({
      titleTm: initialValues.titleTm || "",
      titleEn: initialValues.titleEn || "",
      titleRu: initialValues.titleRu || "",
    });
  }, [
    form,
    initialValues.titleTm,
    initialValues.titleEn,
    initialValues.titleRu,
  ]);

  const onFinish = (values) => {
    handleSubmit?.({
      titleTm: values.titleTm.trim(),
      titleEn: values.titleEn.trim(),
      titleRu: values.titleRu.trim(),
    });
  };

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col gap-4">
      <Topbar name={name} routes={routes} />

      <div className="mt-3 min-h-0 w-full flex-1 overflow-y-auto rounded-lg bg-white px-4 py-4 shadow-md sm:px-6">
        <div className="mb-5 flex items-center gap-3">
          <GlobalOutlined className="text-xl text-blue-600" />

          <div>
            <h2 className="text-lg font-semibold">
              {isUpdate ? "Tagy üýtgetmek" : "Täze tag döretmek"}
            </h2>

            <p className="text-sm text-gray-500">
              {isUpdate
                ? "Tagyň atlaryny üç dilde üýtgediň."
                : "Tagyň atlaryny üç dilde giriziň."}
            </p>
          </div>
        </div>

        <Form
          form={form}
          labelCol={formLayout.labelCol}
          wrapperCol={formLayout.wrapperCol}
          layout="horizontal"
          autoComplete="off"
          onFinish={onFinish}
          requiredMark="optional"
          className="[&_.ant-form-item-label>label]:font-semibold"
          scrollToFirstError
        >
          <Item
            label="Türkmençe ady"
            name="titleTm"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Türkmençe adyny giriziň!",
              },
              {
                max: 120,
                message: "Ady 120 simwoldan köp bolmaly däl!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              maxLength={120}
              showCount
              placeholder="Meselem: Massiwler"
              className="w-full"
            />
          </Item>

          <Item
            label="Iňlisçe ady"
            name="titleEn"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Iňlisçe adyny giriziň!",
              },
              {
                max: 120,
                message: "Ady 120 simwoldan köp bolmaly däl!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              maxLength={120}
              showCount
              placeholder="Example: Arrays"
              className="w-full"
            />
          </Item>

          <Item
            label="Rusça ady"
            name="titleRu"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Rusça adyny giriziň!",
              },
              {
                max: 120,
                message: "Ady 120 simwoldan köp bolmaly däl!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              maxLength={120}
              showCount
              placeholder="Например: Массивы"
              className="w-full"
            />
          </Item>

          {/* Actions */}
          <Item
            wrapperCol={{
              xs: { span: 24 },
              lg: { span: 16, offset: 4 },
            }}
          >
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                tabIndex={0}
                type="primary"
                htmlType="submit"
                icon={isUpdate ? <CheckOutlined /> : <SaveOutlined />}
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

export default TagForm;
