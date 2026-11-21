import { useMutation, useQuery } from "@tanstack/react-query";
import { currentUserApi, loginApi, logoutApi } from "./loginApi";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import useNotification from "../../store/notification";

const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setNotification = useNotification((st) => st.setNotification);

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // console.log(data);
      // console.log(data);
      setUser(data);
      setNotification(data.data.notification || false);

      toast.success("User logged in successfully!");
      return data;
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useLogout = () => {
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      toast.success("User logget out successfully!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useCurrentUser = (user) => {
  return useQuery({
    queryFn: currentUserApi,
    queryKey: ["current-user"],
    enabled: !!user,
  });
};

export { useLogin, useLogout, useCurrentUser };
