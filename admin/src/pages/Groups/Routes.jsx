import Page from "./Page";
import CreatePage from "./Create";
import UpdatePage from "./Update";
import PermissionRoute from "../../ui/PermissionRoute";

const groupsRoutes = {
  path: "groups",
  children: [
    {
      element: <PermissionRoute permission="get:group" />,
      children: [
        {
          index: true,
          element: <Page />,
        },
      ],
    },

    {
      path: "new",
      element: <PermissionRoute permission="create:group" />,
      children: [
        {
          index: true,
          element: <CreatePage />,
        },
      ],
    },

    {
      path: ":id",
      element: <PermissionRoute permission="update:group" />,
      children: [
        {
          index: true,
          element: <UpdatePage />,
        },
      ],
    },
  ],
};

export default groupsRoutes;
