import { useTranslation } from "react-i18next";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router";
import { navigationItems } from "./layoutConfig";
import dayjs from "dayjs";
import useAuthStore from "../../store/authStore";
import { useMemo } from "react";

export default function AppSidebar({ onNavigate }) {
  const { t } = useTranslation();
  const user = useAuthStore((store) => store.user);
  // console.log(user);

  const items = useMemo(() => {
    // console.log(user);
    const permissions =
      user?.data?.role?.permissions?.map((row) => row.name) || [];

    return navigationItems.filter((row) =>
      permissions.includes(row.permission),
    );

    // return permissions;
  }, [user, navigationItems]);
  // console.log(items);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    [...items]
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) =>
        item.key === "/"
          ? location.pathname === "/"
          : location.pathname === item.key ||
            location.pathname.startsWith(`${item.key}/`),
      )?.key || "/";

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items.map((item) => ({
            key: item.key,
            icon: <item.icon />,
            label: t(item.labelKey),
          }))}
          onClick={({ key }) => {
            navigate(key);
            onNavigate?.();
          }}
          className="!border-none !bg-transparent"
        />
      </div>
      <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
        AlgoArena &copy; {dayjs().format("YYYY")}
      </div>
    </div>
  );
}
