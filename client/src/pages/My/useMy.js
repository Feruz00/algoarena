import { useQuery } from "@tanstack/react-query";
import { getHomePageApi, getRegistrationsCount } from "./myApi";

const useGetRegistrationCount = (enabled) =>
  useQuery({
    queryKey: ["registration-count"],
    queryFn: () => getRegistrationsCount(),
    enabled,
  });

const useGetHome = (enabled) =>
  useQuery({
    queryKey: ["home"],
    queryFn: () => getHomePageApi(),
    enabled,
  });

export { useGetRegistrationCount, useGetHome };
