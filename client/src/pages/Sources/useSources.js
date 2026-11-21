import { useQuery } from "@tanstack/react-query";
import { getSourceApi, getSourcesApi } from "./sourceApi";

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

export { useGetSources, useGetSource };
