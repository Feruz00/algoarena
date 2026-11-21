import { Navigate, Outlet } from "react-router";
import { useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useCurrentUser } from "../pages/Login/useLogin";
import useAuthStore from "../store/authStore";

function ProtectedRoute() {
  const { data: user, isLoading, isError } = useCurrentUser();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-500 text-5xl">
          <LoadingOutlined />
        </div>
      </div>
    );
  }
  // console.log(user);
  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  const permissions =
    user.data?.role?.permissions?.map((row) => row.name) ?? [];

  if (!permissions.includes("admin:access")) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
