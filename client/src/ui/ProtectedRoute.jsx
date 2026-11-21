import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import useAuthStore from "../store/authStore";
import { useCurrentUser } from "../pages/Auth/useLogin";
import useNotification from "../store/notification";

function ProtectedRoute() {
  const setUser = useAuthStore((state) => state.setUser);
  const userData = useAuthStore((state) => state.user);
  const setNotification = useNotification((state) => state.setNotification);
  const { data: user, isLoading, isError } = useCurrentUser(userData);
  const location = useLocation();

  useEffect(() => {
    // console.log(userData);
    setNotification(user?.data?.notification || false);
    // setNotification(userData?.data?.notification || false);
    // if (userData) return;
    if (user) {
      setUser(user);
    }
    // console.log(user);
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-500 text-5xl ">
          <LoadingOutlined />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }
  if (
    !userData.data?.role?.permissions
      ?.map((row) => row.name)
      .includes("client:access")
  ) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
