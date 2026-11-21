import {
  getContestResultsApi,
  getProblemApi,
  getProblemsApi,
} from "./problemApi";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useGetProblems = (params = {}) =>
  useQuery({
    queryKey: ["problems", params],
    queryFn: () => getProblemsApi(params),
    // retry: false,
  });

const useGetProblem = (id, params = {}) =>
  useQuery({
    queryKey: ["problem", id, params],
    queryFn: () => getProblemApi(id, params),
    enabled: !!id,
  });

const useContestStatistics = (contestId, queryKey = {}) => {
  return useQuery({
    queryKey: ["statistics", contestId, queryKey],
    queryFn: () => getContestResultsApi(contestId, queryKey),
    enabled: !!contestId,
    // staleTime: 5000,
    // refetchOnWindowFocus: true,
  });
};

export { useGetProblem, useGetProblems, useContestStatistics };
