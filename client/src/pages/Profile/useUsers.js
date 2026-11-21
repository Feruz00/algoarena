import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { changePasswordApi, getUsernameApi, updateMyDataApi } from "./userApi";

const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (data) => {
      toast.success("Password changed successfully!");
      return data;
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateMyData = () => {
  return useMutation({
    mutationFn: updateMyDataApi,
    onSuccess: (data) => {
      console.log(data);
      toast.success("Data updated successfully!");
      return data;
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetProfile = (username) => {
  return useQuery({
    queryFn: () => getUsernameApi(username),
    queryKey: ["profile", username],
    enabled: !!username,
  });
};

export { useChangePassword, useUpdateMyData, useGetProfile };
