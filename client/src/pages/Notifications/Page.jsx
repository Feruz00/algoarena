import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Segmented,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { useTranslation } from "react-i18next";

import PageTitle from "../../components/ui/PageTitle";
import {
  useGetNotifications,
  useUpdateNotifications,
} from "./useNotifications";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import useNotification from "../../store/notification";
dayjs.extend(relativeTime);

const notificationConfig = {
  success: {
    icon: <CheckCircleOutlined />,
    color: "green",
    avatarClass: "!bg-green-100 !text-green-600",
  },
  error: {
    icon: <CloseCircleOutlined />,
    color: "red",
    avatarClass: "!bg-red-100 !text-red-600",
  },
  warning: {
    icon: <ExclamationCircleOutlined />,
    color: "gold",
    avatarClass: "!bg-yellow-100 !text-yellow-700",
  },
  info: {
    icon: <InfoCircleOutlined />,
    color: "blue",
    avatarClass: "!bg-blue-100 !text-blue-600",
  },
};

const getNotificationsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.notifications)) {
    return data.data.notifications;
  }
  if (Array.isArray(data?.notifications)) {
    return data.notifications;
  }
  return [];
};

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const setNotification = useNotification((state) => state.setNotification);
  const { isFetching, data, error, isError } = useGetNotifications();
  const { mutate, isPending } = useUpdateNotifications();

  const [filter, setFilter] = useState("all");
  const [readOverrides, setReadOverrides] = useState({});

  const language = i18n.language || "en";

  const titleField =
    {
      en: "titleEn",
      ru: "titleRu",
      tm: "titleTm",
    }[language] || "titleEn";

  const messageField =
    {
      en: "messageEn",
      ru: "messageRu",
      tm: "messageTm",
    }[language] || "messageEn";

  const notifications = useMemo(() => getNotificationsArray(data), [data]);

  const items = useMemo(
    () =>
      notifications.map((item) => ({
        ...item,
        title: item[titleField] || item.titleEn || "",
        text: item[messageField] || item.messageEn || "",
        isRead: readOverrides[item.id] ?? Boolean(item.read),
      })),
    [notifications, titleField, messageField, readOverrides],
  );

  const unreadCount = items.filter((item) => !item.isRead).length;

  const visible = useMemo(
    () =>
      items.filter((item) => {
        if (filter === "all") return true;
        if (filter === "unread") return !item.isRead;
        return item.type === filter;
      }),
    [items, filter],
  );

  useEffect(() => {
    return () => {
      mutate();
      setNotification(false);
    };
  }, []);
  const markRead = (id) => {
    setReadOverrides((previous) => ({
      ...previous,
      [id]: true,
    }));

    // Expected mutation payload: { id, read: true }.
    mutate(
      { id, read: true },
      {
        onSuccess: () => {
          message.success(
            t("notifications.markReadSuccess", {
              defaultValue: "Notification marked as read",
            }),
          );
        },
        onError: () => {
          setReadOverrides((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
          });

          message.error(
            t("notifications.markReadError", {
              defaultValue: "Failed to update notification",
            }),
          );
        },
      },
    );
  };

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <div className="space-y-5">
      <PageTitle title={t("notifications.title")} />

      <Card className="!rounded-xl" styles={{ body: { padding: 0 } }}>
        <div className="divide-y divide-slate-100">
          {visible.map((item) => {
            const config =
              notificationConfig[item.type] || notificationConfig.info;

            const relativeDate = item.createdAt
              ? dayjs(item.createdAt)
                  .locale(language === "ru" ? "ru" : "en")
                  .fromNow()
              : "";

            return (
              <div
                key={item.id}
                className={`flex gap-3 p-4 transition sm:gap-4 sm:px-5 ${
                  !item.isRead ? "bg-blue-50/40" : "bg-white"
                }`}
              >
                <Avatar
                  size={44}
                  icon={config.icon}
                  className={`shrink-0 !text-lg ${config.avatarClass}`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography.Text strong>{item.title}</Typography.Text>

                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <Typography.Paragraph className="!mb-2 !mt-1 !text-slate-600">
                    {item.text}
                  </Typography.Paragraph>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* <Tag color={config.color}>
                      {t(`notifications.types.${item.type}`, {
                        defaultValue:
                          item.type?.charAt(0).toUpperCase() +
                          item.type?.slice(1),
                      })}
                    </Tag> */}

                    <Typography.Text
                      type="secondary"
                      className="!text-xs"
                      title={
                        item.createdAt
                          ? dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")
                          : ""
                      }
                    >
                      {relativeDate}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            );
          })}

          {!visible.length && (
            <div className="p-10">
              <Empty description={t("common.noData")} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
