import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  createTestCaseApi,
  getTestCasesApi,
  getTestCaseApi,
  updateTestCaseApi,
  deleteTestCaseApi,
  deleteTestCasesApi,
  restoreTestCaseApi,
  deleteTestCasePermanentlyApi,
  deleteTestCasesPermanentlyApi,
  updateTestCaseOrderApi,
} from "../api/testCasesApi";

const invalidateTestCases = (qc) => {
  qc.invalidateQueries({ queryKey: ["test-cases"] });
  qc.invalidateQueries({ queryKey: ["test-groups"] });
};

const useCreateTestCase = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTestCaseApi,
    onSuccess: () => {
      invalidateTestCases(qc);
      toast.success("Test üstünlikli döredildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useUpdateTestCase = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTestCaseApi(id, data),
    onSuccess: (_, { id }) => {
      invalidateTestCases(qc);
      qc.invalidateQueries({ queryKey: ["test-case", id] });
      toast.success("Testiň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useGetTestCases = (params = {}) =>
  useQuery({
    queryKey: ["test-cases", params],
    queryFn: () => getTestCasesApi(params),
  });

const useGetTestCase = (id) =>
  useQuery({
    queryKey: ["test-case", id],
    queryFn: () => getTestCaseApi(id),
    enabled: !!id,
  });

const useDeleteTestCase = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestCaseApi,
    onSuccess: () => {
      invalidateTestCases(qc);
      toast.success("Test üstünlikli pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteTestCases = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestCasesApi,
    onSuccess: () => {
      invalidateTestCases(qc);
      toast.success("Testler üstünlikli pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useRestoreTestCase = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: restoreTestCaseApi,
    onSuccess: () => {
      invalidateTestCases(qc);
      toast.success("Test dikeldildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteTestCasePermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestCasePermanentlyApi,
    onSuccess: () => {
      invalidateTestCases(qc);
      toast.success("Test hemişelik pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteTestCasesPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTestCasesPermanentlyApi,
    onSuccess: () => {
      invalidateTestCases(qc);
      toast.success("Testler hemişelik pozuldy!");
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

const useUpdateTestCaseOrder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }) => updateTestCaseOrderApi(groupId, data),

    // Update the cache immediately; don't refetch.
    onMutate: async ({ data }) => {
      await qc.cancelQueries({
        queryKey: ["test-cases"],
      });

      const previousQueries = qc.getQueriesData({
        queryKey: ["test-cases"],
      });

      qc.setQueriesData({ queryKey: ["test-cases"] }, (old) =>
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
          "Testleriň ornuny üýtgetmek başartmady!",
      );
    },

    onSuccess: () => {
      toast.success("Testleriň orunlary üstünlikli üýtgedildi!");
    },
  });
};
export {
  useUpdateTestCaseOrder,
  useCreateTestCase,
  useUpdateTestCase,
  useGetTestCases,
  useGetTestCase,
  useDeleteTestCase,
  useDeleteTestCases,
  useRestoreTestCase,
  useDeleteTestCasePermanently,
  useDeleteTestCasesPermanently,
};
