import http from "../../utils/https";

const getProblemsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get("/problems/client", { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

const getProblemApi = (id, params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/problems/client/${id}`, { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

const getContestResultsApi = (contestId, params) => {
  // console.log(contestId);
  return new Promise((resolve, reject) => {
    http
      .get(`/contest-results/${contestId}/client`, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export { getProblemApi, getProblemsApi, getContestResultsApi };
