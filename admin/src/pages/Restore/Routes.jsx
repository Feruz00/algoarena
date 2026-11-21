import PermissionRoute from "../../ui/PermissionRoute";
import RestorePage from "./Page";
const restoreRoutes = {
  path: "restore",
  children: [
    {
      element: <PermissionRoute permission="restore:access" />,
      children: [
        {
          index: true,
          element: <RestorePage />,
        },
      ],
    },
  ],
};

export default restoreRoutes;
