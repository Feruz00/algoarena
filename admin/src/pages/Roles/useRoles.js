import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createRoleApi,
  deleteRoleApi,
  deleteRolePermenantlyApi,
  deleteRolesApi,
  deleteRolesPermenantlyApi,
  getRoleApi,
  getRolesApi,
  restoreRoleApi,
  updateRoleApi,
} from "./rolesApi";

const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Ygtyýarlyk üstünlikli döredildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateRoleApi(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", data.id] });

      toast.success("Ygtyýarlygyň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRoleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Ygtyýarlygyň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteRolesApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Ygtyýarlyklaryň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetRole = (id) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => getRoleApi(id),
    enabled: !!id,
  });
};

const useGetRoles = (params) => {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => getRolesApi(params),
  });
};

const useDeleteRolePermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRolePermenantlyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Ygtyýarlygyň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteRolesPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteRolesPermenantlyApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Ygtyýarlyklaryň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRestoreRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreRoleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Ygtyýarlyk üstünlikli dikeldi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useCreateRole,
  useUpdateRole,
  useGetRole,
  useGetRoles,
  useDeleteRole,
  useDeleteRoles,
  useDeleteRolePermenantly,
  useDeleteRolesPermenantly,
  useRestoreRole,
};
