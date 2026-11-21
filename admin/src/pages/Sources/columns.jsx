import { Button, Input, Popconfirm } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import { HtmlParser } from "../../ui/HtmlParser";

export const getSourceColumns = ({
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  handleDelete,
  handleTitleReset,
  handleTitleSearch,
  handleSetView,
  title,
  canDelete,
  canEdit,
}) => [
  {
    title: "T/b",
    key: "index",
    fixed: "left",
    width: 50,
    render: (_, record, index) => (currentPage - 1) * pageSize + index + 1,
  },

  {
    title: "Sözbaşy",
    dataIndex: "titleTm",
    key: "titletm",
    fixed: "left",
    width: "10rem",
    sorter: true,
    sortOrder: sortField === "titleTm" ? sortOrder : null,

    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder="Sözbaşy gözle..."
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => {
            confirm();
            handleTitleSearch(selectedKeys[0] || "");
          }}
          className="mb-2 block"
        />

        <div className="flex gap-2 mt-3 flex-row items-center justify-between">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            onClick={() => {
              confirm();
              handleTitleSearch(selectedKeys[0] || "");
            }}
          >
            Gözle
          </Button>

          <Button
            size="small"
            onClick={() => {
              clearFilters();
              confirm();
              handleTitleReset();
            }}
          >
            Arassala
          </Button>
        </div>
      </div>
    ),

    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),

    filteredValue: title ? [title] : null,
  },

  {
    title: "Beýany",
    dataIndex: "theoryTm",
    key: "theoryTm",
    width: "20rem",
    render: (text) => (
      <p className=" line-clamp-3 max-w-full">
        <HtmlParser htmlString={text} />
      </p>
    ),
  },

  canDelete || canEdit
    ? {
        title: "Sazlamalar",
        key: "id",
        dataIndex: "id",
        fixed: "right",
        width: 100,

        render: (id) => (
          <div className="flex flex-row items-center gap-2">
            <EyeOutlined
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleSetView(id);
              }}
            />
            {canEdit && (
              <Link
                to={`/sources/${id}/edit`}
                onClick={(e) => e.stopPropagation()}
              >
                <EditOutlined />
              </Link>
            )}

            {canDelete && (
              <Popconfirm
                title="Siz hakykatdanam bu maglumaty pozmak isleýärsiňizmi?"
                okText="Hawa"
                cancelText="Ýok"
                onConfirm={() => handleDelete(id)}
              >
                <span
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeleteOutlined />
                </span>
              </Popconfirm>
            )}
          </div>
        ),
      }
    : null,
];
