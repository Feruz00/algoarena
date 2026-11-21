import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationsApi, updateApi } from "./notificationApi";
import toast from "react-hot-toast";

const useGetNotifications = (params) =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsApi(params),
  });

const useUpdateNotifications = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark notifications as read");
    },
  });
};

export { useGetNotifications, useUpdateNotifications };
