import {
  Breadcrumb,
  Button,
  Empty,
  Form,
  Input,
  Select,
  Segmented,
  Spin,
} from "antd";

import {
  CloseOutlined,
  LoadingOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import Topbar from "../../components/Topbar";
import Editor from "../../components/Editor";

import { useGetSourceParents, useGetSources } from "./useSources";

import classNames from "classnames";
import { useGetProblems } from "../Problems/hooks/useProblems";

const { Item } = Form;

const languages = [
  {
    short: "TM",
    value: "tm",
  },
  {
    label: "English",
    short: "EN",
    value: "en",
  },
  {
    short: "RU",
    value: "ru",
  },
];

const isEditorEmpty = (html = "") => {
  if (!html) {
    return true;
  }

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

const SourceForm = ({
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

  const [problemSearch, setProblemSearch] = useState("");
  const [showProblemResults, setShowProblemResults] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const { data: problemData, isFetching: isFetchingProblems } = useGetProblems({
    title: problemSearch.trim() || undefined,
    type: "source",
    status: "deactive",
    notUsed: true,
    page: 1,
    limit: 20,
    sort: "id",
    order: "desc",
  });

  const availableProblems = problemData?.data?.data ?? problemData?.data ?? [];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1150);

  const [langTitle, setLangTitle] = useState("tm");
  const [langTheory, setLangTheory] = useState("tm");

  const selectedParent = Form.useWatch("parentId", form);

  const [selectedParents, setSelectedParents] = useState([]);
  const defaultParentId = useMemo(() => {
    if (defaultValues?.id) return defaultValues?.id;
    return null;
  }, [defaultValues]);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const addProblem = (problem) => {
    const id = Number(problem.id);

    setSelectedProblems((previous) => {
      if (previous.some((item) => item.id === id)) return previous;

      return [
        ...previous,
        {
          id,
          title:
            problem.titleTm ||
            problem.titleEn ||
            problem.titleRu ||
            problem.title ||
            `Problem #${id}`,
        },
      ];
    });

    setProblemSearch("");
    setShowProblemResults(false);
  };

  const removeProblem = (id) => {
    setSelectedProblems((previous) =>
      previous.filter((problem) => problem.id !== id),
    );
  };

  const moveProblem = (index, direction) => {
    setSelectedProblems((previous) => {
      const next = [...previous];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= next.length) return previous;

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next;
    });
  };

  const initialProblemsKey = JSON.stringify(
    (defaultValues?.problems ?? [])
      .map((problem) => ({
        id: Number(problem.id),
        order: Number(problem.order ?? 1),
        title:
          problem.titleTm ||
          problem.titleEn ||
          problem.titleRu ||
          problem.title ||
          `Problem #${problem.id}`,
      }))
      .sort((a, b) => a.order - b.order),
  );
  const queryKey = useMemo(
    () => ({
      page: 1,
      limit: 200,
      parentId: selectedParent || undefined,
    }),
    [selectedParent],
  );

  const {
    data: sources,
    isLoading: isLoadingSources,
    isSuccess: isSuccessSources,
  } = useGetSources(queryKey);

  const {
    data: parentSources,
    isLoading: isLoadingParentSources,
    isSuccess: isSuccessParentSources,
  } = useGetSourceParents(defaultParentId);

  useEffect(() => {
    if (type === "create") {
      form.setFieldsValue({
        titleTm: "",
        titleRu: "",
        titleEn: "",
        theoryTm: "",
        theoryRu: "",
        theoryEn: "",
        parentId: null,
      });

      setSelectedParents([]);
      setSelectedProblems([]);
      return;
    }

    if (type !== "update" || !defaultValues?.id) return;

    form.setFieldsValue({
      titleTm: defaultValues.titleTm ?? "",
      titleRu: defaultValues.titleRu ?? "",
      titleEn: defaultValues.titleEn ?? "",
      theoryTm: defaultValues.theoryTm ?? "",
      theoryRu: defaultValues.theoryRu ?? "",
      theoryEn: defaultValues.theoryEn ?? "",
      parentId: defaultValues.parentId ?? null,
    });

    const initialProblems = (defaultValues.problems ?? [])
      .map((problem) => ({
        id: Number(problem.id),
        title:
          problem.titleTm ||
          problem.titleEn ||
          problem.titleRu ||
          problem.title ||
          `Problem #${problem.id}`,
        order: Number(problem.order ?? 1),
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ id, title }) => ({ id, title }));

    setSelectedProblems(initialProblems);
  }, [
    type,
    defaultValues?.id,
    defaultValues?.titleTm,
    defaultValues?.titleRu,
    defaultValues?.titleEn,
    defaultValues?.theoryTm,
    defaultValues?.theoryRu,
    defaultValues?.theoryEn,
    defaultValues?.parentId,
    initialProblemsKey,
    form,
  ]);
  const onFinish = (values) => {
    handleSubmit({
      ...values,
      problems: selectedProblems.map((problem, index) => ({
        id: problem.id,
        order: index + 1,
      })),
    });
  };
  return (
    <div className="flex max-h-full min-h-0 w-full flex-col gap-4">
      <Topbar name={name} routes={routes} />

      <div className="mt-3 min-h-0 w-full flex-1 overflow-y-auto rounded-lg bg-white px-4 py-4 shadow-md sm:px-6">
        <Form
          form={form}
          labelCol={formLayout.labelCol}
          wrapperCol={formLayout.wrapperCol}
          autoComplete="off"
          onFinish={onFinish}
          scrollToFirstError={{
            behavior: "smooth",
            block: "center",
          }}
          className="[&_.ant-form-item-label>label]:font-semibold"
        >
          <Item label="Atlandyryşy">
            <div
              className={classNames(
                "mb-1",
                isMobile ? "w-full" : "w-[66.666667%]",
              )}
            >
              <Segmented
                block={isMobile}
                value={langTitle}
                onChange={setLangTitle}
                options={languages.map((item) => ({
                  label: item.short,
                  value: item.value,
                }))}
              />
            </div>

            <Item
              name="titleTm"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Türkmençe atlandyryşy giriziň",
                },
              ]}
              className={langTitle === "tm" ? "inline" : "hidden"}
            >
              <Input placeholder="Atlandyryşy" />
            </Item>

            <Item
              name="titleRu"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Rusça atlandyryşy giriziň",
                },
              ]}
              className={langTitle === "ru" ? "inline" : "hidden"}
            >
              <Input placeholder="Atlandyryşy" />
            </Item>

            <Item
              name="titleEn"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Iňlisçe atlandyryşy giriziň",
                },
              ]}
              className={langTitle === "en" ? "inline" : "hidden"}
            >
              <Input placeholder="Atlandyryşy" />
            </Item>
          </Item>
          <Item name="parentId" label="Degişli çeşmesi">
            <div className="flex w-full flex-col gap-3">
              {selectedParents.length > 0 && (
                <Breadcrumb
                  className="mb-1"
                  items={selectedParents.map((row, index) => ({
                    title: (
                      <div
                        className={classNames(
                          "flex items-center gap-2",
                          selectedParent === row.id
                            ? "font-semibold text-green-600"
                            : "",
                        )}
                      >
                        <span>{row.titleTm}</span>

                        <CloseOutlined
                          className="cursor-pointer"
                          onClick={() => {
                            if (index === 0) {
                              form.setFieldValue("parentId", null);
                            } else {
                              const previous = selectedParents[index - 1];

                              form.setFieldValue("parentId", previous.id);
                            }

                            setSelectedParents((prev) =>
                              prev.filter((_, i) => i < index),
                            );
                          }}
                        />
                      </div>
                    ),
                  }))}
                />
              )}

              {isLoadingSources && (
                <div className="mt-1.5">
                  <LoadingOutlined className="text-xl text-blue-500" />
                </div>
              )}

              {isSuccessSources && sources?.data?.length > 0 && (
                <Select
                  allowClear
                  showSearch
                  placeholder={
                    selectedParents.length === 0
                      ? "Esasy çeşmäni saýlaň"
                      : "Aşakdaky çeşmäni saýlaň"
                  }
                  loading={isLoadingSources}
                  className="w-full"
                  onChange={(value) => {
                    if (value === undefined) {
                      form.setFieldValue("parentId", null);

                      setSelectedParents([]);
                      return;
                    }

                    const selected = sources.data.find(
                      (row) => row.id === value,
                    );

                    if (!selected) {
                      return;
                    }

                    setSelectedParents((prev) => [...prev, selected]);

                    form.setFieldValue("parentId", value);
                  }}
                  options={sources.data.map((item) => ({
                    value: item.id,
                    label: item.titleTm,
                  }))}
                />
              )}
            </div>
          </Item>
          <Item label="Degişli meseleler">
            <div className="mb-5 rounded-lg border border-gray-200 p-4">
              <div className="relative">
                <Input.Search
                  value={problemSearch}
                  placeholder="Meseläniň ady boýunça gözläň"
                  enterButton={<SearchOutlined />}
                  onChange={(e) => {
                    setProblemSearch(e.target.value);
                    setShowProblemResults(true);
                  }}
                  onSearch={(value) => {
                    setProblemSearch(value);
                    setShowProblemResults(true);
                  }}
                  onFocus={() => setShowProblemResults(true)}
                  allowClear
                />

                {showProblemResults && problemSearch.trim() && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {isFetchingProblems ? (
                      <div className="flex justify-center p-5">
                        <Spin />
                      </div>
                    ) : availableProblems.length === 0 ? (
                      <Empty
                        className="py-4"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Mesele tapylmady"
                      />
                    ) : (
                      availableProblems.map((problem) => {
                        const id = Number(problem.id);
                        const alreadyAdded = selectedProblems.some(
                          (item) => item.id === id,
                        );

                        const title =
                          problem.titleTm ||
                          problem.titleEn ||
                          problem.titleRu ||
                          problem.title ||
                          `Problem #${id}`;

                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-gray-800">
                                #{id} — {title}
                              </div>
                            </div>

                            <Button
                              size="small"
                              type={alreadyAdded ? "default" : "primary"}
                              disabled={alreadyAdded}
                              onClick={() => addProblem(problem)}
                            >
                              {alreadyAdded ? "Added" : "Goş"}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-2 text-sm font-medium text-gray-700">
                  Saýlanan meseleler ({selectedProblems.length})
                </div>

                {selectedProblems.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                    Entek mesele saýlanmady
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedProblems.map((problem, index) => (
                      <div
                        key={problem.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs text-gray-500">
                              Problem #{problem.id}
                            </div>
                            <div className="truncate font-medium text-gray-800">
                              {problem.title}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="text"
                            size="small"
                            icon={<ArrowUpOutlined />}
                            disabled={index === 0}
                            onClick={() => moveProblem(index, -1)}
                            title="Ýokary geçir"
                          />

                          <Button
                            type="text"
                            size="small"
                            icon={<ArrowDownOutlined />}
                            disabled={index === selectedProblems.length - 1}
                            onClick={() => moveProblem(index, 1)}
                            title="Aşak geçir"
                          />

                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => removeProblem(problem.id)}
                            title="Aýyr"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Item>

          <Item label="Teoriýa">
            <div
              className={classNames(
                "mb-1",
                isMobile ? "w-full" : "w-[66.666667%]",
              )}
            >
              <Segmented
                block={isMobile}
                value={langTheory}
                onChange={setLangTheory}
                options={languages.map((item) => ({
                  label: item.short,
                  value: item.value,
                }))}
              />
            </div>

            <div>
              <Item
                name="theoryTm"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!isEditorEmpty(value)) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Türkmençe teoriýany giriziň"),
                      );
                    },
                  },
                ]}
                className={langTheory === "tm" ? "block" : "hidden"}
              >
                <Editor />
              </Item>

              {/* RU */}

              <Item
                name="theoryRu"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!isEditorEmpty(value)) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Rusça teoriýany giriziň"),
                      );
                    },
                  },
                ]}
                className={langTheory === "ru" ? "block" : "hidden"}
              >
                <Editor />
              </Item>

              {/* EN */}

              <Item
                name="theoryEn"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!isEditorEmpty(value)) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Iňlisçe teoriýany giriziň"),
                      );
                    },
                  },
                ]}
                className={langTheory === "en" ? "block" : "hidden"}
              >
                <Editor />
              </Item>
            </div>
          </Item>
          {/* =====================================================
              BUTTONS
          ====================================================== */}
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
                type="primary"
                htmlType="submit"
                className="w-full sm:w-auto"
                loading={isPending}
                disabled={isPending}
              >
                Submit
              </Button>

              <Button
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

export default SourceForm;
