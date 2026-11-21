import {
  HomeOutlined,
  CodeOutlined,
  TrophyOutlined,
  SendOutlined,
  BarChartOutlined,
  TeamOutlined,
  UserOutlined,
  TagsOutlined,
  BookOutlined,
} from "@ant-design/icons";

export const navigationItems = [
  {
    key: "/",
    labelKey: "nav.home",
    icon: HomeOutlined,
    permission: "use:home",
  },
  {
    key: "/contests",
    labelKey: "nav.contests",
    icon: TrophyOutlined,
    permission: "use:contests",
  },

  {
    key: "/sources",
    labelKey: "nav.sources",
    icon: BookOutlined,
    permission: "use:sources",
  },
  {
    key: "/problems",
    labelKey: "nav.problems",
    icon: CodeOutlined,
    permission: "use:problems",
  },

  // {
  //   key: "/submissions",
  //   labelKey: "nav.submissions",
  //   icon: SendOutlined,
  //   permission: "use:showSubmission",
  // },
  // {
  //   key: "/rankings",
  //   labelKey: "nav.rankings",
  //   icon: BarChartOutlined,
  //   permission: "use:rating",
  // },
  // { key: "/groups", labelKey: "nav.groups", icon: TeamOutlined, permission:"" },
  // {
  //   key: "/users",
  //   labelKey: "nav.users",
  //   icon: UserOutlined,
  //   permission: "use:users",
  // },
  // {
  //   key: "/tags",
  //   labelKey: "nav.tags",
  //   icon: TagsOutlined,
  //   permission: "use:tags",
  // },
];
