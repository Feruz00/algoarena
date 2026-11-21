import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  blockUserAtContestApi,
  cancelToContestApi,
  cancelUsersToContestsManualApi,
  createContestApi,
  deleteContestApi,
  deleteContestPermenantlyApi,
  deleteContestsApi,
  deleteContestsPermenantlyApi,
  getContestApi,
  getContestsApi,
  getUsersByContestApi,
  registerToContestApi,
  registerUsersToContestsManualApi,
  restoreContestApi,
  startContestApi,
  stopContestApi,
  updateContestApi,
} from "./contestsApi";

const useCreateContest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşik üstünlikli döredildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateContests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateContestApi(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      queryClient.invalidateQueries({ queryKey: ["contest", data.id] });

      toast.success("Bäsleşigiň maglumatlary üstünlikli üýtgedildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useStartContest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => startContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşik üstünlikli başladyldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useStopContest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => stopContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşik üstünlikli togtadyldy!");
    },
    onError: (err) => {
      console.log(err);
      toast.error(err);
    },
  });
};

const useRegisterUserToContestManualy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => registerUsersToContestsManualApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-users"] });
      toast.success("Bäsleşige gatnaşyjy registratsiýa edildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => registerToContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-users"] });
      toast.success("Bäsleşige registratsiýa edildiňiz!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useCancelRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelToContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-users"] });
      toast.success("Registratsiýaňyz aýryldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};
const useCancelUserToContestManualy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => cancelUsersToContestsManualApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-users"] });
      toast.success("Bäsleşige gatnaşyjynyň registratsiýasy pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }) => blockUserAtContestApi(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest-users"] });
      toast.success("Gatnaşyjy bäsleşikden çetleşdirildi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetUsersByContest = (id, params) => {
  return useQuery({
    queryKey: ["contest-users", id, params],
    queryFn: () => getUsersByContestApi(id, params),
    enabled: !!id,
  });
};

const useGetContests = (params) => {
  return useQuery({
    queryKey: ["contests", params],
    queryFn: () => getContestsApi(params),
  });
};

const useGetContest = (id) => {
  return useQuery({
    queryKey: ["contest", id],
    queryFn: () => getContestApi(id),
    enabled: !!id,
  });
};

const useDeleteContest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşigiň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteContests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteContestsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşikleriň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteContestPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteContestPermenantlyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşigiň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteContestsPermenantly = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteContestsPermenantlyApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşikleriň maglumatlary üstünlikli pozuldy!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useRestoreContest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreContestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Bäsleşik üstünlikli dikeldi!");
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useDeleteContest,
  useDeleteContests,
  useCreateContest,
  useUpdateContests,
  useGetContest,
  useGetContests,
  useDeleteContestPermenantly,
  useDeleteContestsPermenantly,
  useRestoreContest,
  useGetUsersByContest,
  useRegisterUserToContestManualy,
  useRegisterUser,
  useStartContest,
  useStopContest,
  useBlockUser,
  useCancelRegisterUser,
  useCancelUserToContestManualy,
};
