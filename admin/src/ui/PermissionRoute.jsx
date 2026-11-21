import { Navigate, Outlet, useLocation } from "react-router";

import { hasPermission } from "../utils/permissions";
import useAuthStore from "../store/authStore";

const PermissionRoute = ({ permission }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const allowed = hasPermission(
    user.data?.role?.permissions?.map((row) => row.name) || [],
    permission,
  );

  if (!allowed) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PermissionRoute;
