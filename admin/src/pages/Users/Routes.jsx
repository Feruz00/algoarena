import UsersPage from "./Page";
import CreatePage from "./Create";
import UpdatePage from "./Update";
import PermissionRoute from "../../ui/PermissionRoute";

const usersRoutes = {
  path: "users",
  children: [
    {
      element: <PermissionRoute permission="get:user" />,
      children: [
        {
          index: true,
          element: <UsersPage />,
        },
      ],
    },

    {
      path: "new",
      element: <PermissionRoute permission="create:user" />,
      children: [
        {
          index: true,
          element: <CreatePage />,
        },
      ],
    },

    {
      path: ":id",
      element: <PermissionRoute permission="update:user" />,
      children: [
        {
          index: true,
          element: <UpdatePage />,
        },
      ],
    },
  ],
};

export default usersRoutes;
