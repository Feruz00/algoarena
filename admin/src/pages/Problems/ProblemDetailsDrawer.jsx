import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useGetProblem } from "./hooks/useProblems";
import {
  useCreateTestGroup,
  useDeleteTestGroup,
  useGetTestGroups,
  useUpdateTestGroup,
  useUpdateTestGroupOrder,
} from "./hooks/useTestGroups";
import {
  useCreateTestCase,
  useDeleteTestCase,
  useGetTestCases,
  useUpdateTestCase,
  useUpdateTestCaseOrder,
} from "./hooks/useTestCases";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { viewItem } from "../../utils/user";
import { HtmlParser } from "../../ui/HtmlParser";

const { Text, Title } = Typography;
const { TextArea } = Input;

const difficulties = [
  { value: "beginner", label: "Başlangyç " },
  { value: "easy", label: "Ýeňil " },
  { value: "medium", label: "Orta " },
  { value: "hard", label: "Kyn " },
  { value: "expert", label: "Örän kyn " },
];

const languages = [
  { label: "Türkmençe", short: "TM", value: "tm", key: "Tm" },
  { label: "English", short: "EN", value: "en", key: "En" },
  { label: "Русский", short: "RU", value: "ru", key: "Ru" },
];

const languageSuffixes = {
  tm: "Tm",
  en: "En",
  ru: "Ru",
};

const getLocalizedValue = (item, field, language = "tm") => {
  const suffix = languageSuffixes[language] || "Tm";

  return (
    item?.[`${field}${suffix}`] ||
    item?.[`${field}Tm`] ||
    item?.[`${field}En`] ||
    item?.[`${field}Ru`] ||
    ""
  );
};

const getPayload = (response) => response?.data ?? response;

const getTitle = (item, language = "tm") =>
  getLocalizedValue(item, "title", language) ||
  item?.name ||
  item?.title ||
  "—";

const getDifficulty = (value) =>
  difficulties.find((row) => row.value === value)?.label || "beginner";

const getProblemStatement = (problem) =>
  problem?.statement ||
  problem?.description ||
  problem?.statementTm ||
  problem?.descriptionTm ||
  problem?.statementEn ||
  problem?.descriptionEn ||
  problem?.statementRu ||
  problem?.descriptionRu ||
  "";

const getList = (response) => {
  const payload = getPayload(response);
  return Array.isArray(payload) ? payload : payload?.data || [];
};

const getCount = (response, rows) => {
  const payload = getPayload(response);
  return payload?.count ?? rows.length;
};

