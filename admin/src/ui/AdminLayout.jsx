import { useMemo, useState } from "react";
import { Layout, Menu, Tooltip, Avatar, Dropdown } from "antd";
import {
  FileTextOutlined,
  MailOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  TrophyOutlined,
  DatabaseOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  HomeOutlined,
  LogoutOutlined,
  BlockOutlined,
  TagOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router";
import useAuthStore from "../store/authStore";
import { useLogout } from "../pages/Login/useLogin";
import { viewItem } from "../utils/user";
import { useSocket } from "../context/SocketContext";
import classNames from "classnames";

const { Sider, Header, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const { isConnected } = useSocket();
  const user = useAuthStore((st) => st.user);
  // console.log(user);
  const { mutate: signout } = useLogout();

  const menu = [
    {
      key: "/",
      label: "Baş sahypa",
      icon: <HomeOutlined />,
    },

    {
      key: "/contests",
      label: "Bäsleşikler",
      icon: <TrophyOutlined />,
      permission: "get:contest",
    },

    {
      key: "/sources",
      label: "Çeşmeler",
      icon: <DatabaseOutlined />,

      permission: "get:source",
    },

    {
      key: "/problems",
      label: "Meseleler",
      icon: <QuestionCircleOutlined />,

      permission: "get:problem",
    },

    {
      key: "/groups",

      label: "Toparlar",
      icon: <BlockOutlined />,

      permission: "get:group",
    },
    {
      key: "/roles",
      label: "Ýgtyýarlyklar",
      icon: <SafetyOutlined />,

      permission: "get:role",
    },
    {
      key: "/users",
      label: "Ulanyjylar",
      icon: <UserOutlined />,

      permission: "get:user",
    },

    // {
    //   key: "/incoming-letters",
    //   label: "Gelen hatlar",
    //   icon: <MailOutlined />,
    // },
    {
      key: "/tags",
      label: "Tegler",
      icon: <TagOutlined />,

      permission: "get:tag",
    },
    {
      key: "/logs",
      label: "Ulgama edilen synanyşyklar",
      icon: <SafetyOutlined />,

      permission: "log:access",
    },
    {
      key: "/restore",
      label: "Bedre",
      icon: <DeleteOutlined />,
      permission: "restore:access",
    },
  ].filter((row) => !row.permission || viewItem(row.permission));

  const handleMenuClick = ({ key }) => {
    // Ignore parent submenu
    if (key === "application") {
      return;
    }

    navigate(key);
  };

  const logout = () => {
    signout(
      {},
      {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    );
  };

  const clientSide = () => {
    window.location.href = "/";
  };

  /*
   * User dropdown
   */
  const dropdownItems = [
    {
      key: "user",
      label: (
        <p className="font-semibold text-gray-800 m-0">
          {user?.data?.fullName}
        </p>
      ),
    },
    viewItem("client:access")
      ? {
          key: "client",
          label: (
            <p className="font-semibold text-gray-800 m-0">Client tarapa geç</p>
          ),
          onClick: clientSide,
        }
      : {},

    {
      key: "logout",
      label: (
        <p class="flex flex-row gap-2 items-center">
          <LogoutOutlined />
          <span>Ulgamdan çykmak</span>
        </p>
      ),
      danger: true,
      onClick: logout,
    },
  ];

  /*
   * Find selected menu item
   *
   * This also handles children like:
   * /logs
   * /categories
   */
  const selectedKey =
    menu
      .flatMap((item) => [item, ...(item.children || [])])
      .filter((item) => item.key.startsWith("/"))
      .filter(
        (item) =>
          location.pathname === item.key ||
          location.pathname.startsWith(`${item.key}/`),
      )
      .sort((a, b) => b.key.length - a.key.length)[0]?.key || "/";

  /*
   * Open submenu automatically when
   * current route is /logs or /categories
   */
  const defaultOpenKeys =
    location.pathname === "/logs" || location.pathname === "/categories"
      ? ["application"]
      : [];

  return (
    <Layout className="min-h-screen h-screen ">
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <Sider
        collapsible
        trigger={null}
        collapsed={collapsed}
        width={260}
        collapsedWidth={80}
        breakpoint="lg"
        className="min-h-screen shadow-lg"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center text-white text-xl font-bold border-b border-gray-700">
          {collapsed ? "" : "Çözgüt"}
        </div>

        {/* Navigation */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={defaultOpenKeys}
          items={menu}
          onClick={handleMenuClick}
          className="
            [&_.ant-menu-item]:mx-2
            [&_.ant-menu-item]:rounded-[10px]
            [&_.ant-menu-submenu]:mx-2
            [&_.ant-menu-submenu-title]:rounded-[10px]
          "
        />
      </Sider>

      {/* =========================================================
          MAIN LAYOUT
      ========================================================= */}
      <Layout>
        {/* =======================================================
            HEADER
        ======================================================= */}
        <Header
          className="
            bg-white!
            flex!
            justify-between!
            items-center!
            shadow-sm!
            px-4!
          "
        >
          {/* Sidebar Toggle */}
          <Tooltip title={collapsed ? "Expand Menu" : "Collapse Menu"}>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="
                border-0
                bg-transparent
                cursor-pointer
                text-xl
                text-gray-700
                flex
                items-center
                justify-center
              "
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </Tooltip>

          {/* User */}
          <Dropdown
            menu={{
              items: dropdownItems,
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button
              type="button"
              className="
                cursor-pointer
                flex
                items-center
                gap-3
                rounded-xl
                px-2
                py-1.5
                transition-all
                duration-200
                hover:bg-indigo-50
                border
                border-transparent
                hover:border-indigo-100
                bg-transparent
              "
            >
              {/* Avatar */}
              <Avatar
                size={35}
                className={classNames(
                  "border-2! bg-indigo-600 font-semibold",
                  isConnected ? "border-green-500!" : "border-red-500!",
                )}
              >
                {user?.data?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>

              {/* User Info */}
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="font-semibold text-gray-800">
                  {user?.data?.fullName}
                </span>
              </div>
            </button>
          </Dropdown>
        </Header>

        {/* =======================================================
            CONTENT
        ======================================================= */}
        <Content className="p-2 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>
          {/* <div className="min-h-[calc(100vh-100px)] h-full ">
          </div> */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
