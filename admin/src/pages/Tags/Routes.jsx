import Page from "./Page";
import Create from "./Create";
import Update from "./Update";
import PermissionRoute from "../../ui/PermissionRoute";

const tagRoutes = {
  path: "tags",
  children: [
    // /sources
    {
      element: <PermissionRoute permission="get:tag" />,
      children: [
        {
          index: true,
          element: <Page />,
        },
      ],
    },

    {
      path: "new",
      element: <PermissionRoute permission="create:tag" />,
      children: [
        {
          index: true,
          element: <Create />,
        },
      ],
    },

    {
      path: ":id",
      element: <PermissionRoute permission="update:tag" />,
      children: [
        {
          index: true,
          element: <Update />,
        },
      ],
    },
  ],
};

export default tagRoutes;
