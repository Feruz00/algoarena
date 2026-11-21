import http from "../../utils/https"; // same as your other APIs

const getDashboardStatsApi = () => {
  return new Promise((resolve, reject) => {
    http
      .get(`/dashboard/stats`)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

const getRecentContestsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/dashboard/recent-contests`, { params })
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

const getRecentSubmissionsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/dashboard/recent-submissions`, { params })
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

export { getDashboardStatsApi, getRecentContestsApi, getRecentSubmissionsApi };
