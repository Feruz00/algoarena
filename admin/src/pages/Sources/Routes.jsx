import SourcesPage from "./Page";
import CreatePage from "./Create";
import UpdatePage from "./Update";
import PermissionRoute from "../../ui/PermissionRoute";

const sourcesRoutes = {
  path: "sources",
  children: [
    // /sources
    {
      element: <PermissionRoute permission="get:source" />,
      children: [
        {
          index: true,
          element: <SourcesPage />,
        },
      ],
    },

    // /sources/new
    // /sources/new?parentId=123
    {
      path: "new",
      element: <PermissionRoute permission="create:source" />,
      children: [
        {
          index: true,
          element: <CreatePage />,
        },
      ],
    },

    // /sources/:id
    // Show source + its children
    {
      path: ":id",
      element: <PermissionRoute permission="get:source" />,
      children: [
        {
          index: true,
          element: <SourcesPage />,
        },
      ],
    },

    // /sources/:id/edit
    {
      path: ":id/edit",
      element: <PermissionRoute permission="update:source" />,
      children: [
        {
          index: true,
          element: <UpdatePage />,
        },
      ],
    },
  ],
};

export default sourcesRoutes;
