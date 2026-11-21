import http from "../../utils/https";

const getContestsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get("/contests/client", { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

const getContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/contests/client/${id}`)
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

const getContestProblemsApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/contests/client/${id}/problems`)
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};
const registerToContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/client/${id}/register`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

export {
  getContestApi,
  getContestsApi,
  registerToContestApi,
  getContestProblemsApi,
};
