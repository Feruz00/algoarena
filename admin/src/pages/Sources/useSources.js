import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createSourceApi,
  deleteSourceApi,
  deleteSourcePermenantlyApi,
  deleteSourcesApi,
  deleteSourcesPermenantlyApi,
  getSourceApi,
  getSourceParentsApi,
  getSourcesApi,
  restoreSourceApi,
  updateSourceApi,
} from "./sourcesApi";

const useGetSources = (params) => {
  return useQuery({
    queryKey: ["sources", params],
    queryFn: () => getSourcesApi(params),
  });
};

const useGetSource = (id) => {
  return useQuery({
    queryKey: ["source", id],
    queryFn: () => getSourceApi(id),
    enabled: !!id,
  });
};

const useGetSourceParents = (id) => {
  return useQuery({
    queryKey: ["source-parents", id],
    queryFn: () => getSourceParentsApi(id),
    enabled: !!id,
  });
};
const useDeleteSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSourceApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Çeşmäniň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteSources = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteSourcesApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Çeşmeleriň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteSourcePermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSourcePermenantlyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Çeşmäniň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteSourcesPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteSourcesPermenantlyApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Çeşmeleriň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRestoreSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreSourceApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Çeşme üstünlikli dikeldi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useCreateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSourceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Çeşme üstünlikli döredildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSourceApi(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["source", data.id] });

      toast.success("Çeşmäniň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useCreateSource,
  useUpdateSource,
  useGetSources,
  useDeleteSource,
  useDeleteSources,
  useDeleteSourcesPermenantly,
  useDeleteSourcePermenantly,
  useRestoreSource,
  useGetSource,
  useGetSourceParents,
};
