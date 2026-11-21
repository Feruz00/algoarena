import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStatsApi,
  getRecentContestsApi,
  getRecentSubmissionsApi,
} from "./dashboardApi"; // adjust path

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsApi,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRecentContests = (params = { limit: 6 }) => {
  return useQuery({
    queryKey: ["dashboard-recent-contests", params],
    queryFn: () => getRecentContestsApi(params),
  });
};

export const useRecentSubmissions = (params = { limit: 8 }) => {
  return useQuery({
    queryKey: ["dashboard-recent-submissions", params],
    queryFn: () => getRecentSubmissionsApi(params),
  });
};
