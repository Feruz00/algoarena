import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  createProblemApi,
  getProblemsApi,
  getProblemApi,
  updateProblemApi,
  deleteProblemApi,
  deleteProblemsApi,
  restoreProblemApi,
  deleteProblemPermanentlyApi,
  deleteProblemsPermanentlyApi,
} from "../api/problemsApi";

const useCreateProblem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createProblemApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Mesele üstünlikli döredildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useUpdateProblem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProblemApi(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      qc.invalidateQueries({ queryKey: ["problem", id] });
      toast.success("Meseläniň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useGetProblems = (params = {}) =>
  useQuery({
    queryKey: ["problems", params],
    queryFn: () => getProblemsApi(params),
  });

const useGetProblem = (id) =>
  useQuery({
    queryKey: ["problem", id],
    queryFn: () => getProblemApi(id),
    enabled: !!id,
  });

const useDeleteProblem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteProblemApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Mesele üstünlikli pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteProblems = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteProblemsApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Meseleler üstünlikli pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useRestoreProblem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: restoreProblemApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Mesele üstünlikli dikeldildi!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteProblemPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteProblemPermanentlyApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Mesele hemişelik pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useDeleteProblemsPermanently = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteProblemsPermanentlyApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Meseleler hemişelik pozuldy!");
    },
    onError: (err) => toast.error(err),
  });
};

export {
  useCreateProblem,
  useUpdateProblem,
  useGetProblems,
  useGetProblem,
  useDeleteProblem,
  useDeleteProblems,
  useRestoreProblem,
  useDeleteProblemPermanently,
  useDeleteProblemsPermanently,
};
