import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  createTestGroupApi,
  getTestGroupsApi,
  getTestGroupApi,
  updateTestGroupApi,
  deleteTestGroupApi,
  deleteTestGroupsApi,
  restoreTestGroupApi,
  deleteTestGroupPermanentlyApi,
  deleteTestGroupsPermanentlyApi,
  updateTestGroupOrderApi,
} from "../api/testGroupsApi";

const invalidateTestGroups = (qc) => {
  qc.invalidateQueries({ queryKey: ["test-groups"] });
  qc.invalidateQueries({ queryKey: ["test-cases"] });
};

const useCreateTestGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTestGroupApi,
    onSuccess: () => {
      invalidateTestGroups(qc);
      toast.success("Test topary üstünlikli döredildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useUpdateTestGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTestGroupApi(id, data),
    onSuccess: (_, { id }) => {
      invalidateTestGroups(qc);
      qc.invalidateQueries({ queryKey: ["test-group", id] });
      toast.success("Test topary üstünlikli üýtgedildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const reorderCachedGroups = (old, activeId, overId) => {
  if (!old) return old;

  if (Array.isArray(old)) {
    const activeIndex = old.findIndex(
      (item) => String(item.id) === String(activeId),
    );

    const overIndex = old.findIndex(
      (item) => String(item.id) === String(overId),
    );

    if (activeIndex === -1 || overIndex === -1) return old;

    const items = [...old];
    const [movedItem] = items.splice(activeIndex, 1);
    items.splice(overIndex, 0, movedItem);

    return items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
  }

  if (Array.isArray(old.data)) {
    return {
      ...old,
      data: reorderCachedGroups(old.data, activeId, overId),
    };
  }

  if (old.data && typeof old.data === "object") {
    return {
      ...old,
      data: reorderCachedGroups(old.data, activeId, overId),
    };
  }

  return old;
};

const useUpdateTestGroupOrder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ problemId, data }) =>
      updateTestGroupOrderApi(problemId, data),

    // Update the cache immediately; don't refetch.
    onMutate: async ({ data }) => {
      await qc.cancelQueries({
        queryKey: ["test-groups"],
      });

      const previousQueries = qc.getQueriesData({
        queryKey: ["test-groups"],
      });

      qc.setQueriesData({ queryKey: ["test-groups"] }, (old) =>
        reorderCachedGroups(old, data.activeId, data.overId),
      );

      return { previousQueries };
    },

    // Roll back if the server request fails.
    onError: (err, variables, context) => {
      context?.previousQueries?.forEach(([queryKey, oldData]) => {
        qc.setQueryData(queryKey, oldData);
      });

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Test toparynyň ornuny üýtgetmek başartmady!",
      );
    },

    onSuccess: () => {
      toast.success("Test toparynyň orunlary üstünlikli üýtgedildi!");
    },
  });
};

const useGetTestGroups = (params = {}) =>
  useQuery({
    queryKey: ["test-groups", params],
    queryFn: () => getTestGroupsApi(params),
  });

const useGetTestGroup = (id) =>
  useQuery({
    queryKey: ["test-group", id],
    queryFn: () => getTestGroupApi(id),
    enabled: !!id,
  });

const useDeleteTestGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestGroupApi,
    onSuccess: () => {
      invalidateTestGroups(qc);
      toast.success("Test topary üstünlikli pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteTestGroups = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestGroupsApi,
    onSuccess: () => {
      invalidateTestGroups(qc);
      toast.success("Test toparlary üstünlikli pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useRestoreTestGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: restoreTestGroupApi,
    onSuccess: () => {
      invalidateTestGroups(qc);
      toast.success("Test topary dikeldildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteTestGroupPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestGroupPermanentlyApi,
    onSuccess: () => {
      invalidateTestGroups(qc);
      toast.success("Test topary hemişelik pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteTestGroupsPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestGroupsPermanentlyApi,
    onSuccess: () => {
      invalidateTestGroups(qc);
      toast.success("Test toparlary hemişelik pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

export {
  useCreateTestGroup,
  useUpdateTestGroup,
  useGetTestGroups,
  useGetTestGroup,
  useDeleteTestGroup,
  useDeleteTestGroups,
  useRestoreTestGroup,
  useUpdateTestGroupOrder,
  useDeleteTestGroupPermanently,
  useDeleteTestGroupsPermanently,
};
