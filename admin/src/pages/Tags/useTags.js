import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getTagsApi,
  getTagApi,
  createTagApi,
  updateTagApi,
  deleteTagApi,
  deleteTagsApi,
  restoreTagApi,
  deleteTagPermanentlyApi,
  deleteTagsPermanentlyApi,
} from "./tagsApi";

const useGetTags = (params = {}) => {
  return useQuery({
    queryKey: ["tags", params],
    queryFn: () => getTagsApi(params),
  });
};

const useGetTag = (id) => {
  return useQuery({
    queryKey: ["tag", id],
    queryFn: () => getTagApi(id),
    enabled: !!id,
  });
};

const invalidateTags = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["tags"] });
  queryClient.invalidateQueries({ queryKey: ["tag"] });
};

const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTagApi,
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Tag üstünlikli döredildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTagApi(id, data),
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Tagyň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagApi,
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Tag üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagsApi,
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Saýlanan taglar üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRestoreTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreTagApi,
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Tag üstünlikli dikeldildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteTagPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagPermanentlyApi,
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Tag hemişelik pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteTagsPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagsPermanentlyApi,
    onSuccess: () => {
      invalidateTags(queryClient);
      toast.success("Saýlanan taglar hemişelik pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useGetTags,
  useGetTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useDeleteTags,
  useRestoreTag,
  useDeleteTagPermanently,
  useDeleteTagsPermanently,
};
