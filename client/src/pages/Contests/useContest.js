import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContestApi,
  getContestProblemsApi,
  getContestsApi,
  registerToContestApi,
} from "./contestApi";
import toast from "react-hot-toast";

const useGetContests = (params = {}) =>
  useQuery({
    queryKey: ["contests", params],
    queryFn: () => getContestsApi(params),
    // retry: false,
  });

const useGetContestProblems = (id) =>
  useQuery({
    queryKey: ["contest-problems", id],
    queryFn: () => getContestProblemsApi(id),
    // retry: false,
  });

const useGetContest = (id) =>
  useQuery({
    queryKey: ["contest", id],
    queryFn: () => getContestApi(id),
    enabled: !!id,
  });

const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => registerToContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-count"] });
      toast.success("Bäsleşige registratsiýa edildiňiz!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};
export {
  useGetContest,
  useGetContests,
  useRegisterUser,
  useGetContestProblems,
};
