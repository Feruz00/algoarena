import useAuthStore from "../store/authStore";

const viewItem = (permission) => {
  const user = useAuthStore((state) => state.user);
  // console.log(user);
  const permissions =
    user.data?.role?.permissions?.map((row) => row.name) || [];
  return permissions.includes(permission);
};

export { viewItem };
