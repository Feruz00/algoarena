import { Button, Input, Popconfirm, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";

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
    label: "Adaty deňeşdirme",
  },
  {
    value: "exact",
    label: "Takyk deňeşdirme",
  },
];

export const getProblemColumns = ({
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  title,
  handleDelete,
  handleSearch,
  handleReset,
  difficulty,
  onView,
  canView,
  canEdit,
  canDelete,
  tagIds,
  tags,
}) => {
  const columns = [
    {
      title: "T/b",
      key: "index",
      fixed: "left",
      width: 64,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Sözbaşy",
      dataIndex: "title",
      key: "title",
      fixed: "left",
      width: 260,
      sorter: true,
      sortOrder: sortField === "title" ? sortOrder : null,
      render: (value, record) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-800">
            {value || record.titleTm || record.titleEn || record.titleRu || "—"}
          </div>
        </div>
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div className="w-64 p-3" onKeyDown={(e) => e.stopPropagation()}>
          <Input
            autoFocus
            placeholder="Sözbaşy gözle..."
            value={selectedKeys[0] || ""}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0] || "");
            }}
          />

          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="small"
              onClick={() => {
                confirm();
                handleSearch(selectedKeys[0] || "");
              }}
            >
              Gözle
            </Button>

            <Button
              size="small"
              onClick={() => {
                clearFilters?.();
                confirm();
                handleReset();
              }}
            >
              Arassala
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      filteredValue: title ? [title] : null,
    },
    {
      title: "Dereje",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 160,
      filters: difficulties.map((row) => ({
        text: row.label,
        value: row.value,
      })),
      filterMultiple: false,
      filteredValue: difficulty ? [difficulty] : [],

      render: (value) => {
        const colors = {
          beginner: "blue",
          easy: "green",
          medium: "orange",
          hard: "red",
          expert: "purple",
        };

        if (!value) return "—";

        const difficulty = difficulties.find(
          (item) => item.value === String(value).toLowerCase(),
        );

        return (
          <Tag color={colors[String(value).toLowerCase()] || "default"}>
            {difficulty?.label || value}
          </Tag>
        );
      },
    },
    {
      title: "Wagt (ms)",
      dataIndex: "timeLimitMs",
      key: "timeLimitMs",
      width: 110,
      sorter: true,
      sortOrder: sortField === "timeLimitMs" ? sortOrder : null,
      render: (value) => (value != null ? value : "—"),
    },
    {
      title: "Ýat (MB)",
      dataIndex: "memoryLimitMb",
      key: "memoryLimitMb",
      width: 110,
      sorter: true,
      sortOrder: sortField === "memoryLimitMb" ? sortOrder : null,
      render: (value) => (value != null ? value : "—"),
    },

    {
      title: "Barlagyň görnüşi",
      dataIndex: "checkerType",
      key: "checkerType",
      width: 150,
      render: (value) => (
        <Tag>{checkerTypes.find((row) => row.value === value).label}</Tag>
      ),
    },

    {
      title: "Tegler",
      key: "tags",
      dataIndex: "tags",
      width: 130,

      filters: tags?.data?.map((row) => ({ text: row.titleTm, value: row.id })),
      filterMultiple: true,
      filteredValue: tagIds,
      render: (value) =>
        value?.length
          ? value.map((tag) => (
              <Tag color="blue" key={tag.id}>
                {tag.titleTm}
              </Tag>
            ))
          : "-----",
    },
  ];

  if (canView || canEdit || canDelete) {
    columns.push({
      title: "Sazlamalar",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {canView && (
            <Tooltip title="Meseläni görmek">
              <Button
                type="text"
                size="small"
                aria-label="Meseläni görmek"
                icon={<EyeOutlined className="text-blue-600" />}
                onClick={() => onView(record.id)}
              />
            </Tooltip>
          )}

          {canEdit && (
            <Tooltip title="Üýtgetmek">
              <Link to={`/problems/${record.id}`}>
                <EditOutlined className="text-slate-600 hover:text-blue-600" />
              </Link>
            </Tooltip>
          )}

          {canDelete && (
            <Popconfirm
              title="Meseläni pozmak isleýärsiňizmi?"
              description="Bu amal meseläni sanawdan aýrar."
              okText="Hawa"
              cancelText="Ýok"
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="Pozmak">
                <DeleteOutlined className="cursor-pointer text-red-500 hover:text-red-700" />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      ),
    });
  }

  return columns;
};
