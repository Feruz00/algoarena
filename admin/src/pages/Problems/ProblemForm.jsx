import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Switch,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  DiffOutlined,
  FileTextOutlined,
  SettingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

import Topbar from "../../components/Topbar";
import Editor from "../../components/Editor";
import { useGetTags } from "../Tags/useTags";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Item } = Form;

const languages = [
  { label: "Türkmençe", short: "TM", value: "tm", key: "Tm" },
  { label: "English", short: "EN", value: "en", key: "En" },
  { label: "Русский", short: "RU", value: "ru", key: "Ru" },
];

const difficulties = [
  { value: "beginner", label: "Başlangyç " },
  { value: "easy", label: "Ýeňil " },
  { value: "medium", label: "Orta " },
  { value: "hard", label: "Kyn " },
  { value: "expert", label: "Örän kyn " },
];

const checkerTypes = [
  {
    value: "tokens",
    label: "Adaty deňeşdirme (boşluklar hasaba alynmaýar)",
  },
  {
    value: "exact",
    label: "Takyk deňeşdirme",
  },
];

const types = [
  {
    value: "contest",
    label: "Umumy bäsleşik üçin",
  },
  {
    value: "hidden",
    label: "Guramaçylykly bäsleşik üçin",
  },

  {
    value: "source",
    label: "Çeşmelere degişli ",
  },
];
const isEditorEmpty = (html = "") => {
  if (!html) return true;

  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<\/?div[^>]*>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/\u00a0/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

  return !text;
};

const requiredEditorRule = (label) => ({
  validator: (_, value) => {
    if (!isEditorEmpty(value)) {
      return Promise.resolve();
    }

    return Promise.reject(new Error(`${label} giriziň`));
  },
});

