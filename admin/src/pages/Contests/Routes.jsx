import Page from "./Page";
import CreatePage from "./CreatePage";
import UpdatePage from "./UpdatePage";
import PermissionRoute from "../../ui/PermissionRoute";
import ContestResultsPage from "../ContestResults/Page";

const contestsRoutes = {
  path: "contests",
  children: [
    {
      element: <PermissionRoute permission="get:contest" />,
      children: [
        {
          index: true,
          element: <Page />,
        },
      ],
    },

    {
      path: ":id/results",
      element: <PermissionRoute permission="get:contest" />,
      children: [
        {
          index: true,
          element: <ContestResultsPage />,
        },
      ],
    },

    {
      path: "new",
      element: <PermissionRoute permission="create:contest" />,
      children: [
        {
          index: true,
          element: <CreatePage />,
        },
      ],
    },

    {
      path: ":id",
      element: <PermissionRoute permission="update:contest" />,
      children: [
        {
          index: true,
          element: <UpdatePage />,
        },
      ],
    },
  ],
};

export default contestsRoutes;
