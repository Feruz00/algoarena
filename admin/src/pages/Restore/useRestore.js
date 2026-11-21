import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deleteItem,
  deleteItems,
  getDeletedItems,
  restoreItem,
} from "./restoreApi";

const useGetDeletedItems = (params) => {
  return useQuery({
    queryKey: ["restore", params],
    queryFn: () => getDeletedItems(params),
  });
};

const useRestoreItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, key }) => restoreItem(id, key),
    onSuccess: () => {
      toast.success("Üstünlikli dikeldildi");
      queryClient.invalidateQueries({ queryKey: ["restore"] });
    },
    onError: (error) => {
      toast.error(error);
    },
  });
};

const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, key }) => deleteItem(id, key),
    onSuccess: () => {
      toast.success("Üstünlikli pozuldy");
      queryClient.invalidateQueries({ queryKey: ["restore"] });
    },
    onError: (error) => {
      toast.error(error);
    },
  });
};

const useDeleteItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => deleteItems(ids),
    onSuccess: () => {
      toast.success("Saýlanan elementler üstünlikli pozuldy");
      queryClient.invalidateQueries({ queryKey: ["restore"] });
    },
    onError: (error) => {
      toast.error(error);
    },
  });
};

export { useGetDeletedItems, useRestoreItem, useDeleteItem, useDeleteItems };
