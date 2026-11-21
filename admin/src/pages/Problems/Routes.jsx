import Page from "./Page";
import CreatePage from "./Create";
import UpdatePage from "./Update";
import PermissionRoute from "../../ui/PermissionRoute";

const problemRoutes = {
  path: "problems",
  children: [
    // /problem
    {
      element: <PermissionRoute permission="get:problem" />,
      children: [
        {
          index: true,
          element: <Page />,
        },
      ],
    },
    {
      path: "new",
      element: <PermissionRoute permission="create:problem" />,
      children: [
        {
          index: true,
          element: <CreatePage />,
        },
      ],
    },

    {
      path: ":id",
      element: <PermissionRoute permission="update:problem" />,
      children: [
        {
          index: true,
          element: <UpdatePage />,
        },
      ],
    },
  ],
};

export default problemRoutes;
