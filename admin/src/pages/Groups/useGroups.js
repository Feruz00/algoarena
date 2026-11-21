import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createGroupApi,
  deleteGroupApi,
  deleteGroupPermenantlyApi,
  deleteGroupsApi,
  deleteGroupsPermenantlyApi,
  exportGroupsApi,
  getGroupApi,
  getGroupsApi,
  importGroupsApi,
  restoreGroupApi,
  updateGroupApi,
} from "./groupsApi";

const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Topar üstünlikli döredildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateGroupApi(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", data.id] });

      toast.success("Toparyň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteGroupApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Toparyň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteGroupsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Toparlaryň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetGroup = (id) => {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupApi(id),
    enabled: !!id,
  });
};

const useGetGroups = (params) => {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: () => getGroupsApi(params),
  });
};

const useDeleteGroupPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteGroupPermenantlyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Toparyň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteGroupsPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteGroupsPermenantlyApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Toparlaryň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRestoreGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreGroupApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Topar üstünlikli dikeldi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useExportGroups = () => {
  return useMutation({
    mutationFn: exportGroupsApi,
    onSuccess: () => {
      toast.success("Excel faýly üstünlikli ýüklendi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useImportGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importGroupsApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(data?.message || "Excel üstünlikli import edildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useCreateGroup,
  useRestoreGroup,
  useUpdateGroup,
  useGetGroup,
  useGetGroups,
  useDeleteGroup,
  useDeleteGroups,
  useDeleteGroupPermenantly,
  useDeleteGroupsPermenantly,
  useExportGroups,
  useImportGroups,
};
