import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Switch,
  Tooltip,
  Spin,
  List,
} from "antd";
import dayjs from "dayjs";
import {
  CloseOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import Topbar from "../../components/TopBar";
import { useGetProblems } from "../Problems/hooks/useProblems";
import { useWatch } from "antd/es/form/Form";

import { Select } from "antd";
import { useGetGroups } from "../Groups/useGroups";

const { Item } = Form;
const { TextArea } = Input;

const ContestForm = ({
  routes,
  name,
  type,
  isPending,
  handleSubmit,
  defaultValues = {},
}) => {
  const [form] = Form.useForm();
  const isPublic = useWatch("public", form);
  const canEditGroups =
    type === "create" || defaultValues?.status === "scheduled";

  const { data: groupsData, isFetching: isFetchingGroups } = useGetGroups({
    page: 1,
    limit: 1000,
    sort: "id",
    order: "desc",
  });

  const availableGroups = groupsData?.data?.data ?? groupsData?.data ?? [];

  const groupOptions = availableGroups.map((group) => ({
    value: Number(group.id),
    label: group.title,
  }));

  const navigate = useNavigate();
  const canEditProblems =
    type === "create" || defaultValues?.status === "scheduled";
  const [problemSearch, setProblemSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const previousPublic = useRef(undefined);

  const { data, isFetching } = useGetProblems({
    title: problemSearch.trim() || undefined,
    type: isPublic ? "contest" : "hidden",
    status: "deactive",
    notUsed: true,
    page: 1,
    limit: 20,
    sort: "id",
    order: "desc",
  });

  const problems = data?.data?.data ?? data?.data ?? [];
  useEffect(() => {
    if (isPublic === undefined) return;

    // First value initializes the watcher; don't clear during initialization.
    if (previousPublic.current === undefined) {
      previousPublic.current = isPublic;
      return;
    }

    // Clear only when the value actually changes.
    if (previousPublic.current !== isPublic) {
      previousPublic.current = isPublic;

      setSelectedProblems([]);
      setProblemSearch("");
      setShowSearchResults(false);
    }
  }, [isPublic]);
  const initialProblemsKey = JSON.stringify(
    (defaultValues?.problems ?? [])
      .map((problem) => ({
        id: Number(problem.id),
        order: Number(problem.ContestToProblem?.order ?? problem.order ?? 1),
        title: problem.titleTm,
      }))
      .sort((a, b) => a.order - b.order),
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
    setShowSearchResults(false);
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

      if (targetIndex < 0 || targetIndex >= next.length) {
        return previous;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next;
    });
  };
  // const initialProblems = defaultValues?.problems ?? [];
  useEffect(() => {
    if (type === "create") {
      form.setFieldsValue({
        title: "",
        description: "",
        startTime: null,
        duration: 120,
        public: true,
        fullTest: true,
        rating: true,
        penaltyMinutes: 0,
        groups: [],
      });

      setSelectedProblems([]);
      return;
    }

    form.setFieldsValue({
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      startTime: defaultValues?.startTime
        ? dayjs(defaultValues.startTime)
        : null,
      duration: defaultValues?.duration ?? 120,
      public: defaultValues?.public ?? true,
      fullTest: defaultValues?.fullTest ?? true,
      rating: defaultValues?.rating ?? true,
      penaltyMinutes: defaultValues?.penaltyMinutes ?? 0,
      groups: (defaultValues?.groups ?? []).map((group) =>
        Number(typeof group === "object" ? group.id : group),
      ),
    });

    const initialProblems = (defaultValues?.problems ?? [])
      .map((problem) => ({
        id: Number(problem.id),
        title: problem.titleTm,
        order: Number(problem.ContestToProblem?.order ?? problem.order ?? 1),
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ id, title }) => ({ id, title }));

    setSelectedProblems(initialProblems);
  }, [
    type,
    defaultValues?.id,
    defaultValues?.title,
    defaultValues?.description,
    defaultValues?.startTime,
    defaultValues?.duration,
    defaultValues?.public,
    defaultValues?.fullTest,
    defaultValues?.rating,
    initialProblemsKey,
    form,
  ]);
  const onSubmit = (values) => {
    const payload = {
      ...values,
      startTime: values.startTime
        ? values.startTime.format("YYYY-MM-DD HH:mm")
        : null,

      groups: (values.groups ?? []).map(Number),

      problems: selectedProblems.map((problem, index) => ({
        id: problem.id,
        order: index + 1,
      })),
    };

    delete payload.problemIds;

    handleSubmit(payload);
  };
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <Topbar name={name} routes={routes} />

      <div className="mt-3 min-h-0 w-full flex-1 overflow-y-auto rounded-lg bg-white px-4 py-5 shadow-md sm:px-6">
        <Form
          form={form}
          autoComplete="off"
          layout="vertical"
          onFinish={onSubmit}
          disabled={isPending}
          className="[&_.ant-form-item-label>label]:font-semibold"
        >
          {/* Contest title */}
          <Item
            label="Atlandyryşy"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Bäsleşigiň atlandyryşyny giriziň!",
              },
              {
                min: 3,
                message: "Atlandyryş azyndan 3 harpdan ybarat bolmaly!",
              },
              {
                max: 255,
                message: "Atlandyryş 255 harpdan köp bolmaly däl!",
              },
            ]}
          >
            <Input
              tabIndex={0}
              disabled={["finished", "running"].includes(defaultValues?.status)}
              placeholder="Bäsleşigiň atlandyryşyny giriziň"
              className="w-full"
              maxLength={255}
              showCount
            />
          </Item>

          {/* Start time and duration */}
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <Item
              label={
                <span className="flex items-center gap-2">
                  Başlanýan wagty
                  <Tooltip title="Wagty görkezmeseňiz, bäsleşik meýilnama boýunça başlanmaz.">
                    <InfoCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </span>
              }
              name="startTime"
            >
              <DatePicker
                disabled={["finished", "running"].includes(
                  defaultValues?.status,
                )}
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Başlanýan wagty saýlaň"
                className="w-full"
                allowClear
                disabledDate={(current) =>
                  current && current.isBefore(dayjs().startOf("day"))
                }
              />
            </Item>

            <Item
              label="Dowamlylygy (minut)"
              name="duration"
              rules={[
                {
                  required: true,
                  message: "Dowamlylygyny giriziň!",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Dowamlylyk azyndan 1 minut bolmaly!",
                },
              ]}
            >
              <InputNumber
                min={1}
                disabled={["finished"].includes(defaultValues?.status)}
                max={10080}
                step={5}
                className="w-full"
                placeholder="120"
                addonAfter={<ClockCircleOutlined className="text-gray-400" />}
              />
            </Item>
          </div>
          <div className="mb-5 rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 text-base font-semibold text-gray-800">
              Bäsleşigiň meseleleri
            </h3>

            <div className="relative">
              <Input.Search
                value={problemSearch}
                disabled={!canEditProblems}
                placeholder="Meseläniň ady boýunça gözläň"
                enterButton={<SearchOutlined />}
                onChange={(event) => {
                  setProblemSearch(event.target.value);
                  setShowSearchResults(true);
                }}
                onSearch={(value) => {
                  setProblemSearch(value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                allowClear
              />

              {showSearchResults && problemSearch.trim() && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {isFetching ? (
                    <div className="flex justify-center p-5">
                      <Spin />
                    </div>
                  ) : problems.length === 0 ? (
                    <Empty
                      className="py-4"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Mesele tapylmady"
                    />
                  ) : (
                    problems.map((problem) => {
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
                            {problem.difficulty && (
                              <div className="mt-1 text-xs text-gray-500">
                                {problem.difficulty}
                              </div>
                            )}
                          </div>

                          <Button
                            size="small"
                            type={alreadyAdded ? "default" : "primary"}
                            disabled={alreadyAdded || !canEditProblems}
                            onClick={() => addProblem(problem)}
                          >
                            {alreadyAdded ? "Added" : "OK"}
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
                        {/* Problem order */}
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
                        {/* Move up */}
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowUpOutlined />}
                          disabled={!canEditProblems || index === 0}
                          onClick={() => moveProblem(index, -1)}
                          aria-label={`Move problem ${problem.id} up`}
                          title="Move up"
                        />

                        {/* Move down */}
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowDownOutlined />}
                          disabled={
                            !canEditProblems ||
                            index === selectedProblems.length - 1
                          }
                          onClick={() => moveProblem(index, 1)}
                          aria-label={`Move problem ${problem.id} down`}
                          title="Move down"
                        />

                        {/* Remove */}
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                          disabled={!canEditProblems}
                          onClick={() => removeProblem(problem.id)}
                          aria-label={`Remove problem ${problem.id}`}
                          title="Remove problem"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Form.Item
              name="problemIds"
              hidden
              // rules={[
              //   {
              //     required: true,
              //     type: "array",
              //     min: 1,
              //     message: "Iň bolmanda bir mesele saýlaň!",
              //   },
              // ]}
            >
              <Input />
            </Form.Item>
          </div>
          {/* Contest settings */}
          <div className="mb-5 rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 text-base font-semibold text-gray-800">
              Bäsleşigiň sazlamalary
            </h3>
            {/* Contest groups */}

            <div className="flex flex-col gap-5">
              <Item name="public" valuePropName="checked" className="mb-0">
                <Checkbox
                  disabled={["finished", "running"].includes(
                    defaultValues?.status,
                  )}
                >
                  <span className="font-medium">Açyk bäsleşik</span>
                  <p className="mt-1 text-sm font-normal text-gray-500">
                    Bäsleşik ähli ulanyjylar üçin elýeterli bolar.
                  </p>
                </Checkbox>
              </Item>

              {/* <Item name="fullTest" valuePropName="checked" className="mb-0">
                <Checkbox
                  disabled={["finished", "running"].includes(
                    defaultValues?.status,
                  )}
                >
                  <span className="font-medium">Doly test</span>
                  <p className="mt-1 text-sm font-normal text-gray-500">
                    Bäsleşik doly test görnüşinde geçiriler.
                  </p>
                </Checkbox>
              </Item> */}

              {/* <Item name="rating" valuePropName="checked" className="mb-0">
                <Checkbox
                  disabled={["finished", "running"].includes(
                    defaultValues?.status,
                  )}
                >
                  <span className="font-medium">Reýtingi hasaplamak</span>
                  <p className="mt-1 text-sm font-normal text-gray-500">
                    Ulanyjylaryň netijeleri reýtinge täsir eder.
                  </p>
                </Checkbox>
              </Item> */}

              <Item
                label={
                  <span className="flex items-center gap-2">
                    Nädogry jogap üçin jerime (minut)
                    <Tooltip title="Nädogry netije alnan ýagdaýynda ulanyjy görkezilen wagt dowamynda täzeden çözgüt iberip bilmez. 0 bolsa jerime ulanylmaz.">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="penaltyMinutes"
                rules={[
                  {
                    required: true,
                    message: "Jerime wagtyny giriziň!",
                  },
                  {
                    type: "number",
                    min: 0,
                    max: 1440,
                    message: "Jerime 0 bilen 1440 minut aralygynda bolmaly!",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={1440}
                  step={1}
                  className="w-full"
                  placeholder="0"
                  addonAfter={<ClockCircleOutlined className="text-gray-400" />}
                />
              </Item>
            </div>
          </div>
          <div className="mb-5 rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 text-base font-semibold text-gray-800">
              Bäsleşige gatnaşýan toparlar
            </h3>

            <p className="mb-4 text-sm text-gray-500">
              Bäsleşige gatnaşmaga rugsat berilýän toparlary saýlaň.
            </p>

            <Item
              name="groups"
              label="Toparlar"
              rules={[
                {
                  type: "array",
                  message: "Toparlary dogry saýlaň!",
                },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                loading={isFetchingGroups}
                disabled={!canEditGroups}
                placeholder="Toparlary saýlaň"
                options={groupOptions}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                className="w-full"
                maxTagCount="responsive"
                notFoundContent={
                  isFetchingGroups ? <Spin size="small" /> : "Topar tapylmady"
                }
              />
            </Item>
          </div>
          {/* Actions */}
          <Item className="mb-0">
            <div className="flex w-full flex-col justify-end gap-3 sm:flex-row">
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

export default ContestForm;
