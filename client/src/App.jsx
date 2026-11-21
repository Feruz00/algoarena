import { useRoutes } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/Home/Page";
import ProblemsPage from "./pages/Problems/Page";
import ProblemDetailPage from "./pages/Problems/DetailPage";
import ContestsPage from "./pages/Contests/Page";
import SubmissionsPage from "./pages/Submissions/Page";
import RankingsPage from "./pages/Rankings/Page";
import GroupsPage from "./pages/Groups/Page";
import UsersPage from "./pages/Users/Page";
import ProfilePage from "./pages/Profile/Page";
import EditProfilePage from "./pages/Profile/EditPage";
import NotificationsPage from "./pages/Notifications/Page";
import TagsPage from "./pages/Tags/Page";
import SourcesPage from "./pages/Sources/Page";
import ContestDetailPage from "./pages/Contests/DetailPage";
import AuthLayout from "./pages/Auth/AuthLayout";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import ProtectedRoute from "./ui/ProtectedRoute";
import SourceDetailPage from "./pages/Sources/DetailPage";
import ProblemStatement from "./pages/Problems/ProblemStatement ";
import ProblemSubmissions from "./pages/Problems/ProblemSubmissions";
import ProblemStatistics from "./pages/Problems/ProblemStatistics";

function NotFound() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <div className="text-6xl font-bold text-blue-600">404</div>
      <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
      <a href="/" className="mt-4 text-blue-600">
        Return home
      </a>
    </div>
  );
}
export default function App() {
  return useRoutes([
    {
      element: <AuthLayout />,
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { path: "forgot-password", element: <ForgotPasswordPage /> },
        { path: "reset-password", element: <ResetPasswordPage /> },
      ],
    },
    {
      element: <ProtectedRoute></ProtectedRoute>,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: "problems", element: <ProblemsPage /> },
            {
              path: "problems/:problemId",
              element: <ProblemDetailPage />,
              children: [
                { index: true, element: <ProblemStatement /> },
                { path: "submissions", element: <ProblemSubmissions /> },
                { path: "statistics", element: <ProblemStatistics /> },
              ],
            },

            { path: "contests", element: <ContestsPage /> },
            { path: "contests/:id", element: <ContestDetailPage /> },
            {
              path: "contests/:id/problems/:problemId",
              element: <ProblemDetailPage />,
              children: [
                { index: true, element: <ProblemStatement /> },
                { path: "submissions", element: <ProblemSubmissions /> },
                { path: "statistics", element: <ProblemStatistics /> },
              ],
            },

            { path: "sources", element: <SourcesPage /> },
            { path: "sources/:id", element: <SourceDetailPage /> },
            {
              path: "sources/:id/problems/:problemId",
              element: <ProblemDetailPage />,
              children: [
                { index: true, element: <ProblemStatement /> },
                { path: "submissions", element: <ProblemSubmissions /> },
                { path: "statistics", element: <ProblemStatistics /> },
              ],
            },

            { path: "submissions", element: <SubmissionsPage /> },
            { path: "rankings", element: <RankingsPage /> },
            { path: "groups", element: <GroupsPage /> },
            { path: "users", element: <UsersPage /> },
            { path: "users/:handle", element: <ProfilePage /> },
            { path: "profile/edit", element: <EditProfilePage /> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "tags", element: <TagsPage /> },
            { path: "*", element: <NotFound /> },
          ],
        },
      ],
    },
  ]);
}
