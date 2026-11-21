import { useMutation, useQuery } from "@tanstack/react-query";
import {
  exportContestResultsApi,
  getContestResultsApi,
} from "./contestResultsApi";
import toast from "react-hot-toast";

const useContestResults = (contestId) => {
  return useQuery({
    queryKey: ["contest-results", contestId],
    queryFn: () => getContestResultsApi(contestId),
    enabled: !!contestId,
    // staleTime: 5000,
    // refetchOnWindowFocus: true,
  });
};

const useExportContestResults = () => {
  return useMutation({
    mutationFn: exportContestResultsApi,
    onSuccess: () => {
      toast.success("Excel faýly üstünlikli ýüklendi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};
export { useContestResults, useExportContestResults };