const SectionHeading = ({ icon, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
      {icon}
    </div>

    <div className="min-w-0">
      <Title level={5} className="mb-1!">
        {title}
      </Title>
      <Text type="secondary" className="text-sm">
        {description}
      </Text>
    </div>
  </div>
);
const EditorField = ({ name }) => {
  const form = Form.useFormInstance();
  const value = Form.useWatch(name, form) ?? "";

  return (
    <Editor
      value={value}
      onChange={(html) => {
        form.setFieldValue(name, html);
      }}
    />
  );
};
const LanguageFields = ({
  label,
  fieldPrefix,
  language,
  setLanguage,
  required = false,
  editor = false,
  placeholder = "",
}) => {
  const form = Form.useFormInstance();

  return (
    <Item label={label}>
      <div className="mb-3 max-w-64 w-full">
        <Segmented
          block
          value={language}
          onChange={setLanguage}
          options={languages.map((item) => ({
            label: item.short,
            value: item.value,
          }))}
        />
      </div>

      {languages.map((lang) => {
        const name = `${fieldPrefix}${lang.key}`;
        // console.log(lang.value.toCapitalize());
        return (
          <Item
            key={name}
            name={name}
            preserve
            rules={
              required
                ? [
                    editor
                      ? requiredEditorRule(`${lang.label}: ${label}`)
                      : {
                          required: true,
                          whitespace: true,
                          message: `${lang.label}: ${label} giriziň`,
                        },
                  ]
                : []
            }
            className={language === lang.value ? "mb-0!" : "hidden!"}
          >
            {editor ? (
              <EditorField name={name} />
            ) : (
              <TextArea
                placeholder={placeholder || `${label} (${lang.label})`}
                autoSize={{ minRows: 3, maxRows: 8 }}
                maxLength={5000}
                showCount
              />
            )}
          </Item>
        );
      })}
    </Item>
  );
};
const ProblemForm = ({
  routes,
  name,
  type,
  isPending,
  handleSubmit,
  defaultValues = {},
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const isEdit = type === "update";

  const [titleLanguage, setTitleLanguage] = useState("tm");
  const [descriptionLanguage, setDescriptionLanguage] = useState("tm");
  const [noteLanguage, setNoteLanguage] = useState("tm");

  const [inputLanguage, setInputLanguage] = useState("tm");
  const [outputLanguage, setOutputLanguage] = useState("tm");

  useEffect(() => {
    if (isEdit && defaultValues && Object.keys(defaultValues).length > 0) {
      // console.log(defaultValues);
      form.setFieldsValue({
        titleTm: defaultValues.titleTm ?? "",
        titleEn: defaultValues.titleEn ?? "",
        titleRu: defaultValues.titleRu ?? "",

        descriptionTm: defaultValues.descriptionTm ?? "",
        descriptionEn: defaultValues.descriptionEn ?? "",
        descriptionRu: defaultValues.descriptionRu ?? "",

        inputDescriptionTm: defaultValues.inputDescriptionTm ?? "",
        inputDescriptionEn: defaultValues.inputDescriptionEn ?? "",
        inputDescriptionRu: defaultValues.inputDescriptionRu ?? "",

        outputDescriptionTm: defaultValues.outputDescriptionTm ?? "",
        outputDescriptionEn: defaultValues.outputDescriptionEn ?? "",
        outputDescriptionRu: defaultValues.outputDescriptionRu ?? "",

        // constraintsText: defaultValues.constraintsText ?? "",

        noteTm: defaultValues.noteTm ?? "",
        noteEn: defaultValues.noteEn ?? "",
        noteRu: defaultValues.noteRu ?? "",

        timeLimitMs: defaultValues.timeLimitMs ?? 1000,
        memoryLimitMb: defaultValues.memoryLimitMb ?? 256,
        difficulty: defaultValues.difficulty ?? "easy",
        isPublished: defaultValues.status === "active" ? true : false,
        checkerType: defaultValues.checkerType ?? "tokens",
        type: defaultValues.type ?? "contest",
        tags: defaultValues.tags?.map((row) => row.id) || [],
        // checkerKey: defaultValues.che
        // ckerKey ?? "",
      });
    }
  }, [defaultValues, form, isEdit]);

  const onFinish = (values) => {
    const payload = {
      ...values,
      timeLimitMs: Number(values.timeLimitMs),
      memoryLimitMb: Number(values.memoryLimitMb),
      status: Boolean(values.isPublished) ? "active" : "deactive",
    };

    handleSubmit(payload);
  };

  const { data: tagsResponse, isLoading: isTagsLoading } = useGetTags({
    limit: 200,
  });

  const tags = tagsResponse?.data ?? [];

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: `${tag.titleTm} `,
  }));
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <Topbar name={name} routes={routes} />
      <div className="h-full overflow-y-auto rounded-md shadow">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
          initialValues={{
            difficulty: "easy",
            timeLimitMs: 1000,
            memoryLimitMb: 256,
            isPublished: false,
            checkerType: "tokens",
            type: "contest",
          }}
          scrollToFirstError={{
            behavior: "smooth",
            block: "center",
          }}
          className="space-y-5"
        >
          {/* BASIC INFORMATION */}
          <Card className="border-none! border-b! rounded-b-none!">
            <SectionHeading
              icon={<FileTextOutlined />}
              title="Esasy maglumatlar"
              description="Meseläniň ady, salgysy we kynçylyk derejesi."
            />

            <LanguageFields
              label="Meseläniň ady"
              fieldPrefix="title"
              language={titleLanguage}
              setLanguage={setTitleLanguage}
              required
              placeholder="Mesele adyny giriziň"
            />

            <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
              <Item
                label="Kynçylyk derejesi"
                name="difficulty"
                rules={[
                  {
                    required: true,
                    message: "Kynçylyk derejesini saýlaň",
                  },
                ]}
              >
                <Select options={difficulties} placeholder="Derejäni saýlaň" />
              </Item>
            </div>
          </Card>

          {/* PROBLEM DESCRIPTION */}
          <Card className="border-none! border-b! rounded-b-none!">
            <SectionHeading
              icon={<CodeOutlined />}
              title="Meseläniň beýany"
              description="Ulanyjylara meseläniň şertini düşündiriň."
            />

            <LanguageFields
              label="Meseläniň şerti"
              fieldPrefix="description"
              language={descriptionLanguage}
              setLanguage={setDescriptionLanguage}
              required
              editor
            />

            <div className="mt-6 grid grid-cols-1 gap-x-5 lg:grid-cols-2">
              <LanguageFields
                label="Giriş maglumatlary"
                fieldPrefix="inputDescription"
                language={inputLanguage}
                setLanguage={setInputLanguage}
                placeholder="Giriş maglumatlarynyň formatyny düşündiriň..."
                editor
              />

              <LanguageFields
                label="Çykyş maglumatlary"
                fieldPrefix="outputDescription"
                language={outputLanguage}
                setLanguage={setOutputLanguage}
                placeholder="Garaşylýan çykyşyň formatyny düşündiriň..."
                editor
              />
            </div>

            <LanguageFields
              label="Çäklendirmeler"
              fieldPrefix="note"
              language={noteLanguage}
              setLanguage={setNoteLanguage}
              placeholder="Goşmaça maglumatlar bolsa düşündiriň..."
              editor
            />
          </Card>

          {/* EXECUTION SETTINGS */}
          <Card className="border-none! border-b! rounded-b-none!">
            <SectionHeading
              icon={<SettingOutlined />}
              title="Ýerine ýetiriş sazlamalary"
              description="Koduň ýerine ýetiriliş wagtyny we ýadyny kesgitläň."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Item
                label="Wagt çägi (millisekunt)"
                name="timeLimitMs"
                rules={[
                  {
                    required: true,
                    message: "Wagt çägini giriziň",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Wagt çägi azyndan 1 ms bolmaly",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={600000}
                  step={100}
                  className="w-full!"
                  addonAfter="ms"
                />
              </Item>

              <Item
                label="Ýat çägi (MB)"
                name="memoryLimitMb"
                rules={[
                  {
                    required: true,
                    message: "Ýat çägini giriziň",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Ýat çägi azyndan 1 MB bolmaly",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={65536}
                  step={64}
                  className="w-full!"
                  addonAfter="MB"
                />
              </Item>

              <Item
                label="Meseläniň ugry"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Hökman tipini girizmeli",
                  },
                ]}
              >
                <Select options={types} />
              </Item>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
              <div>
                <Text strong>Meseläni çap etmek</Text>
                <div className="mt-1">
                  <Text type="secondary" className="text-sm">
                    Işjeň bolsa, mesele köpçülige elýeterli bolar.
                  </Text>
                </div>
              </div>

              <Item
                name="isPublished"
                valuePropName="checked"
                className="mb-0!"
              >
                <Switch checkedChildren="Aktiw" unCheckedChildren="Aktiw däl" />
              </Item>
            </div>

            <Alert
              className="mt-5!"
              type="info"
              showIcon
              message="Ýatda saklaň"
              description="Meseläni çap etmezden öň onuň şertlerini, giriş/çykyş düşündirişlerini we test toparlaryny barlaň."
            />
          </Card>

          {/* TAGS */}
          <Card className="border-none! border-b! rounded-b-none!">
            <SectionHeading
              icon={<TagsOutlined />}
              title="Teglar"
              description="Meselä degişli algoritmleri we maglumat gurluşlaryny saýlaň."
            />

            <Item name="tags" label="Meseläniň taglary">
              <Select
                mode="multiple"
                allowClear
                showSearch
                loading={isTagsLoading}
                options={tagOptions}
                placeholder="Taglary saýlaň"
                optionFilterProp="label"
                maxTagCount="responsive"
                className="w-full"
                maxCount={5}
              />
            </Item>
          </Card>

          {/* OUTPUT CHECKER SETTINGS */}
          <Card className="border-none! border-b! rounded-b-none!">
            <SectionHeading
              icon={<CodeOutlined />}
              title="Çykyş maglumatlaryny barlamak"
              description="Ulgamyň gatnaşyjylaryň jogaplaryny nähili deňeşdirmelidigini kesgitläň."
            />

            <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
              <Item
                label="Barlagçynyň görnüşi"
                name="checkerType"
                tooltip="Jogabyň dogrudygyny kesgitlemek üçin ulanylýan deňeşdirme usuly."
                rules={[
                  {
                    required: true,
                    message: "Barlagçynyň görnüşini saýlaň",
                  },
                ]}
              >
                <Select
                  options={checkerTypes}
                  placeholder="Barlagçynyň görnüşini saýlaň"
                />
              </Item>
            </div>

            <Alert
              showIcon
              type="info"
              message="Barlagçyny saýlamak boýunça maslahat"
              description={
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Adaty meseleler üçin. Boşluklar we setir geçişleri netijä
                    täsir etmeýär.
                  </li>
                  <li>Çykyş doly gabat gelmeli bolanda ulanyň.</li>
                </ul>
              }
            />
          </Card>

          <div className="bg-white flex flex-col-reverse gap-3  p-4  sm:flex-row sm:justify-end">
            <Button
              onClick={() => navigate(-1)}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckCircleOutlined />}
              loading={isPending}
              disabled={isPending}
              className="w-full sm:min-w-44 sm:w-auto"
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProblemForm;
