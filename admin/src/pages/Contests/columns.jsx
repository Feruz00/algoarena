import { Button, Input, Popconfirm, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  LoadingOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import dayjs from "dayjs";

export const getContestColumns = ({
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  title,
  handleTitleSearch,
  handleTitleReset,
  handleStartContest,
  handleStopContest,
  isStartContest,
  isStopContest,
  handleDelete,
  canEdit,
  canDelete,
  handleSetView,
  navigate,
  handleExport,
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
    dataIndex: "title",
    key: "title",
    fixed: "left",
    width: "20rem",
    sorter: true,
    sortOrder: sortField === "title" ? sortOrder : null,

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
    title: "Başlanýan wagty",
    dataIndex: "startTime",
    key: "startTime",
    render: (t) =>
      t ? (
        dayjs(t).format("DD/MM/YYYY HH:mm")
      ) : (
        <Tag variant="solid" color="warning">
          Kesgitlemedik
        </Tag>
      ),
    sorter: true,
    sortOrder: sortField === "startTime" ? sortOrder : null,
  },
  {
    title: "Dowamlylygy(minut)",
    dataIndex: "duration",
    key: "duration",
    sorter: true,
    sortOrder: sortField === "duration" ? sortOrder : null,
    render: (t, record) =>
      record.startTime ? (
        <div className="flex flex-col gap-1">
          <span>{t}</span>
          <span>
            Tamamlanýa:{" "}
            {dayjs(new Date(record.startTime))
              .add(t, "minute")
              .format("DD/MM/YYYY HH:mm")}
          </span>
        </div>
      ) : (
        t
      ),
  },

  // {
  //   title: "Reýting berilmegi",
  //   dataIndex: "rating",
  //   key: "rating",
  //   render: (t) => (
  //     <Tag variant="solid" color={t ? "success" : "error"}>
  //       {t ? "Hawa" : "Ýok"}
  //     </Tag>
  //   ),
  // },

  {
    title: "Umumylygy",
    dataIndex: "public",
    key: "public",
    render: (t) => (
      <Tag variant="solid" color={t ? "blue" : "volcano"}>
        {t ? "Hemme üçin" : "Degişli toparlar üçin"}
      </Tag>
    ),
  },
  {
    title: "Jogapkärler",
    dataIndex: "users",
    key: "users",
    render: (t) =>
      t?.length > 0 ? t.map((row) => row.username).join(", ") : "------",
  },
  // {
  //   title: "Test barlag",
  //   dataIndex: "fullTest",
  //   key: "fullTest",
  //   render: (t) =>
  //     t ? "Hemme test bir wagtda barlanýar" : "Bölek test barlagy",
  // },
  canDelete || canEdit
    ? {
        title: "Sazlamalar",
        key: "id",
        dataIndex: "id",
        fixed: "right",
        width: 75,

        render: (id, record) => (
          <div className="flex flex-row items-center gap-2">
            {(record.status === "scheduled" ||
              record.status === "finished") && (
              <Tooltip title="Bäsleşigi başlamak">
                <Popconfirm
                  title="Siz hakykatdanam bäsleşigi başlatmakçymy?"
                  okText="Hawa"
                  cancelText="Ýok"
                  onConfirm={() => handleStartContest(id)}
                  placement={"left"}
                >
                  {record.status === "finished" ? (
                    <ReloadOutlined className="text-orange-500 cursor-pointer hover:scale-110 transition" />
                  ) : (
                    <PlayCircleOutlined className="text-green-500 cursor-pointer hover:scale-110 transition" />
                  )}
                </Popconfirm>
              </Tooltip>
            )}
            {record.status === "running" && (
              <Tooltip title="Bäsleşigi duruzmak">
                <Popconfirm
                  title="Siz hakykatdanam bäsleşigi duruzmakçymy?"
                  okText="Hawa"
                  cancelText="Ýok"
                  placement={"left"}
                  onConfirm={() => handleStopContest(id)}
                >
                  <PauseOutlined className="text-green-500 cursor-pointer hover:scale-110 transition" />
                </Popconfirm>
              </Tooltip>
            )}
            {(record.status === "running" || record.status === "finished") && (
              <Tooltip title="Netijeleri görmek">
                <TrophyOutlined
                  className="text-yellow-500 cursor-pointer hover:scale-110 transition"
                  onClick={
                    () => {
                      navigate(`${record.id}/results`);
                    }
                    //   navigate(`/manager/events/${record.id}/results`)
                  }
                />
              </Tooltip>
            )}

            {record.status === "finished" && (
              <Tooltip title="Netijeleri excel geçirmek">
                <FileExcelOutlined
                  className="text-green-500 cursor-pointer hover:scale-110 transition"
                  onClick={
                    () => handleExport(record.id)
                    //   navigate(`/manager/events/${record.id}/results`)
                  }
                />
              </Tooltip>
            )}
            {(record.status === "scheduled" ||
              record.status === "finished") && (
              <Tooltip title="Bäsleşige gatnaşyjylar">
                <UserSwitchOutlined
                  className="text-yellow-500 cursor-pointer hover:scale-110 transition"
                  onClick={() => {
                    handleSetView(record);
                  }}
                />
              </Tooltip>
            )}

            {canEdit && record.author && record.status !== "finished" && (
              <Tooltip title="Maglumaty üýtgetmek">
                <Link to={`/contests/${id}/`}>
                  <EditOutlined />
                </Link>
              </Tooltip>
            )}

            {canDelete && record.author && (
              <Popconfirm
                title="Siz hakykatdanam bu maglumaty pozmak isleýärsiňizmi?"
                okText="Hawa"
                cancelText="Ýok"
                onConfirm={() => handleDelete(id)}
              >
                <Tooltip title="Maglumaty pozmak">
                  <DeleteOutlined />
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        ),
      }
    : null,
];
