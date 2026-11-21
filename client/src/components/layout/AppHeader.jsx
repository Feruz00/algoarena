import { useTranslation } from "react-i18next";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  BellOutlined,
  CodeOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import useAuthStore from "../../store/authStore";
import { useLogout } from "../../pages/Auth/useLogin";
import { useSocket } from "../../context/SocketContext";
import classNames from "classnames";
import { viewItem } from "../../utils/user";
import useNotification from "../../store/notification";

const { Text } = Typography;
const languages = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "tm", label: "Türkmençe" },
];

export default function AppHeader({ onOpenNavigation }) {
  const { t, i18n } = useTranslation();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const user = useAuthStore((store) => store.user);
  const notification = useNotification((st) => st.notification);

  const { mutate, isPending } = useLogout();

  const profileItems = [
    { key: "profile", icon: <UserOutlined />, label: t("header.profile") },
    viewItem("use:settings")
      ? {
          key: "settings",
          icon: <SettingOutlined />,
          label: t("header.settings"),
        }
      : {},

    viewItem("admin:access")
      ? {
          key: "adminside",
          icon: <AppstoreOutlined />,
          label: t("header.adminside"),
        }
      : {},

    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: t("header.logout"),
    },
  ];

  const handleLogout = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          navigate("/login");
        },
      },
    );
  };

  const handleAdmin = () => {
    window.location.href = "/admin";
  };
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <Button
          type="text"
          icon={<MenuOutlined />}
          aria-label={t("common.openMenu")}
          className="!flex !h-10 !w-10 !items-center !justify-center lg:!hidden"
          onClick={onOpenNavigation}
        />
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-slate-900 no-underline"
        >
          <CodeOutlined className="!text-3xl !text-blue-600" />
          <span className="hidden text-lg font-bold sm:inline">AlgoArena</span>
        </Link>
      </div>
      <Space size={12} className="!gap-1 sm:!gap-3">
        <Select
          aria-label={t("header.language")}
          value={i18n.language}
          options={languages}
          onChange={(language) => i18n.changeLanguage(language)}
          className="!w-[90px] sm:!w-[140px]"
          variant="borderless"
          popupMatchSelectWidth={false}
        />
        <Button
          type="text"
          aria-label={t("header.notifications")}
          title={t("header.notifications")}
          onClick={() => navigate("/notifications")}
          icon={
            <Badge dot={notification}>
              <BellOutlined className="!text-lg" />
            </Badge>
          }
        />
        <Dropdown
          trigger={["click"]}
          menu={{
            items: profileItems,
            onClick: ({ key }) => {
              if (key === "profile") navigate(`/users/${user.data.username}`);
              if (key === "settings") navigate("/profile/edit");
              if (key === "logout") handleLogout();
              if (key === "adminside") handleAdmin();
            },
          }}
        >
          <button className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent p-1">
            <Avatar
              icon={<UserOutlined />}
              className={classNames(
                "bg-blue-600! border-2!",
                connected ? "border-green-500!" : "border-red-500!",
              )}
            />
            <Text className="hidden max-w-32 truncate text-sm! md:block">
              {user.data.username}
            </Text>
          </button>
        </Dropdown>
      </Space>
    </header>
  );
}
