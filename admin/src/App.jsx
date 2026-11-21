import { useRoutes } from "react-router";
import SocketProvider from "./context/SocketProvider";

import ProtectedRoute from "./ui/ProtectedRoute";
import AdminLayout from "./ui/AdminLayout";

import HomePage from "./pages/Home/Page";
import LoginPage from "./pages/Login/Page";
import NotFound from "./pages/NotFound";

import usersRoutes from "./pages/Users/Routes";
import ForbiddenPage from "./pages/ForbiddenPage";
import rolesRoutes from "./pages/Roles/Routes";
import groupsRoutes from "./pages/Groups/Routes";
import sourcesRoutes from "./pages/Sources/Routes";
import contestsRoutes from "./pages/Contests/Routes";
import problemRoutes from "./pages/Problems/Routes";
import tagRoutes from "./pages/Tags/Routes";
import restoreRoutes from "./pages/Restore/Routes";
import logsRoutes from "./pages/Logs/Routes";

const AppRoutes = () => {
  return useRoutes([
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: <HomePage />,
            },
            contestsRoutes,
            sourcesRoutes,
            usersRoutes,
            rolesRoutes,
            groupsRoutes,
            problemRoutes,
            tagRoutes,
            restoreRoutes,
            logsRoutes,
          ],
        },
      ],
    },

    {
      path: "login",
      element: <LoginPage />,
    },

    {
      path: "403",
      element: <ForbiddenPage />,
    },

    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};

const App = () => {
  return (
    <SocketProvider>
      <div className="min-h-screen">
        <AppRoutes />
      </div>
    </SocketProvider>
  );
};

export default App;
