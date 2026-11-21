import http from "../../../utils/https";

const createProblemApi = (data = {}) =>
  http
    .post("/problems/", data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const getProblemsApi = (params = {}) =>
  http
    .get("/problems/", { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));

const getProblemApi = (id) =>
  http
    .get(`/problems/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const updateProblemApi = (id, data = {}) =>
  http
    .patch(`/problems/${id}`, data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteProblemApi = (id) =>
  http
    .delete(`/problems/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteProblemsApi = (ids = []) =>
  http
    .delete("/problems/", { data: { ids }, withCredentials: true })
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const restoreProblemApi = (id) =>
  http
    .delete(`/problems/restore/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteProblemPermanentlyApi = (id) =>
  http
    .delete(`/problems/permenantly/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteProblemsPermanentlyApi = (ids = []) =>
  http
    .delete("/problems/permenantly/", {
      data: { ids },
      withCredentials: true,
    })
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

export {
  createProblemApi,
  getProblemsApi,
  getProblemApi,
  updateProblemApi,
  deleteProblemApi,
  deleteProblemsApi,
  restoreProblemApi,
  deleteProblemPermanentlyApi,
  deleteProblemsPermanentlyApi,
};
