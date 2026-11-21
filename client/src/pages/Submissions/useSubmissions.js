import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSubmissionsApi, sendSubmissionmApi } from "./submissionApi";

const useSendSubmission = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: sendSubmissionmApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Çözüw üstünlikli ugradyldy!");
    },
    onError: (err) => toast.error(err),
  });
};

const useGetSubmissions = (params = {}) =>
  useQuery({
    queryKey: ["submissions", params],
    queryFn: () => getSubmissionsApi(params),
    // retry: false,
  });

export { useSendSubmission, useGetSubmissions };
