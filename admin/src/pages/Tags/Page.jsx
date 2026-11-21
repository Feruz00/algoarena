import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import Topbar from "../../components/Topbar";
import { useDeleteTags, useDeleteTag, useGetTags } from "./useTags";
import { viewItem } from "../../utils/user";
import ErrorPage from "../../components/ErrorPage";
import PageHeader from "../../components/PageHeader";

const { Text, Title } = Typography;

const formatDate = (date) => {
  if (!date) return "—";
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

export default function Page() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const searchValue = searchParams.get("title") || "";

  const [searchInput, setSearchInput] = useState(searchValue);
  const [selectedTag, setSelectedTag] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);

  const canCreate = viewItem("create:tag");
  const canDelete = viewItem("delete:tag");
  const canEdit = viewItem("update:tag");

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys: selectedRows,

    onChange: (selectedRowKeys, rows) => {
      setSelectedRows(rows.map((row) => row.id));
    },
    // getCheckboxProps: (record) => ({
    //   disabled: user?.data?.id === record.id,
    // }),
  };
  const params = useMemo(
    () => ({
      page,
      limit,
      sort,
      order,
      ...(searchValue.trim() ? { title: searchValue.trim() } : {}),
    }),
    [page, limit, sort, order, searchValue],
  );

  const {
    data: response,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isSuccess,
    isLoading,
  } = useGetTags(params);

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteTag();
  const { mutate: deleteItems, isPending: isDeleteTags } = useDeleteTags();

  const addQuery = (query) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(query).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const onChange = (page, limit) => {
    const newPage = limit !== pageSize ? 1 : page;

    addQuery({
      page: newPage,
      limit,
    });
  };
  const handleDelete = (id) => {
    deleteItem(id);
  };
  const deleteRowSelection = () => {
    deleteItems(selectedRows, {
      onSuccess: () => {
        setSelectedRows([]);
      },
    });
  };

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next);
  };

  const handleSearch = () => {
    updateParams({ title: searchInput.trim(), page: 1 });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    updateParams({
      page: pagination.current,
      limit: pagination.pageSize,
      sort: activeSorter?.order ? activeSorter.field : "createdAt",
      order: activeSorter?.order === "ascend" ? "asc" : "desc",
    });
  };

  const openDetails = (record) => {
    setSelectedTag(record);
    setDrawerOpen(true);
  };

  const closeDetails = () => {
    setDrawerOpen(false);
    setSelectedTag(null);
  };

  const columns = [
    {
      title: "T/b",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Türkmençe ady",
      dataIndex: "titleTm",
      key: "titleTm",
      sorter: true,
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Iňlisçe ady",
      dataIndex: "titleEn",
      key: "titleEn",
      sorter: true,
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Rusça ady",
      dataIndex: "titleRu",
      key: "titleRu",
      sorter: true,
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Döredilen wagty",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      width: 170,
      responsive: ["lg"],
      render: formatDate,
    },
    {
      title: "Sazlamalar",
      key: "actions",
      width: 145,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Giňişleýin görmek">
            <Button
              aria-label="Tag barada maglumat"
              icon={<EyeOutlined />}
              onClick={() => openDetails(record)}
            />
          </Tooltip>
          {canEdit && (
            <Tooltip title="Üýtgetmek">
              <Button
                aria-label="Tegy üýtgetmek"
                icon={<EditOutlined />}
                onClick={() => navigate(`/tags/${record.id}`)}
              />
            </Tooltip>
          )}

          {canDelete && (
            <Popconfirm
              title="Tegi pozmak isleýärsiňizmi?"
              description="Teg arhiwe geçiriler."
              okText="Hawa"
              cancelText="Ýok"
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="Pozmak">
                <Button
                  danger
                  aria-label="Tegy pozmak"
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    document.title = "Tegler | Judge";
  }, []);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader
        pageName="Tegler"
        isSuccess={isSuccess}
        filteredTagsCount={response?.count}
        btn={canCreate}
        btnName="Täze tegiň maglumatyny goş"
        btnHref="/tags/new"
        selectedRows={selectedRows}
        isDelete={isDeleteTags}
        deleteFn={deleteRowSelection}
      />
      <section className="p-2 bg-white rounded shadow mt-3">
        <div className="my-4 flex flex-col gap-2 sm:flex-row">
          <Input
            allowClear
            value={searchInput}
            placeholder="Tagyň adyny gözle..."
            prefix={<SearchOutlined />}
            onChange={(event) => setSearchInput(event.target.value)}
            onPressEnter={handleSearch}
            onClear={() => {
              setSearchInput("");
              updateParams({ title: null, page: 1 });
            }}
          />

          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Gözle
            </Button>
          </Space>
        </div>
        <Table
          loading={isFetching || isLoading}
          pagination={false}
          bordered={true}
          dataSource={response?.data || []}
          rowKey="id"
          columns={columns}
          onChange={handleTableChange}
          scroll={{
            x: "max-content",
            y: "350px",
          }}
          rowSelection={canDelete ? rowSelection : null}
        ></Table>
      </section>
      <div className="bg-white mt-3 py-2 px-3 rounded shadow ">
        <div className="flex flex-row items-center justify-end gap-2">
          <Pagination
            total={isSuccess ? response.count : 0}
            showSizeChanger
            pageSizeOptions={[20, 50, 75, 100, 200]}
            onChange={onChange}
            pageSize={limit}
            current={page}
          />
        </div>
      </div>
      <Drawer
        title="Teg barada giňişleýin maglumat"
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={closeDetails}
        destroyOnHidden
      >
        {selectedTag && (
          <div className="space-y-5">
            <div>
              <Text type="secondary">ID</Text>
              <div className="mt-1">
                <Tag color="blue">{selectedTag.id}</Tag>
              </div>
            </div>

            <div>
              <Text type="secondary">Türkmençe ady</Text>
              <div className="mt-1 wrap-break-word  font-medium">
                {selectedTag.titleTm || "—"}
              </div>
            </div>

            <div>
              <Text type="secondary">Iňlisçe ady</Text>
              <div className="mt-1 wrap-break-word  font-medium">
                {selectedTag.titleEn || "—"}
              </div>
            </div>

            <div>
              <Text type="secondary">Rusça ady</Text>
              <div className="mt-1 wrap-break-word font-medium">
                {selectedTag.titleRu || "—"}
              </div>
            </div>

            <div>
              <Text type="secondary">Döredilen wagty</Text>
              <div className="mt-1">{formatDate(selectedTag.createdAt)}</div>
            </div>

            <div>
              <Text type="secondary">Soňky üýtgedilen wagty</Text>
              <div className="mt-1">{formatDate(selectedTag.updatedAt)}</div>
            </div>

            <Button
              block
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                const id = selectedTag.id;
                closeDetails();
                navigate(`/tags/${id}`);
              }}
            >
              Tegy üýtget
            </Button>
          </div>
        )}
      </Drawer>
    </>
  );
}
