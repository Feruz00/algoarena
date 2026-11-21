import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createUserApi,
  deleteUserApi,
  deleteUserPermenantlyApi,
  deleteUsersApi,
  deleteUsersPermenantlyApi,
  exportUsersApi,
  getUserApi,
  getUsersApi,
  importUsersApi,
  restoreUserApi,
  updatePasswordsByExcelApi,
  updateUserApi,
} from "./usersApi";

const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Ulanyjy üstünlikli döredildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUserApi(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });

      toast.success("Ulanyjynyň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUserApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Ulanyjynyň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteUsersApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Ulanyjylaryň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetUser = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserApi(id),
    enabled: !!id,
  });
};

const useGetUsers = (params) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsersApi(params),
  });
};

const useDeleteUserPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUserPermenantlyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Ulanyjynyň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteUsersPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteUsersPermenantlyApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Ulanyjylaryň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreUserApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Ulanyjy üstünlikli dikeldi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdatePasswordsByExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePasswordsByExcelApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data?.message || "Parollar üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};
const useExportUsers = () => {
  return useMutation({
    mutationFn: exportUsersApi,
    onSuccess: () => {
      toast.success("Excel faýly üstünlikli ýüklendi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useImportUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importUsersApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data?.message || "Excel üstünlikli import edildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useExportUsers,
  useImportUsers,
  useUpdatePasswordsByExcel,
  useCreateUser,
  useRestoreUser,
  useUpdateUser,
  useGetUser,
  useGetUsers,
  useDeleteUser,
  useDeleteUsers,
  useDeleteUserPermenantly,
  useDeleteUsersPermenantly,
};
