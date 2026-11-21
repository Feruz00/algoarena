import PermissionRoute from "../../ui/PermissionRoute";
import CreateRole from "./Create";
import RolesPage from "./Page";
import UpdateRole from "./Update";

const rolesRoutes = {
  path: "roles",
  children: [
    {
      element: <PermissionRoute permission="get:role" />,
      children: [
        {
          index: true,
          element: <RolesPage />,
        },
      ],
    },

    {
      path: "new",
      element: <PermissionRoute permission="create:role" />,
      children: [
        {
          index: true,
          element: <CreateRole />,
        },
      ],
    },

    {
      path: ":id",
      element: <PermissionRoute permission="update:role" />,
      children: [
        {
          index: true,
          element: <UpdateRole />,
        },
      ],
    },
  ],
};

export default rolesRoutes;
