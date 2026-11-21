import http from "../../../utils/https";

const createTestCaseApi = (data = {}) =>
  http
    .post("/test-cases/", data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const getTestCasesApi = (params = {}) =>
  http
    .get("/test-cases/", { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));

const getTestCaseApi = (id) =>
  http
    .get(`/test-cases/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const updateTestCaseApi = (id, data = {}) =>
  http
    .patch(`/test-cases/${id}`, data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const updateTestCaseOrderApi = (groupId, data = {}) =>
  http
    .patch(`/test-cases/order/${groupId}`, data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestCaseApi = (id) =>
  http
    .delete(`/test-cases/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestCasesApi = (ids = []) =>
  http
    .delete("/test-cases/", { data: { ids }, withCredentials: true })
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const restoreTestCaseApi = (id) =>
  http
    .delete(`/test-cases/restore/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestCasePermanentlyApi = (id) =>
  http
    .delete(`/test-cases/permenantly/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestCasesPermanentlyApi = (ids = []) =>
  http
    .delete("/test-cases/permenantly/", {
      data: { ids },
      withCredentials: true,
    })
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

export {
  updateTestCaseOrderApi,
  createTestCaseApi,
  getTestCasesApi,
  getTestCaseApi,
  updateTestCaseApi,
  deleteTestCaseApi,
  deleteTestCasesApi,
  restoreTestCaseApi,
  deleteTestCasePermanentlyApi,
  deleteTestCasesPermanentlyApi,
};