const ProblemDetailsDrawer = ({ open, problemId, onClose }) => {
  const [testsOpen, setTestsOpen] = useState(false);
  const [language, setLanguage] = useState("tm");
  const {
    data: problemResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetProblem(problemId);

  const problem = useMemo(() => getPayload(problemResponse), [problemResponse]);

  useEffect(() => {
    if (!open) setTestsOpen(false);
  }, [open]);

  return (
    <>
      <Drawer
        title={
          <div className="pr-6">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Mesele barada maglumat
            </div>
          </div>
        }
        open={open}
        onClose={onClose}
        width={600}
        size="large"
        destroyOnClose={false}
        extra={
          <div className="min-w-72">
            <Segmented
              block
              value={language}
              onChange={setLanguage}
              options={languages.map((item) => ({
                label: item.short,
                value: item.value,
                title: item.label,
              }))}
              className="w-full"
            />
          </div>
        }
      >
        <Spin spinning={isLoading || isFetching}>
          {!problem ? (
            <Empty description="Mesele maglumatlary tapylmady" />
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Text type="secondary" className="text-xs">
                      MESELE
                    </Text>
                    <Title level={4} className="!mb-2 !mt-1">
                      {getTitle(problem, language)}
                    </Title>
                  </div>

                  {problem.difficulty && (
                    <Tag
                      color={
                        String(problem.difficulty).toLowerCase() === "easy"
                          ? "green"
                          : String(problem.difficulty).toLowerCase() === "hard"
                            ? "red"
                            : "orange"
                      }
                    >
                      {getDifficulty(problem.difficulty)}
                    </Tag>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatCard
                    label="Wagt çägi"
                    value={
                      problem.timeLimitMs != null
                        ? `${problem.timeLimitMs} ms`
                        : "—"
                    }
                  />
                  <StatCard
                    label="Ýat çägi"
                    value={
                      problem.memoryLimitMb != null
                        ? `${problem.memoryLimitMb} MB`
                        : "—"
                    }
                  />
                  <StatCard label="ID" value={problem.id ?? "—"} />
                </div>
              </div>

              <section>
                <Title level={5}>Meseläniň beýany</Title>
                {getProblemStatement(problem) ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">
                      <HtmlParser
                        htmlString={getLocalizedValue(
                          problem,
                          "description",
                          language,
                        )}
                      />
                    </pre>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Beýan maglumatlary ýok"
                  />
                )}
              </section>

              <section>
                <Title level={5}>Goşmaça maglumatlar</Title>
                <Descriptions
                  bordered
                  size="small"
                  column={1}
                  labelStyle={{ width: 150 }}
                >
                  <Descriptions.Item label="Giriş formaty">
                    <HtmlParser
                      htmlString={getLocalizedValue(
                        problem,
                        "inputDescription",
                        language,
                      )}
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="Çykyş formaty">
                    <HtmlParser
                      htmlString={getLocalizedValue(
                        problem,
                        "expectedOutputDescription",
                        language,
                      )}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Goşmaça maglumatlar">
                    <HtmlParser
                      htmlString={getLocalizedValue(problem, "note", language)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Tegler">
                    {problem.tags.length
                      ? problem.tags
                          ?.map((tag) =>
                            getLocalizedValue(tag, "title", language),
                          )
                          .join(", ")
                      : "--------"}
                  </Descriptions.Item>
                </Descriptions>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Title level={5} className="!mb-1">
                      Testler
                    </Title>
                    <Text type="secondary" className="text-sm">
                      Test toparlaryny we test maglumatlaryny dolandyryň.
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    icon={<ExperimentOutlined />}
                    onClick={() => setTestsOpen(true)}
                  >
                    Testleri dolandyrmak
                  </Button>
                </div>
              </section>
            </div>
          )}
        </Spin>
      </Drawer>

      <TestManagementModal
        open={testsOpen}
        problem={problem}
        onClose={() => setTestsOpen(false)}
      />
    </>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-white bg-white/80 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 break-words text-base font-semibold text-slate-800">
      {value}
    </div>
  </div>
);

const Row = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });
  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: "move",
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };
  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

const TestManagementModal = ({ open, problem, onClose }) => {
  const problemId = problem?.id;

  const canCreateGroup = viewItem("create:test-group");
  const canEditGroup = viewItem("update:test-group");
  const canDeleteGroup = viewItem("delete:test-group");

  const canCreateCase = viewItem("create:test-case");
  const canEditCase = viewItem("update:test-case");
  const canDeleteCase = viewItem("delete:test-case");

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingCase, setEditingCase] = useState(null);

  const [largeTest, setLargeTest] = useState(null);
  const [largeTestModalOpen, setLargeTestModalOpen] = useState(false);

  const openLargeTest = (testCase) => {
    setLargeTest(testCase);
    setLargeTestModalOpen(true);
  };

  const [groupForm] = Form.useForm();
  const [caseForm] = Form.useForm();

  const groupQuery = useGetTestGroups({
    problemId,
    page: 1,
    limit: 100,
    sort: "order",
    order: "asc",
  });

  const groups = useMemo(() => getList(groupQuery.data), [groupQuery.data]);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  const caseQuery = useGetTestCases({
    groupId: selectedGroupId,
    page: 1,
    limit: 100,
    sort: "order",
    order: "asc",
  });

  const testCases = useMemo(() => getList(caseQuery.data), [caseQuery.data]);

  const createGroup = useCreateTestGroup();
  const updateGroup = useUpdateTestGroup();
  const deleteGroup = useDeleteTestGroup();

  const createCase = useCreateTestCase();
  const updateCase = useUpdateTestCase();
  const deleteCase = useDeleteTestCase();

  const changeOrder = useUpdateTestGroupOrder();
  const changeTestOrder = useUpdateTestCaseOrder();
  useEffect(() => {
    if (!open) return;

    setSelectedGroupId(null);
    setGroupModalOpen(false);
    setCaseModalOpen(false);
    setEditingGroup(null);
    setEditingCase(null);
  }, [open, problemId]);

  useEffect(() => {
    if (
      selectedGroupId &&
      !groups.some((group) => group.id === selectedGroupId)
    ) {
      setSelectedGroupId(null);
    }
  }, [groups, selectedGroupId]);

  const openGroupForm = (group = null) => {
    setEditingGroup(group);
    groupForm.resetFields();

    if (group) {
      groupForm.setFieldsValue({
        name: group.name || group.name || "",
        score: group.score || group.score || 1,
      });
    } else {
      groupForm.setFieldsValue({
        name: "",
        score: 1,
      });
    }

    setGroupModalOpen(true);
  };

  const submitGroup = (values) => {
    const payload = {
      ...values,
      problemId,
      name: values.name.trim(),
    };

    if (editingGroup) {
      updateGroup.mutate(
        { id: editingGroup.id, data: payload },
        {
          onSuccess: () => {
            setGroupModalOpen(false);
            setEditingGroup(null);
            groupForm.resetFields();
            groupQuery.refetch();
          },
        },
      );
    } else {
      createGroup.mutate(payload, {
        onSuccess: (response) => {
          setGroupModalOpen(false);
          groupForm.resetFields();
          groupQuery.refetch();

          const created = getPayload(response);
          const createdGroup = created?.data || created;

          if (createdGroup?.id) {
            setSelectedGroupId(createdGroup.id);
          }
        },
      });
    }
  };

  const handleDeleteGroup = (id) => {
    deleteGroup.mutate(id, {
      onSuccess: () => {
        if (selectedGroupId === id) setSelectedGroupId(null);
        groupQuery.refetch();
      },
    });
  };

  const openCaseForm = (testCase = null) => {
    if (!selectedGroupId) {
      message.warning("Ilki bilen test toparyny saýlaň.");
      return;
    }

    setEditingCase(testCase);
    caseForm.resetFields();

    if (testCase) {
      caseForm.setFieldsValue({
        input: testCase.input ?? "",
        expectedOutput: testCase.expectedOutput ?? "",
        isSample: Boolean(testCase.isSample),
      });
    } else {
      caseForm.setFieldsValue({
        input: "",
        expectedOutput: "",
        isSample: true,
      });
    }

    setCaseModalOpen(true);
  };

  const submitCase = (values) => {
    const payload = {
      ...values,
      groupId: selectedGroupId,
    };

    if (editingCase) {
      updateCase.mutate(
        { id: editingCase.id, data: payload },
        {
          onSuccess: () => {
            setCaseModalOpen(false);
            setEditingCase(null);
            caseForm.resetFields();
            caseQuery.refetch();
          },
        },
      );
    } else {
      createCase.mutate(payload, {
        onSuccess: () => {
          setCaseModalOpen(false);
          caseForm.resetFields();
          caseQuery.refetch();
        },
      });
    }
  };

  const handleDeleteCase = (id) => {
    deleteCase.mutate(id, {
      onSuccess: () => caseQuery.refetch(),
    });
  };

  const groupColumns = [
    {
      title: "T/B",
      dataIndex: "order",
      key: "order",
      width: 70,
    },

    {
      title: "Toparyň ady",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <button
          type="button"
          className={`text-left font-medium ${
            record.id === selectedGroupId
              ? "text-blue-600"
              : "text-slate-700 hover:text-blue-600"
          }`}
          onClick={() => setSelectedGroupId(record.id)}
        >
          {value || record.name || `Topar #${record.id}`}
        </button>
      ),
    },
    {
      title: "Topar üçin bal",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Sazlamalar",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {canEditGroup && (
            <Tooltip title="Topary üýtgetmek">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openGroupForm(record)}
              />
            </Tooltip>
          )}

          {canDeleteGroup && (
            <Popconfirm
              title="Test toparyny pozmak isleýärsiňizmi?"
              okText="Hawa"
              cancelText="Ýok"
              onConfirm={() => handleDeleteGroup(record.id)}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const caseColumns = [
    {
      title: "T/B",
      dataIndex: "order",
      key: "order",
      width: 70,
    },

    {
      title: "Giriş",
      dataIndex: "input",
      key: "input",
      render: (value, record) => {
        const isLarge = (value || "").length > 500;

        return (
          <div className="flex max-w-56 items-start gap-2">
            <pre className="m-0 max-h-20 min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-all font-mono text-xs text-slate-600">
              {value || "—"}
            </pre>

            {isLarge && (
              <Button
                type="link"
                size="small"
                className="!px-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openLargeTest(record);
                }}
              >
                Giňişleýin
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Çykyş",
      dataIndex: "expectedOutput",
      key: "expectedOutput",
      render: (value, record) => {
        const isLarge = (value || "").length > 500;

        return (
          <div className="flex max-w-56 items-start gap-2">
            <pre className="m-0 max-h-20 min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-all font-mono text-xs text-slate-600">
              {value || "—"}
            </pre>

            {isLarge && (
              <Button
                type="link"
                size="small"
                className="!px-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openLargeTest(record);
                }}
              >
                Giňişleýin
              </Button>
            )}
          </div>
        );
      },
    },

    {
      title: "Görnüşi",
      dataIndex: "isSample",
      key: "isSample",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "purple"}>
          {value ? "Nusgada bar" : "Nusgada ýok"}
        </Tag>
      ),
    },
    {
      title: "Sazlamalar",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {canEditCase && (
            <Tooltip title="Testi üýtgetmek">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openCaseForm(record)}
              />
            </Tooltip>
          )}

          {canDeleteCase && (
            <Popconfirm
              title="Testi pozmak isleýärsiňizmi?"
              okText="Hawa"
              cancelText="Ýok"
              onConfirm={() => handleDeleteCase(record.id)}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const sensorGroups = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  const onDragEndGroups = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    changeOrder.mutate({
      problemId,
      data: {
        activeId: active.id,
        overId: over.id,
      },
    });
  };

  const sensorTest = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  const onDragEndTests = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    changeTestOrder.mutate({
      groupId: selectedGroupId,
      data: {
        activeId: active.id,
        overId: over.id,
      },
    });
  };

  return (
    <>
      <Modal
        title={
          <div className="pr-6">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              TEST MERKEZI
            </div>
            <div className="mt-1 text-base font-semibold text-slate-800">
              {getTitle(problem)} — test toparlary
            </div>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={1100}
        destroyOnClose={false}
        centered
        styles={{
          body: { paddingTop: 20, maxHeight: "75vh", overflowY: "auto" },
        }}
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <Title level={5} className="!mb-1">
                  Test toparlary
                </Title>
                <Text type="secondary" className="text-xs">
                  {getCount(groupQuery.data, groups)} topar
                </Text>
              </div>

              {canCreateGroup && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openGroupForm()}
                >
                  Täze topar
                </Button>
              )}
            </div>
            <DndContext
              sensors={sensorGroups}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={onDragEndGroups}
            >
              <SortableContext
                items={groups?.map((i) => i.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  size="small"
                  rowKey="id"
                  components={{
                    body: { row: Row },
                  }}
                  columns={groupColumns}
                  dataSource={groups}
                  loading={groupQuery.isLoading || groupQuery.isFetching}
                  pagination={false}
                  scroll={{ x: "max-content", y: 280 }}
                  rowClassName={(record) =>
                    record.id === selectedGroupId
                      ? "bg-blue-50 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onRow={(record) => ({
                    onClick: () => setSelectedGroupId(record.id),
                  })}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Test toparlary ýok"
                      />
                    ),
                  }}
                />
              </SortableContext>
            </DndContext>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Title level={5} className="!mb-1">
                  Testler
                </Title>
                <Text type="secondary" className="text-xs">
                  {selectedGroup ? selectedGroup.name : "Test toparyny saýlaň"}
                </Text>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={!selectedGroupId || !canCreateCase}
                onClick={() => openCaseForm()}
              >
                Täze test
              </Button>
            </div>

            {selectedGroupId ? (
              <DndContext
                sensors={sensorTest}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={onDragEndTests}
              >
                <SortableContext
                  items={testCases?.map((i) => i.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <Table
                    size="small"
                    rowKey="id"
                    columns={caseColumns}
                    dataSource={testCases}
                    loading={caseQuery.isLoading || caseQuery.isFetching}
                    components={{
                      body: { row: Row },
                    }}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      size: "small",
                    }}
                    scroll={{ x: "max-content", y: 280 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Bu toparda test ýok"
                        />
                      ),
                    }}
                  />
                </SortableContext>
              </DndContext>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ExperimentOutlined style={{ fontSize: 22 }} />
                </div>
                <div className="font-medium text-slate-700">
                  Test toparyny saýlaň
                </div>
                <div className="mt-1 max-w-xs text-sm text-slate-500">
                  Saýlanan toparyň testleri şu ýerde görkeziler.
                </div>
              </div>
            )}
          </section>
        </div>
      </Modal>

      <Modal
        title={editingGroup ? "Test toparyny üýtgetmek" : "Täze test topary"}
        open={groupModalOpen}
        onCancel={() => setGroupModalOpen(false)}
        onOk={() => groupForm.submit()}
        okText="Submit"
        cancelText="Cancel"
        confirmLoading={createGroup.isPending || updateGroup.isPending}
        destroyOnClose
      >
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={submitGroup}
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label="Toparyň ady"
            rules={[
              { required: true, message: "Toparyň adyny giriziň." },
              { whitespace: true, message: "Toparyň ady boş bolmaly däl." },
            ]}
          >
            <Input
              maxLength={150}
              placeholder="Mysal: Esasy testler"
              showCount
            />
          </Form.Item>

          <Form.Item
            name="score"
            label="Topar üçin bal"
            tooltip="Topardaky ähli testler geçende berilýän bal"
          >
            <InputNumber
              maxLength={150}
              placeholder="Mysal: 5"
              min={1}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCase ? "Testi üýtgetmek" : "Täze test"}
        open={caseModalOpen}
        onCancel={() => setCaseModalOpen(false)}
        onOk={() => caseForm.submit()}
        okText="Submit"
        cancelText="Cancel"
        confirmLoading={createCase.isPending || updateCase.isPending}
        destroyOnClose
      >
        <Form
          form={caseForm}
          layout="vertical"
          onFinish={submitCase}
          requiredMark="optional"
        >
          <Form.Item
            name="input"
            label="Giriş maglumatlary"
            rules={[
              { required: true, message: "Giriş maglumatlaryny giriziň." },
            ]}
          >
            <TextArea
              rows={5}
              placeholder={"Mysal:\n3\n1 2 3"}
              className="font-mono"
            />
          </Form.Item>

          <Form.Item
            name="expectedOutput"
            label="Garaşylýan çykyş"
            rules={[
              { required: true, message: "Çykyş maglumatlaryny giriziň." },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={"Mysal:\n6"}
              className="font-mono"
            />
          </Form.Item>

          <Form.Item
            name="isSample"
            label="Mesele şertindäki test"
            valuePropName="checked"
            tooltip="Bu görnüşli testler diňe meseläniň şertinde bolýar."
          >
            <Switch checkedChildren="Gizlin" unCheckedChildren="Açyk" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Test maglumatlary"
        open={largeTestModalOpen}
        onCancel={() => setLargeTestModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setLargeTestModalOpen(false)}
          >
            Ýapmak
          </Button>,
        ]}
        width={850}
        destroyOnClose
      >
        {largeTest && (
          <div className="space-y-5">
            <div>
              <div className="mb-2 font-semibold text-slate-700">
                Giriş maglumatlary
              </div>

              <pre className="max-h-[35vh] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
                {largeTest.input || "—"}
              </pre>

              <Button
                className="mt-2"
                onClick={() =>
                  navigator.clipboard.writeText(largeTest.input || "")
                }
              >
                Girişi göçürmek
              </Button>
            </div>

            <div>
              <div className="mb-2 font-semibold text-slate-700">
                Garaşylýan çykyş
              </div>

              <pre className="max-h-[35vh] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
                {largeTest.expectedOutput || "—"}
              </pre>

              <Button
                className="mt-2"
                onClick={() =>
                  navigator.clipboard.writeText(largeTest.expectedOutput || "")
                }
              >
                Çykyşy göçürmek
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProblemDetailsDrawer;
